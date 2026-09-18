import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ArrowRight, Check } from 'lucide-react';
import { enquiryService } from '@/services/userDataService';
import { events } from '@/services/analyticsService';

const NEEDS = ['Static IP', 'SLA / uptime guarantee', 'VoIP', 'Backup connection', 'Contention ratio', 'Managed Wi-Fi'];

export default function Business() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ employees: '', branches: '', location: '', speed: '', installDate: '', usage: '', needs: [], contactName: '', email: '', phone: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleNeed = (n) => setForm(f => ({ ...f, needs: f.needs.includes(n) ? f.needs.filter(x => x !== n) : [...f.needs, n] }));

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    events.enquiryStarted('business');
    const res = await enquiryService.create({ type: 'business', ...form, packageName: 'Business connectivity request' });
    events.enquiryCompleted(res.reference);
    setSubmitting(false);
    setDone(res.reference);
  };

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success"><Check className="h-8 w-8" /></div>
        <h1 className="mt-4 text-2xl font-extrabold">Business request received</h1>
        <p className="mt-2 text-muted-foreground">Reference <span className="font-mono font-bold text-foreground">{done}</span>. Our business team will review your requirements and contact you within one business day.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => navigate('/account/enquiries')} className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white">View in account</button>
          <button onClick={() => navigate('/')} className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium">Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand"><Building2 className="h-3.5 w-3.5" /> Business connectivity</span>
        <h1 className="mt-3 text-3xl font-extrabold md:text-4xl">Business internet, built for your operation</h1>
        <p className="mt-2 text-muted-foreground">Tell us about your business needs and we will match you with the right fibre, 5G or LTE solution — including SLAs, static IPs and backup connectivity.</p>
      </div>

      <form onSubmit={submit} className="space-y-6 rounded-2xl border border-border bg-card p-5">
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <legend className="sr-only">Business details</legend>
          <label className="block"><span className="text-sm font-medium">Number of employees</span>
            <select value={form.employees} onChange={e => set('employees', e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand">
              <option value="">Select…</option><option>1–10</option><option>11–50</option><option>51–200</option><option>200+</option>
            </select>
          </label>
          <label className="block"><span className="text-sm font-medium">Branch / site count</span>
            <input value={form.branches} onChange={e => set('branches', e.target.value)} type="number" min="1" className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" />
          </label>
          <label className="block"><span className="text-sm font-medium">Business location (city)</span>
            <input value={form.location} onChange={e => set('location', e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" />
          </label>
          <label className="block"><span className="text-sm font-medium">Required download speed</span>
            <select value={form.speed} onChange={e => set('speed', e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand">
              <option value="">Select…</option><option>100Mbps</option><option>200Mbps</option><option>500Mbps</option><option>1Gbps+</option>
            </select>
          </label>
          <label className="block"><span className="text-sm font-medium">Desired installation date</span>
            <input value={form.installDate} onChange={e => set('installDate', e.target.value)} type="date" className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" />
          </label>
          <label className="block"><span className="text-sm font-medium">Estimated monthly usage</span>
            <select value={form.usage} onChange={e => set('usage', e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand">
              <option value="">Select…</option><option>Light (browsing/email)</option><option>Medium (video/cloud)</option><option>Heavy (large transfers)</option>
            </select>
          </label>
        </fieldset>

        <div>
          <p className="text-sm font-medium">Additional requirements</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {NEEDS.map(n => (
              <button type="button" key={n} onClick={() => toggleNeed(n)} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm ${form.needs.includes(n) ? 'border-brand bg-brand/10 text-brand' : 'border-border hover:bg-muted'}`}>
                {form.needs.includes(n) && <Check className="h-3.5 w-3.5" />} {n}
              </button>
            ))}
          </div>
        </div>

        <fieldset className="grid gap-4 sm:grid-cols-2 border-t border-border pt-4">
          <legend className="sr-only">Contact</legend>
          <label className="block"><span className="text-sm font-medium">Contact name</span>
            <input required value={form.contactName} onChange={e => set('contactName', e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" />
          </label>
          <label className="block"><span className="text-sm font-medium">Business email</span>
            <input required type="email" value={form.email} onChange={e => set('email', e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" />
          </label>
          <label className="block sm:col-span-2"><span className="text-sm font-medium">Phone number</span>
            <input required type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" />
          </label>
          <label className="block sm:col-span-2"><span className="text-sm font-medium">Additional notes</span>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand" />
          </label>
        </fieldset>

        <button type="submit" disabled={submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
          {submitting ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Submitting…</> : <>Request business connectivity <ArrowRight className="h-4 w-4" /></>}
        </button>
      </form>
    </div>
  );
}