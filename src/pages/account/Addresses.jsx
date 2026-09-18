import React, { useState } from 'react';
import { MapPin, Plus, Trash2, Star, Check } from 'lucide-react';
import { userService } from '@/services/userDataService';

export default function Addresses() {
  const [addresses, setAddresses] = useState(() => userService.getAddresses());
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ street: '', suburb: '', city: '', province: '', postalCode: '' });

  const add = (e) => {
    e.preventDefault();
    const item = userService.addAddress(form);
    setAddresses(userService.getAddresses());
    setForm({ street: '', suburb: '', city: '', province: '', postalCode: '' });
    setAdding(false);
  };
  const remove = (id) => { userService.removeAddress(id); setAddresses(userService.getAddresses()); };
  const setPreferred = (id) => { userService.setPreferred(id); setAddresses(userService.getAddresses()); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">Saved addresses</h2>
        <button onClick={() => setAdding(v => !v)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted"><Plus className="h-4 w-4" /> Add address</button>
      </div>

      {adding && (
        <form onSubmit={add} className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
          <input required placeholder="Street address" value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand sm:col-span-2" />
          <input placeholder="Suburb" value={form.suburb} onChange={e => setForm(f => ({ ...f, suburb: e.target.value }))} className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" />
          <input placeholder="City" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" />
          <input placeholder="Province" value={form.province} onChange={e => setForm(f => ({ ...f, province: e.target.value }))} className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" />
          <input placeholder="Postal code" value={form.postalCode} onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))} className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" />
          <div className="sm:col-span-2 flex gap-2"><button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">Save address</button><button type="button" onClick={() => setAdding(false)} className="rounded-lg border border-border px-4 py-2 text-sm">Cancel</button></div>
        </form>
      )}

      {addresses.length === 0 && !adding ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <MapPin className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 font-medium">No saved addresses</p>
          <p className="text-sm text-muted-foreground">Add an address to speed up coverage checks and enquiries.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map(a => (
            <div key={a.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between">
                <MapPin className="h-5 w-5 text-brand" />
                {a.preferred && <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand"><Star className="h-3 w-3 fill-current" /> Preferred</span>}
              </div>
              <p className="mt-2 text-sm font-medium">{[a.street, a.suburb, a.city, a.province].filter(Boolean).join(', ')}</p>
              {a.postalCode && <p className="text-xs text-muted-foreground">{a.postalCode}</p>}
              <div className="mt-3 flex gap-2">
                <button onClick={() => setPreferred(a.id)} className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium hover:bg-muted">{a.preferred ? <><Check className="h-3 w-3" /> Preferred</> : 'Set preferred'}</button>
                <button onClick={() => remove(a.id)} className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/5"><Trash2 className="h-3 w-3" /> Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}