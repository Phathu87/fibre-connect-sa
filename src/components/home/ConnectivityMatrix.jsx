import React from 'react';
import { Check, X } from 'lucide-react';
import { ConnectivityIcon } from '@/components/ui/Connectivity';

const ROWS = [
  { feature: 'Typical speed', fibre: 'Up to 1000Mbps', lte: 'Up to 150Mbps', fiveg: 'Up to 500Mbps' },
  { feature: 'Latency', fibre: 'Lowest', lte: 'Moderate', fiveg: 'Low' },
  { feature: 'Installation', fibre: 'Cable to home', lte: 'Self / quick', fiveg: 'Quick site visit' },
  { feature: 'Best for', fibre: 'Homes & businesses', lte: 'Backup / temporary', fiveg: 'No-fibre areas' },
  { feature: 'Uncapped options', fibre: true, lte: false, fiveg: true },
  { feature: 'Month-to-month', fibre: false, lte: true, fiveg: true },
];

function Cell({ value }) {
  if (value === true) return <Check className="h-4 w-4 text-success" />;
  if (value === false) return <X className="h-4 w-4 text-muted-foreground/40" />;
  return <span className="text-sm">{value}</span>;
}

export default function ConnectivityMatrix() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <h2 className="text-2xl font-extrabold md:text-3xl">Fibre vs LTE vs 5G</h2>
      <p className="mt-1 text-sm text-muted-foreground">Choose the right connectivity type for your needs.</p>
      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="p-4 text-left font-semibold">Feature</th>
              <th className="p-4 text-left font-semibold"><span className="inline-flex items-center gap-2"><ConnectivityIcon type="Fibre" /> Fibre</span></th>
              <th className="p-4 text-left font-semibold"><span className="inline-flex items-center gap-2"><ConnectivityIcon type="LTE" /> Fixed LTE</span></th>
              <th className="p-4 text-left font-semibold"><span className="inline-flex items-center gap-2"><ConnectivityIcon type="5G" /> 5G</span></th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r, i) => (
              <tr key={r.feature} className={i % 2 ? 'bg-muted/20' : ''}>
                <td className="p-4 font-medium">{r.feature}</td>
                <td className="p-4"><Cell value={r.fibre} /></td>
                <td className="p-4"><Cell value={r.lte} /></td>
                <td className="p-4"><Cell value={r.fiveg} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}