import React from 'react';
import { Users, Search, FileText, TrendingUp, Package, Building2, MapPin, Star } from 'lucide-react';
import { PACKAGES, PROVIDERS, NETWORKS, SUBURBS, FAQS } from '@/data/mockData';
import { storage, KEYS } from '@/services/storageService';

const METRICS = [
  { icon: Users, label: 'Users', value: '12,480', change: '+8.2%' },
  { icon: Search, label: 'Coverage searches', value: '34,210', change: '+12.4%' },
  { icon: FileText, label: 'Enquiries', value: '1,842', change: '+5.1%' },
  { icon: TrendingUp, label: 'Conversion rate', value: '5.4%', change: '+0.6%' },
  { icon: Package, label: 'Active packages', value: PACKAGES.length, change: '+3' },
  { icon: Building2, label: 'Providers', value: PROVIDERS.length, change: '0' },
  { icon: MapPin, label: 'Zero-coverage searches', value: '2,140', change: '-3.2%' },
  { icon: Star, label: 'Popular locations', value: SUBURBS.length, change: '+2' },
];

export default function AdminDashboard() {
  const enquiries = storage.get(KEYS.ENQUIRIES, []);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform overview. Sample metrics for demonstration.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {METRICS.map(m => (
          <div key={m.label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <m.icon className="h-5 w-5 text-brand" />
              <span className={`text-xs font-medium ${m.change.startsWith('-') ? 'text-destructive' : 'text-success'}`}>{m.change}</span>
            </div>
            <p className="mt-2 text-2xl font-extrabold">{m.value}</p>
            <p className="text-xs text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-display font-bold">Recent enquiries</h2>
          {enquiries.length ? (
            <ul className="mt-3 divide-y divide-border text-sm">
              {enquiries.slice(0, 5).map(e => (
                <li key={e.id} className="flex items-center justify-between py-2">
                  <span className="truncate">{e.reference} · {e.packageName || e.type}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{e.status}</span>
                </li>
              ))}
            </ul>
          ) : <p className="mt-2 text-sm text-muted-foreground">No enquiries submitted yet in this session.</p>}
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-display font-bold">Catalogue summary</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="flex justify-between"><span className="text-muted-foreground">Providers</span><span className="font-medium">{PROVIDERS.length}</span></li>
            <li className="flex justify-between"><span className="text-muted-foreground">Network operators</span><span className="font-medium">{NETWORKS.length}</span></li>
            <li className="flex justify-between"><span className="text-muted-foreground">Packages</span><span className="font-medium">{PACKAGES.length}</span></li>
            <li className="flex justify-between"><span className="text-muted-foreground">Coverage suburbs</span><span className="font-medium">{SUBURBS.length}</span></li>
            <li className="flex justify-between"><span className="text-muted-foreground">FAQ entries</span><span className="font-medium">{FAQS.length}</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}