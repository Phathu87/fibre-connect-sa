import React, { useState } from 'react';
import { Plus, Search, Pencil, Copy, Power, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import Badge from '@/components/ui/badge';
import ProviderLogo from '@/components/ui/ProviderLogo';
import { PACKAGES, PROVIDERS, NETWORKS, getProvider } from '@/data/mockData';

export default function AdminPackages() {
  const [items, setItems] = useState(PACKAGES.map(p => ({ ...p, active: true })));
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);

  const filtered = items.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
  const toggle = (id) => setItems(items.map(p => p.id === id ? { ...p, active: !p.active } : p));
  const duplicate = (p) => setItems([{ ...p, id: 'p' + Date.now(), slug: p.slug + '-copy', name: p.name + ' (copy)', active: false }, ...items]);
  const save = (p) => { setItems(items.map(i => i.id === p.id ? p : i)); setEditing(null); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Packages</h1>
        <button onClick={() => setEditing({ id: 'new', name: '', providerId: PROVIDERS[0].id, networkId: NETWORKS[0].id, connectivityType: 'Fibre', downloadMbps: 100, uploadMbps: 50, monthlyPrice: 999, promotionalPrice: null, installationFee: 0, routerIncluded: true, contractMonths: 24, uncapped: true, active: true, featured: false, recommended: false, bestValue: false, mostPopular: false, residential: true, business: false })} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white"><Plus className="h-4 w-4" /> Create package</button>
      </div>
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search packages…" className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-brand" />
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/30"><tr><th className="p-3 text-left font-semibold">Package</th><th className="p-3 text-left font-semibold">Provider</th><th className="p-3 text-left font-semibold">Speed</th><th className="p-3 text-left font-semibold">Price</th><th className="p-3 text-left font-semibold">Badges</th><th className="p-3 text-left font-semibold">Status</th><th className="p-3 text-left font-semibold">Actions</th></tr></thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3"><div className="flex items-center gap-1.5"><ProviderLogo provider={getProvider(p.providerId)} size="sm" /> {getProvider(p.providerId)?.name}</div></td>
                <td className="p-3">{p.downloadMbps}/{p.uploadMbps}Mbps</td>
                <td className="p-3">R{p.promotionalPrice || p.monthlyPrice}</td>
                <td className="p-3"><div className="flex flex-wrap gap-1">{p.recommended && <Badge variant="brand">Rec</Badge>}{p.bestValue && <Badge variant="success">Value</Badge>}{p.mostPopular && <Badge variant="warning">Pop</Badge>}</div></td>
                <td className="p-3"><span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', p.active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground')}>{p.active ? 'Active' : 'Inactive'}</span></td>
                <td className="p-3"><div className="flex gap-1">
                  <button onClick={() => setEditing(p)} className="rounded-lg border border-border p-1.5 hover:bg-muted" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => duplicate(p)} className="rounded-lg border border-border p-1.5 hover:bg-muted" aria-label="Duplicate"><Copy className="h-4 w-4" /></button>
                  <button onClick={() => toggle(p.id)} className={cn('rounded-lg border border-border p-1.5', p.active ? 'text-warning' : 'text-success')} aria-label="Toggle"><Power className="h-4 w-4" /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editing && <PackageEditor pkg={editing} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  );
}

function PackageEditor({ pkg, onSave, onClose }) {
  const [form, setForm] = useState(pkg);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-border bg-card p-5 sm:rounded-2xl">
        <div className="flex items-center justify-between"><h2 className="font-display text-lg font-bold">{pkg.id === 'new' ? 'Create package' : 'Edit package'}</h2><button onClick={onClose} aria-label="Close"><X className="h-5 w-5" /></button></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2"><span className="text-sm font-medium">Name</span><input value={form.name} onChange={e => set('name', e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" /></label>
          <label className="block"><span className="text-sm font-medium">Provider</span><select value={form.providerId} onChange={e => set('providerId', e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-2 text-sm">{PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
          <label className="block"><span className="text-sm font-medium">Network</span><select value={form.networkId} onChange={e => set('networkId', e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-2 text-sm">{NETWORKS.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}</select></label>
          <label className="block"><span className="text-sm font-medium">Type</span><select value={form.connectivityType} onChange={e => set('connectivityType', e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-2 text-sm"><option>Fibre</option><option>5G</option><option>LTE</option></select></label>
          <label className="block"><span className="text-sm font-medium">Download Mbps</span><input type="number" value={form.downloadMbps} onChange={e => set('downloadMbps', Number(e.target.value))} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" /></label>
          <label className="block"><span className="text-sm font-medium">Upload Mbps</span><input type="number" value={form.uploadMbps} onChange={e => set('uploadMbps', Number(e.target.value))} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" /></label>
          <label className="block"><span className="text-sm font-medium">Monthly price</span><input type="number" value={form.monthlyPrice} onChange={e => set('monthlyPrice', Number(e.target.value))} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" /></label>
          <label className="block"><span className="text-sm font-medium">Promo price</span><input type="number" value={form.promotionalPrice || ''} onChange={e => set('promotionalPrice', e.target.value ? Number(e.target.value) : null)} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" /></label>
          <label className="block"><span className="text-sm font-medium">Installation fee</span><input type="number" value={form.installationFee} onChange={e => set('installationFee', Number(e.target.value))} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" /></label>
          <label className="block"><span className="text-sm font-medium">Contract months</span><input type="number" value={form.contractMonths} onChange={e => set('contractMonths', Number(e.target.value))} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" /></label>
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          {[['routerIncluded', 'Router included'], ['uncapped', 'Uncapped'], ['featured', 'Featured'], ['recommended', 'Recommended'], ['bestValue', 'Best value'], ['mostPopular', 'Most popular'], ['business', 'Business'], ['active', 'Active']].map(([k, label]) => (
            <label key={k} className="flex items-center gap-1.5 text-sm"><input type="checkbox" checked={!!form[k]} onChange={e => set(k, e.target.checked)} className="h-4 w-4 accent-brand" /> {label}</label>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2"><button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm">Cancel</button><button onClick={() => onSave(form)} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white"><Check className="h-4 w-4" /> Save</button></div>
      </div>
    </div>
  );
}
