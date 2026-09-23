import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { authService } from '@/services/authService';
import { useAuth } from '@/lib/AuthContext';
import { notificationService } from '@/services/userDataService';

export default function Profile() {
  const { user, checkUserAuth } = useAuth();
  const [form, setForm] = useState(() => ({ firstName: user?.firstName || '', lastName: user?.lastName || '', phone: user?.phone || '', marketingConsent: Boolean(user?.marketingConsent) }));
  const [saved, setSaved] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setSaved(false); };
  const save = async (e) => { e.preventDefault(); await authService.updateMe(form); await checkUserAuth(); setSaved(true); };

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-bold">Profile</h2>
      <form onSubmit={save} className="grid gap-4 rounded-xl border border-border bg-card p-5 sm:grid-cols-2">
        <label className="block"><span className="text-sm font-medium">First name</span><input value={form.firstName} onChange={e => set('firstName', e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" /></label>
        <label className="block"><span className="text-sm font-medium">Last name</span><input value={form.lastName} onChange={e => set('lastName', e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" /></label>
        <label className="block"><span className="text-sm font-medium">Email</span><input value={user?.email || ''} readOnly type="email" className="mt-1 h-11 w-full rounded-lg border border-border bg-muted px-3 text-sm" /></label>
        <label className="block"><span className="text-sm font-medium">Phone number</span><input value={form.phone} onChange={e => set('phone', e.target.value)} type="tel" className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" /></label>
        <label className="flex items-center gap-2 sm:col-span-2 mt-1">
          <input type="checkbox" checked={form.marketingConsent} onChange={e => set('marketingConsent', e.target.checked)} className="h-4 w-4 accent-brand" />
          <span className="text-sm text-muted-foreground">I consent to receive marketing communications about deals and offers.</span>
        </label>
        <div className="sm:col-span-2 flex items-center gap-3">
          <button type="submit" className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white">Save changes</button>
          {saved && <span className="inline-flex items-center gap-1 text-sm text-success"><Check className="h-4 w-4" /> Saved</span>}
        </div>
      </form>
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="font-display font-bold">Communication preferences</h3>
        <CommPrefs />
      </div>
    </div>
  );
}

function CommPrefs() {
  const [prefs, setPrefs] = useState({ email: true, sms: false, push: false, marketing: false });
  useEffect(() => { notificationService.getPrefs().then(setPrefs); }, []);
  const toggle = async (k) => { const next = { ...prefs, [k]: !prefs[k] }; setPrefs(next); setPrefs(await notificationService.setPrefs(next)); };
  return (
    <div className="mt-2 space-y-2">
      {[['email', 'Email notifications', 'Enquiry updates and account alerts'], ['sms', 'SMS notifications', 'Critical updates via SMS'], ['push', 'Push notifications', 'Mobile app push (when available)'], ['marketing', 'Marketing', 'Deals, offers and promotions']].map(([k, label, desc]) => (
        <label key={k} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
          <span><span className="text-sm font-medium">{label}</span><br /><span className="text-xs text-muted-foreground">{desc}</span></span>
          <input type="checkbox" checked={prefs[k]} onChange={() => toggle(k)} className="h-5 w-5 accent-brand" />
        </label>
      ))}
    </div>
  );
}
