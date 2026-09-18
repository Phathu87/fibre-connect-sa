import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Layers, MapPin, BarChart3, Code, Users, ArrowRight, Check } from 'lucide-react';
import { enquiryService } from '@/services/userDataService';

const BENEFITS = [
  { icon: Layers, title: 'Package feed', desc: 'Publish and update your packages to appear in comparison results.' },
  { icon: MapPin, title: 'Coverage integration', desc: 'Sync your network coverage so users see accurate availability.' },
  { icon: Users, title: 'Qualified leads', desc: 'Receive enquiries from users who have confirmed intent.' },
  { icon: BarChart3, title: 'Analytics', desc: 'Performance insights on views, comparisons and conversions.' },
  { icon: Code, title: 'API integration', desc: 'Automated package and coverage updates via our API.' },
  { icon: Building2, title: 'Account management', desc: 'Dedicated partner support and onboarding.' },
];

export default function Partners() {
  const [form, setForm] = useState({ company: '', name: '', email: '', role: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    await enquiryService.create({ type: 'partner', ...form, packageName: `Partner: ${form.company}` });
    setSending(false);
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand"><Building2 className="h-3.5 w-3.5" /> For ISPs & network operators</span>
      <h1 className="mt-3 text-3xl font-extrabold md:text-4xl">Become a FibreConnect partner</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">List your packages, sync your coverage and receive qualified leads from South African households and businesses searching for connectivity.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BENEFITS.map(b => (
          <div key={b.title} className="rounded-xl border border-border bg-card p-5">
            <b.icon className="h-6 w-6 text-brand" />
            <h2 className="mt-2 font-display font-bold">{b.title}</h2>
            <p className="text-sm text-muted-foreground">{b.desc}</p>
          </div>
        ))}
      </div>

      {sent ? (
        <div className="mt-8 rounded-xl border border-success/30 bg-success/5 p-6 text-center">
          <Check className="mx-auto h-10 w-10 text-success" />
          <h2 className="mt-2 font-display text-lg font-bold">Partnership request received</h2>
          <p className="text-sm text-muted-foreground">Our partnerships team will review your details and reach out.</p>
          <Link to="/" className="mt-3 inline-block text-sm text-brand hover:underline">Back to home</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-8 space-y-4 rounded-xl border border-border bg-card p-5">
          <h2 className="font-display text-lg font-bold">Request partnership</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block"><span className="text-sm font-medium">Company</span><input required value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" /></label>
            <label className="block"><span className="text-sm font-medium">Your role</span><input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" /></label>
            <label className="block"><span className="text-sm font-medium">Contact name</span><input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" /></label>
            <label className="block"><span className="text-sm font-medium">Work email</span><input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" /></label>
          </div>
          <label className="block"><span className="text-sm font-medium">Message</span><textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={3} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand" /></label>
          <button type="submit" disabled={sending} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
            {sending ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Sending…</> : <>Become a FibreConnect partner <ArrowRight className="h-4 w-4" /></>}
          </button>
        </form>
      )}
    </div>
  );
}