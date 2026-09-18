import React from 'react';
import { StatusDot } from '@/components/ui/Connectivity';

const STATUSES = [
  { name: 'Vumatel', status: 'available', label: 'Live' },
  { name: 'Openserve', status: 'available', label: 'Live' },
  { name: 'MetroFibre', status: 'partial', label: 'Partial' },
  { name: 'Frogfoot', status: 'available', label: 'Live' },
  { name: 'Octotel', status: 'partial', label: 'Partial' },
];

export default function NetworkTicker() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live network availability</p>
      <div className="space-y-2.5">
        {STATUSES.map(s => (
          <div key={s.name} className="flex items-center justify-between">
            <span className="text-sm font-medium">{s.name}</span>
            <StatusDot status={s.status} label={s.label} />
          </div>
        ))}
      </div>
      <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">Sample status data for demonstration.</p>
    </div>
  );
}