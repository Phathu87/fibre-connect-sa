import React from 'react';
import { cn } from '@/lib/utils';

function FilterGroup({ title, children }) {
  return (
    <div className="border-b border-border py-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

function Checkbox({ checked, onChange, label, count = undefined }) {
  return (
    <label className="flex cursor-pointer items-center justify-between py-1.5 text-sm">
      <span className="flex items-center gap-2">
        <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded accent-brand" />
        {label}
      </span>
      {count !== undefined && <span className="text-xs text-muted-foreground">{count}</span>}
    </label>
  );
}

export default function FilterPanel({ filters, setFilters, options }) {
  const toggle = (key, val) => {
    const arr = filters[key] || [];
    setFilters({ ...filters, [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] });
  };
  const setBool = (key, val) => setFilters({ ...filters, [key]: filters[key] === val ? undefined : val });

  return (
    <div>
      <FilterGroup title="Connectivity type">
        {options.connectivityTypes.map(t => (
          <Checkbox key={t} label={t} checked={filters.connectivityType?.includes(t)} onChange={() => toggle('connectivityType', t)} />
        ))}
      </FilterGroup>
      <FilterGroup title="Provider">
        {options.providers.map(p => (
          <Checkbox key={p.id} label={p.name} checked={filters.providerId?.includes(p.id)} onChange={() => toggle('providerId', p.id)} />
        ))}
      </FilterGroup>
      <FilterGroup title="Network operator">
        {options.networks.map(n => (
          <Checkbox key={n.id} label={n.name} checked={filters.networkId?.includes(n.id)} onChange={() => toggle('networkId', n.id)} />
        ))}
      </FilterGroup>
      <FilterGroup title="Monthly price (max)">
        <input type="range" min={500} max={2500} step={100} value={filters.maxPrice || 2500} onChange={e => setFilters({ ...filters, maxPrice: Number(e.target.value) })} className="w-full accent-brand" />
        <p className="mt-1 text-sm font-medium">R{filters.maxPrice || 2500}/month</p>
      </FilterGroup>
      <FilterGroup title="Minimum download speed">
        <div className="flex flex-wrap gap-2">
          {[25, 50, 100, 200, 500].map(s => (
            <button key={s} onClick={() => setFilters({ ...filters, minSpeed: filters.minSpeed === s ? undefined : s })} className={cn('rounded-lg border px-3 py-1.5 text-sm', filters.minSpeed === s ? 'border-brand bg-brand/10 text-brand' : 'border-border hover:bg-muted')}>{s}Mbps+</button>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Features">
        <Checkbox label="Uncapped only" checked={!!filters.uncapped} onChange={() => setFilters({ ...filters, uncapped: !filters.uncapped })} />
        <Checkbox label="Router included" checked={!!filters.routerIncluded} onChange={() => setFilters({ ...filters, routerIncluded: !filters.routerIncluded })} />
        <Checkbox label="Promotional deals" checked={!!filters.promotional} onChange={() => setFilters({ ...filters, promotional: !filters.promotional })} />
        <Checkbox label="Month-to-month" checked={filters.contractMonths === 0} onChange={() => setFilters({ ...filters, contractMonths: filters.contractMonths === 0 ? undefined : 0 })} />
      </FilterGroup>
      <FilterGroup title="Classification">
        <div className="flex gap-2">
          {[['residential', 'Residential'], ['business', 'Business']].map(([val, label]) => (
            <button key={val} onClick={() => setBool('classification', val)} className={cn('flex-1 rounded-lg border px-3 py-1.5 text-sm', filters.classification === val ? 'border-brand bg-brand/10 text-brand' : 'border-border hover:bg-muted')}>{label}</button>
          ))}
        </div>
      </FilterGroup>
    </div>
  );
}
