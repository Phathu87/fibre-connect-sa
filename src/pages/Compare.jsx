import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, GitCompare, ArrowRight, Star, PiggyBank } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProviderLogo from '@/components/ui/ProviderLogo';
import { useCompare } from '@/hooks/useCollections';
import { packageService } from '@/services/packageService';
import { useIsMobile } from '@/hooks/use-mobile';
import { events } from '@/services/analyticsService';

const ROWS = [
  { key: 'provider', label: 'Provider', get: p => p.provider?.name },
  { key: 'network', label: 'Network', get: p => p.network?.name },
  { key: 'connectivity', label: 'Type', get: p => p.connectivityType },
  { key: 'download', label: 'Download', get: p => `${p.downloadMbps} Mbps` },
  { key: 'upload', label: 'Upload', get: p => `${p.uploadMbps} Mbps` },
  { key: 'monthly', label: 'Monthly price', get: p => `R${p.promotionalPrice || p.monthlyPrice}`, highlight: true },
  { key: 'yearly', label: 'Yearly cost', get: p => `R${(p.promotionalPrice || p.monthlyPrice) * 12}`, highlight: true },
  { key: 'promo', label: 'Promo price', get: p => p.promotionalPrice ? `R${p.promotionalPrice}` : '—' },
  { key: 'install', label: 'Installation', get: p => p.installationFee === 0 ? 'Free' : `R${p.installationFee}` },
  { key: 'router', label: 'Router', get: p => p.routerIncluded ? 'Included' : 'Not included' },
  { key: 'contract', label: 'Contract', get: p => p.contractMonths === 0 ? 'Month-to-month' : `${p.contractMonths} months` },
  { key: 'data', label: 'Data', get: p => p.uncapped ? 'Uncapped' : `${p.dataAllowanceGb}GB` },
  { key: 'fup', label: 'Fair usage', get: p => p.fairUsagePolicy },
  { key: 'activation', label: 'Activation', get: p => p.activationEstimate },
  { key: 'useCase', label: 'Best for', get: p => p.bestUseCase },
  { key: 'rating', label: 'Rating', get: p => p.rating ? `${p.rating}★ (${p.reviewCount})` : '—' },
];

export default function Compare() {
  const { ids, remove, clear } = useCompare();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (ids.length === 0) { setPackages([]); setLoading(false); return; }
    setLoading(true);
    packageService.listAll().then(all => {
      setPackages(all.filter(p => ids.includes(p.id)));
      setLoading(false);
      events.comparisonViewed(ids);
    });
  }, [ids]);

  if (loading) return <div className="mx-auto max-w-6xl px-4 py-10"><div className="h-60 animate-pulse rounded-xl border border-border bg-muted/40" /></div>;

  if (packages.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <GitCompare className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-extrabold">No packages selected to compare</h1>
        <p className="mt-2 text-muted-foreground">Add 2 to 4 packages using the compare toggle on any package card.</p>
        <Link to="/packages" className="mt-4 inline-flex rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white">Browse packages</Link>
      </div>
    );
  }

  const minPrice = Math.min(...packages.map(p => p.promotionalPrice || p.monthlyPrice));
  const maxSpeed = Math.max(...packages.map(p => p.downloadMbps));

  // Yearly cost + savings
  const yearlyCosts = packages.map(p => ({ id: p.id, yearly: (p.promotionalPrice || p.monthlyPrice) * 12 }));
  const maxYearly = Math.max(...yearlyCosts.map(y => y.yearly));
  const minYearly = Math.min(...yearlyCosts.map(y => y.yearly));
  const bestYearly = yearlyCosts.find(y => y.yearly === minYearly);
  const bestPackage = packages.find(p => p.id === bestYearly.id);
  const yearlySavings = maxYearly - minYearly;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold leading-tight md:text-3xl">Compare packages</h1>
          <p className="mt-1 text-sm text-muted-foreground">{packages.length} of 4 selected. Best price and fastest speed are highlighted.</p>
        </div>
        <button onClick={clear} className="text-sm text-brand hover:underline">Clear all</button>
      </div>

      {/* Yearly savings highlight */}
      {packages.length >= 2 && (
        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-success/30 bg-success/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-success/10 p-2"><PiggyBank className="h-5 w-5 text-success" /></div>
            <div>
              <p className="text-sm font-semibold">Best yearly deal: {bestPackage.name}</p>
              <p className="text-xs text-muted-foreground">
                At <span className="font-medium text-foreground">R{minYearly.toLocaleString()}/year</span> you save{' '}
                <span className="font-semibold text-success">R{yearlySavings.toLocaleString()}/year</span> versus the most expensive option here.
              </p>
            </div>
          </div>
          <Link to={`/enquire?package=${bestPackage.slug}`} className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-success px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 whitespace-nowrap sm:w-auto">
            Choose this deal <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {packages.length < 2 && (
        <div className="mb-4 rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm text-warning">
          Add at least one more package to compare features side by side. <Link to="/packages" className="underline font-medium">Browse packages</Link>
        </div>
      )}

      {isMobile ? (
        /* Mobile: stacked card switching */
        <div>
          <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">
            {packages.map((p, i) => (
              <button key={p.id} onClick={() => setActiveIdx(i)} className={cn('flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap', i === activeIdx ? 'border-brand bg-brand/10 text-brand' : 'border-border')}>
                <ProviderLogo provider={p.provider} size="sm" /> {p.provider?.name}
              </button>
            ))}
          </div>
          {(() => {
            const p = packages[activeIdx];
            return (
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <ProviderLogo provider={p.provider} size="lg" />
                    <div>
                      <p className="font-display font-bold">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.provider?.name} · {p.connectivityType}</p>
                    </div>
                  </div>
                  <button onClick={() => remove(p.id)} aria-label="Remove"><X className="h-5 w-5 text-muted-foreground" /></button>
                </div>
                <div className="mt-4 divide-y divide-border">
                  {ROWS.map(r => {
                    const isCheapestYearly = r.key === 'yearly' && (p.promotionalPrice || p.monthlyPrice) * 12 === minYearly;
                    return (
                    <div key={r.key} className="flex justify-between gap-3 py-2.5 text-sm">
                      <span className="text-muted-foreground">{r.label}</span>
                      <span className={cn('text-right font-medium', isCheapestYearly && 'text-success')}>{r.get(p)}</span>
                    </div>
                    );
                  })}
                </div>
                {packages.length >= 2 && (p.promotionalPrice || p.monthlyPrice) * 12 === minYearly && (
                  <div className="mt-2 rounded-lg border border-success/30 bg-success/5 px-3 py-2 text-xs font-medium text-success">
                    <PiggyBank className="mr-1 inline h-3.5 w-3.5" /> Best yearly deal — saves R{yearlySavings.toLocaleString()}/year
                  </div>
                )}
                <div className="mt-4 flex gap-2">
                  <Link to={`/packages/${p.slug}`} className="flex-1 rounded-lg border border-border py-2.5 text-center text-sm font-medium">View details</Link>
                  <Link to={`/enquire?package=${p.slug}`} className="flex-1 rounded-lg bg-brand py-2.5 text-center text-sm font-semibold text-white">Select</Link>
                </div>
              </div>
            );
          })()}
        </div>
      ) : (
        /* Desktop: table */
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="p-4 text-left font-semibold w-40">Feature</th>
                {packages.map(p => (
                  <th key={p.id} className="p-4 text-left align-top">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <ProviderLogo provider={p.provider} />
                        <div>
                          <p className="font-display font-bold leading-tight">{p.name}</p>
                          <p className="text-xs font-normal text-muted-foreground">{p.provider?.name}</p>
                        </div>
                      </div>
                      <button onClick={() => remove(p.id)} aria-label="Remove"><X className="h-4 w-4 text-muted-foreground hover:text-destructive" /></button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr key={r.key} className={i % 2 ? 'bg-muted/10' : ''}>
                  <th scope="row" className="p-4 text-left font-medium text-muted-foreground">{r.label}</th>
                  {packages.map(p => {
                    const val = r.get(p);
                    const isBest = r.key === 'monthly' && (p.promotionalPrice || p.monthlyPrice) === minPrice;
                    const isCheapestYearly = r.key === 'yearly' && (p.promotionalPrice || p.monthlyPrice) * 12 === minYearly;
                    const isFast = r.key === 'download' && p.downloadMbps === maxSpeed;
                    return (
                      <td key={p.id} className="p-4 align-top">
                        <span className={cn('font-medium', isBest && 'text-success', isCheapestYearly && 'text-success', isFast && 'text-brand')}>
                          {isBest && <Star className="mr-1 inline h-3.5 w-3.5 fill-current" />}
                          {val}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr className="border-t border-border">
                <th className="p-4" />
                {packages.map(p => (
                  <td key={p.id} className="p-4">
                    <div className="flex flex-col gap-2">
                      <Link to={`/packages/${p.slug}`} className="rounded-lg border border-border py-2 text-center text-sm font-medium hover:bg-muted">View details</Link>
                      <Link to={`/enquire?package=${p.slug}`} className="rounded-lg bg-brand py-2 text-center text-sm font-semibold text-white hover:bg-brand-dark">Select this package</Link>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground">Comparison uses sample data. Confirm final pricing and terms with the provider during application.</p>
    </div>
  );
}