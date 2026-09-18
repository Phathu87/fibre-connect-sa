import React, { useMemo, useState } from 'react';
import { Check, Network } from 'lucide-react';
import PackageCard from '@/components/PackageCard';
import { cn } from '@/lib/utils';

export default function NetworkPackageGroup({ packages = [] }) {
  const groups = useMemo(() => {
    const byNetwork = new Map();
    for (const pkg of packages) {
      const network = pkg.network || { id: 'unknown', name: 'Other networks', slug: 'other' };
      const key = network.id || network.slug || network.name;
      if (!byNetwork.has(key)) {
        byNetwork.set(key, { network, packages: [] });
      }
      byNetwork.get(key).packages.push(pkg);
    }
    return Array.from(byNetwork.values()).sort((a, b) => a.network.name.localeCompare(b.network.name));
  }, [packages]);

  const [activeKey, setActiveKey] = useState('all');
  const activeGroup = groups.find(group => (group.network.id || group.network.slug || group.network.name) === activeKey);
  const visiblePackages = activeKey === 'all' ? packages : activeGroup?.packages || [];

  if (!packages.length) {
    return (
      <div className="mt-3 rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
        <Network className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="mt-2 text-sm font-medium">No packages available for this coverage result.</p>
      </div>
    );
  }

  return (
    <section className="mt-4" aria-label="Packages grouped by network">
      {groups.length > 1 && (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filter packages by network">
          <NetworkChip
            active={activeKey === 'all'}
            label="All networks"
            count={packages.length}
            onClick={() => setActiveKey('all')}
          />
          {groups.map(group => {
            const key = group.network.id || group.network.slug || group.network.name;
            return (
              <NetworkChip
                key={key}
                active={activeKey === key}
                label={group.network.name}
                count={group.packages.length}
                onClick={() => setActiveKey(key)}
              />
            );
          })}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visiblePackages.map(pkg => (
          <PackageCard key={pkg.id} pkg={pkg} />
        ))}
      </div>
    </section>
  );
}

function NetworkChip({ active, label, count, onClick }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors',
        active ? 'border-brand bg-brand text-white' : 'border-border bg-card text-foreground hover:bg-muted'
      )}
    >
      {active && <Check className="h-4 w-4" />}
      <span>{label}</span>
      <span className={cn('rounded-full px-1.5 py-0.5 text-xs', active ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground')}>
        {count}
      </span>
    </button>
  );
}
