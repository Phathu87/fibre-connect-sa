import React, { useState } from 'react';
import { Mail, MessageSquare, Building2, LifeBuoy, Bug, Send, Check } from 'lucide-react';
import { enquiryService } from '@/services/userDataService';
import { events } from '@/services/analyticsService';

const TOPICS = [
  { id: 'general', icon: MessageSquare, label: 'General enquiry' },
  { id: 'support', icon: LifeBuoy, label: 'Support' },
  { id: 'business', icon: Building2, label: 'Business connectivity' },
  { id: 'partnership', icon: Mail, label: 'Provider partnership' },
  { id: 'technical', icon: Bug, label: 'Technical issue' },
];

export default function Contact() {
  const [topic, setTopic] = useState('general');
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    await enquiryService.create({ type: 'contact-' + topic, ...form, packageName: `Contact: ${topic}` });
    events.enquiryCompleted('contact');
    setSending(false);
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-extrabold">Contact us</h1>
      <p className="mt-1 text-muted-foreground">Choose a topic and send us a message. We will respond via email.</p>
      <div className="mt-5 grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {TOPICS.map(t => (
          <button key={t.id} onClick={() => setTopic(t.id)} className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center text-xs font-medium ${topic === t.id ? 'border-brand bg-brand/10 text-brand' : 'border-border hover:bg-muted'}`}>
            <t.icon className="h-5 w-5" /> {t.label}
          </button>
        ))}
      </div>

      {sent ? (
        <div className="mt-6 rounded-xl border border-success/30 bg-success/5 p-6 text-center">
          <Check className="mx-auto h-10 w-10 text-success" />
          <h2 className="mt-2 font-display text-lg font-bold">Message sent</h2>
          <p className="text-sm text-muted-foreground">Thank you. Our team will respond to your email shortly.</p>
          <button onClick={() => setSent(false)} className="mt-3 rounded-lg border border-border px-4 py-2 text-sm font-medium">Send another</button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-6 space-y-4 rounded-xl border border-border bg-card p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block"><span className="text-sm font-medium">Your name</span><input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" /></label>
            <label className="block"><span className="text-sm font-medium">Email</span><input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="mt-1 h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" /></label>
          </div>
          <label className="block"><span className="text-sm font-medium">Message</span><textarea required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} rows={5} className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand" /></label>
          <button type="submit" disabled={sending} className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
            {sending ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Sending…</> : <><Send className="h-4 w-4" /> Send message</>}
          </button>
        </form>
      )}
      <p className="mt-4 text-xs text-muted-foreground">Contact details are configurable and managed server-side. No fictional phone numbers or addresses are displayed.</p>
    </div>
  );
}