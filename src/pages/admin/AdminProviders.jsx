import React, { useState } from 'react';
import { Plus, Search, Pencil, Power, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProviderLogo from '@/components/ui/ProviderLogo';
import Badge from '@/components/ui/badge';
import { PROVIDERS } from '@/data/mockData';

export default function AdminProviders() {
  const [items, setItems] = useState(PROVIDERS.map(p => ({ ...p, active: true })));
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);

  const filtered = items.filter(p => p.name.toLowerCase().includes(q.toLowerCase()));
  const toggle = (id) => setItems(items.map(p => p.id === id ? { ...p, active: !p.active } : p));
  const save = (p) => { setItems(items.map(i => i.id === p.id ? p : i)); setEditing(null); };
  const addNew = () => setEditing({ id: 'new', name: '', slug: '', color: '#0284c7', connectivity: ['Fibre'], description: '', active: true, packageCount: 0, rating: 0, reviewCount: 0, logoText: '' });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Providers</h1>
        <button onClick={addNew} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white"><Plus className="h-4 w-4" /> Add provider</button>
      </div>
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search providers…" className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-brand" />
      </div>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/30"><tr><th className="p-3 text-left font-semibold">Provider</th><th className="p-3 text-left font-semibold">Connectivity</th><th className="p-3 text-left font-semibold">Packages</th><th className="p-3 text-left font-semibold">Rating</th><th className="p-3 text-left font-semibold">Status</th><th className="p-3 text-left font-semibold">Actions</th></tr></thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3"><div className="flex items-center gap-2"><ProviderLogo provider={p} size="sm" /> <span className="font-medium">{p.name}</span></div></td>
                <td className="p-3"><div className="flex flex-wrap gap-1">{p.connectivity.map(c => <Badge key={c} variant="outline">{c}</Badge>)}</div></td>
                <td className="p-3">{p.packageCount}</td>
                <td className="p-3">{p.rating}★</td>
                <td className="p-3"><span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', p.active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground')}>{p.active ? 'Active' : 'Inactive'}</span></td>
                <td className="p-3"><div className="flex gap-1">
                  <button onClick={() => setEditing(p)} className="rounded-lg border border-border p-1.5 hover:bg-muted" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => toggle(p.id)} className={cn('rounded-lg border border-border p-1.5', p.active ? 'text-warning' : 'text-success')} aria-label="Toggle"><Power className="h-4 w-4" /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && <ProviderEditor provider={editing} onSave={save} onClose={() => setEditing(null)} />}
    </div>
  );
}

function ProviderEditor({ provider, onSave, onClose }) {
  const [form, setForm] = useState(provider);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-lg rounded-t-2xl border border-border bg-card p-5 sm:rounded-2xl">
        <div className="flex items-center justify-between"><h2 className="font-display text-lg font-bold">{provider.id === 'new' ? 'Add provider' : 'Edit provider'}</h2><button onClick={onClose} aria-label="Close"><X className="h-5 w-5" /></button></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block"><span className="text-sm font-medium">Name</span><input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-'), logoText: e.target.value.slice(0, 2).toUpperCase() }))} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" /></label>
          <label className="block"><span className="text-sm font-medium">Colour</span><input type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-2" /></label>
          <label className="block sm:col-span-2"><span className="text-sm font-medium">Description</span><textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand" /></label>
        </div>
        <div className="mt-4 flex justify-end gap-2"><button onClick={onClose} className="rounded-lg border border-border px-4 py-2 text-sm">Cancel</button><button onClick={() => onSave(form)} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white"><Check className="h-4 w-4" /> Save</button></div>
      </div>
    </div>
  );
}
