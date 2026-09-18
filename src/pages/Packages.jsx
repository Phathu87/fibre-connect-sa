import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, Search } from 'lucide-react';
import PackageCard from '@/components/PackageCard';
import FilterPanel from '@/components/packages/FilterPanel';
import { packageService } from '@/services/packageService';
import { useIsMobile } from '@/hooks/use-mobile';
import { events } from '@/services/analyticsService';

const SORTS = [
  ['recommended', 'Recommended'], ['lowest-price', 'Lowest price'], ['highest-speed', 'Highest speed'],
  ['best-value', 'Best value'], ['most-popular', 'Most popular'], ['newest', 'Newest offer'],
];

/**
 * @typedef {Object} PackageFilters
 * @property {string[]=} connectivityType
 * @property {string[]=} providerId
 * @property {string[]=} networkId
 * @property {boolean=} uncapped
 * @property {boolean=} routerIncluded
 * @property {boolean=} promotional
 * @property {number=} contractMonths
 * @property {string=} classification
 * @property {number=} minSpeed
 * @property {number=} maxPrice
 * @property {string=} search
 */

export default function Packages() {
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState(/** @type {PackageFilters} */ ({}));
  const [sort, setSort] = useState('recommended');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, hasMore: false });
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [options, setOptions] = useState({ providers: [], networks: [], connectivityTypes: [] });
  const isMobile = useIsMobile();

  useEffect(() => { packageService.filterOptions().then(setOptions); }, []);

  // read initial filters from URL (provider/network from provider pages)
  useEffect(() => {
    const p = params.get('provider');
    const n = params.get('network');
    const t = params.get('type');
    const minSpeed = params.get('minSpeed');
    const maxPrice = params.get('maxPrice');
    const init = /** @type {PackageFilters} */ ({});
    if (p) init.providerId = [p];
    if (n) init.networkId = [n];
    if (t) init.connectivityType = [t];
    if (minSpeed) init.minSpeed = Number(minSpeed);
    if (maxPrice) init.maxPrice = Number(maxPrice);
    if (Object.keys(init).length) setFilters(init);
  }, []);

  const fetch = () => {
    setLoading(true);
    events.packageFilterApplied(filters);
    packageService.list(filters, sort, page).then(res => {
      setData(res);
      setLoading(false);
    });
  };

  useEffect(() => { fetch(); }, [filters, sort, page]);

  const activeChips = useMemo(() => {
    const chips = /** @type {Array<[keyof PackageFilters, string]>} */ ([]);
    (filters.connectivityType || []).forEach(v => chips.push(['connectivityType', v]));
    (filters.providerId || []).forEach(v => chips.push(['providerId', v]));
    (filters.networkId || []).forEach(v => chips.push(['networkId', v]));
    if (filters.uncapped) chips.push(['uncapped', 'Uncapped']);
    if (filters.routerIncluded) chips.push(['routerIncluded', 'Router incl.']);
    if (filters.promotional) chips.push(['promotional', 'Promo']);
    if (filters.contractMonths === 0) chips.push(['contractMonths', 'Month-to-month']);
    if (filters.classification) chips.push(['classification', filters.classification]);
    if (filters.minSpeed) chips.push(['minSpeed', `${filters.minSpeed}Mbps+`]);
    if (filters.maxPrice) chips.push(['maxPrice', `≤R${filters.maxPrice}`]);
    return chips;
  }, [filters]);

  const clearAll = () => { setFilters({}); setPage(1); setParams({}); };
  /** @param {[keyof PackageFilters, string]} chip */
  const removeChip = ([key, val]) => {
    if (['connectivityType', 'providerId', 'networkId'].includes(key)) {
      setFilters(f => {
        const current = key === 'connectivityType'
          ? f.connectivityType
          : key === 'providerId'
            ? f.providerId
            : f.networkId;
        return { ...f, [key]: (current || []).filter(v => v !== val) };
      });
    } else {
      setFilters(f => { const n = { ...f }; delete n[key]; return n; });
    }
  };

  const FilterContent = (
    <FilterPanel filters={filters} setFilters={f => { setFilters(f); setPage(1); }} options={options} />
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="mb-4">
        <h1 className="text-2xl font-extrabold leading-tight md:text-3xl">Broadband packages</h1>
        <p className="mt-1 text-sm text-muted-foreground">Browse and compare fibre, 5G and LTE packages across South African providers.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* desktop sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display font-bold">Filters</h2>
              {activeChips.length > 0 && <button onClick={clearAll} className="text-xs text-brand hover:underline">Clear all</button>}
            </div>
            {FilterContent}
          </div>
        </aside>

        <div>
          {/* search + sort + mobile filter trigger */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={filters.search || ''} onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }} placeholder="Search packages…" className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-brand" />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setDrawerOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium lg:hidden">
                <SlidersHorizontal className="h-4 w-4" /> Filters {activeChips.length > 0 && `(${activeChips.length})`}
              </button>
              <select value={sort} onChange={e => { setSort(e.target.value); events.packageSortChanged(e.target.value); }} className="h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-brand">
                {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* active chips */}
          {activeChips.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {activeChips.map((chip, i) => (
                <span key={i} className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs">
                  {chip[1]}
                  <button onClick={() => removeChip(chip)} aria-label="Remove filter"><X className="h-3 w-3" /></button>
                </span>
              ))}
              <button onClick={clearAll} className="text-xs text-brand hover:underline">Clear all</button>
            </div>
          )}

          <p className="mb-3 text-sm font-medium" aria-live="polite">{loading ? 'Loading…' : `${data.total} package${data.total !== 1 ? 's' : ''} found`}</p>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-xl border border-border bg-muted/40" />)}
            </div>
          ) : data.items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <p className="font-display text-lg font-bold">No packages match your filters</p>
              <p className="mt-1 text-sm text-muted-foreground">Try removing some filters or broadening your search.</p>
              <button onClick={clearAll} className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">Clear all filters</button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {data.items.map(p => <PackageCard key={p.id} pkg={p} />)}
              </div>
              {data.hasMore && (
                <div className="mt-6 text-center">
                  <button onClick={() => setPage(p => p + 1)} className="rounded-lg border border-border px-6 py-2.5 text-sm font-semibold hover:bg-muted">Load more</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* mobile filter drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-card p-4 safe-bottom">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Filters</h2>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            {FilterContent}
            <div className="mt-4 flex gap-2">
              <button onClick={clearAll} className="flex-1 rounded-lg border border-border py-3 text-sm font-medium">Clear all</button>
              <button onClick={() => setDrawerOpen(false)} className="flex-1 rounded-lg bg-brand py-3 text-sm font-semibold text-white">Show {data.total} results</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
