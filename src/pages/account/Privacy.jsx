import React, { useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { privacyService } from '@/services/userDataService';
import { useAuth } from '@/lib/AuthContext';

export default function AccountPrivacy() {
  const { logout } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true); setError('');
    try {
      const data = await privacyService.exportData();
      const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
      const link = document.createElement('a'); link.href = url; link.download = `FibreConnect-data-${new Date().toISOString().slice(0, 10)}.json`; link.click(); URL.revokeObjectURL(url);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Data export failed.'); }
    finally { setBusy(false); }
  };

  const remove = async () => {
    if (!window.confirm('Permanently delete your FibreConnect account and anonymize retained enquiries?')) return;
    setBusy(true); setError('');
    try { await privacyService.deleteAccount(password); await logout(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Account deletion failed.'); setBusy(false); }
  };

  return <div className="space-y-5">
    <div><h2 className="font-display text-lg font-bold">Privacy controls</h2><p className="text-sm text-muted-foreground">Access or erase personal information held in your account.</p></div>
    {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p>}
    <section className="rounded-xl border border-border bg-card p-5">
      <h3 className="font-display font-bold">Download my data</h3><p className="mt-1 text-sm text-muted-foreground">Export profile, addresses, preferences, saved packages, comparisons, coverage summaries and enquiries as JSON.</p>
      <button type="button" onClick={download} disabled={busy} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold disabled:opacity-50"><Download className="h-4 w-4" /> Download data</button>
    </section>
    <section className="rounded-xl border border-destructive/30 bg-card p-5">
      <h3 className="font-display font-bold text-destructive">Delete account</h3><p className="mt-1 text-sm text-muted-foreground">Account-owned records are deleted. Enquiries required for operational history are retained without your account link and with identifying fields anonymized.</p>
      <label className="mt-3 block max-w-sm"><span className="text-sm font-medium">Confirm your password</span><input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm" /></label>
      <button type="button" onClick={remove} disabled={busy || !password} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground disabled:opacity-50"><Trash2 className="h-4 w-4" /> Delete account</button>
    </section>
  </div>;
}
