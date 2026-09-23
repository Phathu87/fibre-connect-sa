import React, { useState } from 'react';
import { Plus, Pencil, Tag, FileEdit, BarChart3, Settings as SettingsIcon, MapPin, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import Badge from '@/components/ui/badge';
import NetworkLogo from '@/components/ui/NetworkLogo';
import { NETWORKS, SUBURBS, CITIES, FAQS, PACKAGES } from '@/data/mockData';
import { storage, KEYS } from '@/services/storageService';

export default function AdminGeneric({ section }) {
  switch (section) {
    case 'networks': return <Networks />;
    case 'coverage': return <Coverage />;
    case 'customers': return <Customers />;
    case 'promotions': return <Promotions />;
    case 'content': return <Content />;
    case 'analytics': return <Analytics />;
    case 'settings': return <SettingsSection />;
    default: return null;
  }
}

function Networks() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-extrabold">Networks</h1><button className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white"><Plus className="h-4 w-4" /> Add network</button></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {NETWORKS.map(n => (
          <div key={n.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between"><NetworkLogo network={n} size="sm" /><Badge variant="outline">{n.infrastructure}</Badge></div>
            <p className="mt-2 font-display font-bold">{n.name}</p>
            <p className="text-xs text-muted-foreground">{n.coverageAreas.join(', ')}</p>
            <div className="mt-3 flex gap-1"><button className="rounded-lg border border-border p-1.5 hover:bg-muted" aria-label="Edit"><Pencil className="h-4 w-4" /></button></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Coverage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Coverage areas</h1>
      <p className="text-sm text-muted-foreground">Manage provinces, cities, suburbs and network availability.</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SUBURBS.map(s => {
          const city = CITIES.find(c => c.slug === s.city);
          return (
            <div key={s.slug} className="rounded-xl border border-border bg-card p-4">
              <MapPin className="h-5 w-5 text-brand" />
              <p className="mt-1 font-medium">{s.name}</p>
              <p className="text-xs text-muted-foreground">{city?.name}</p>
              <div className="mt-2 flex flex-wrap gap-1">{s.networks.map(nid => <Badge key={nid} variant="outline">{NETWORKS.find(n => n.id === nid)?.name}</Badge>)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Customers() {
  const enquiries = storage.get(KEYS.ENQUIRIES, []);
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Customers</h1>
      <p className="text-sm text-muted-foreground">Registered users and their enquiry history. Demo data.</p>
      {enquiries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center"><Users className="mx-auto h-10 w-10 text-muted-foreground" /><p className="mt-2 font-medium">No customers with enquiries yet</p></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/30"><tr><th className="p-3 text-left font-semibold">Name</th><th className="p-3 text-left font-semibold">Email</th><th className="p-3 text-left font-semibold">Enquiries</th></tr></thead>
            <tbody>
              {Object.values(enquiries.reduce((acc, e) => { (acc[e.email] = acc[e.email] || { name: `${e.firstName} ${e.lastName}`, email: e.email, count: 0 }); acc[e.email].count++; return acc; }, {})).map(c => (
                <tr key={c.email} className="border-t border-border"><td className="p-3 font-medium">{c.name}</td><td className="p-3">{c.email}</td><td className="p-3">{c.count}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Promotions() {
  const promos = PACKAGES.filter(p => p.promotionalPrice !== null);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-extrabold">Promotions</h1><button className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white"><Tag className="h-4 w-4" /> Schedule promotion</button></div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {promos.map(p => (
          <div key={p.id} className="rounded-xl border border-border bg-card p-4">
            <Badge variant="dark">Promo</Badge>
            <p className="mt-2 font-medium">{p.name}</p>
            <p className="text-sm"><span className="line-through text-muted-foreground">R{p.monthlyPrice}</span> <span className="font-bold text-success">R{p.promotionalPrice}</span>/mo</p>
            <p className="text-xs text-muted-foreground">Until {p.promotionEnd}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Content() {
  const [faqs, setFaqs] = useState(FAQS);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-extrabold">Content</h1><button className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white"><FileEdit className="h-4 w-4" /> Add FAQ</button></div>
      <p className="text-sm text-muted-foreground">Manage FAQs, educational content, location content and homepage featured content.</p>
      <div className="divide-y divide-border rounded-xl border border-border">
        {faqs.map(f => (
          <div key={f.id} className="flex items-start justify-between gap-3 p-4">
            <div><Badge variant="outline">{f.category}</Badge><p className="mt-1 font-medium">{f.question}</p><p className="text-xs text-muted-foreground line-clamp-2">{f.answer}</p></div>
            <button className="rounded-lg border border-border p-1.5 hover:bg-muted" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Analytics() {
  const bars = [42, 58, 35, 70, 88, 64, 95];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Analytics</h1>
      <p className="text-sm text-muted-foreground">Coverage searches, package views, conversion funnel and more. Sample data.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[['Coverage searches', '34,210'], ['Package views', '88,540'], ['Comparisons', '12,310'], ['Conversion', '5.4%']].map(([l, v]) => (
          <div key={l} className="rounded-xl border border-border bg-card p-4"><BarChart3 className="h-5 w-5 text-brand" /><p className="mt-2 text-xl font-extrabold">{v}</p><p className="text-xs text-muted-foreground">{l}</p></div>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-display font-bold">Searches this week</h2>
        <div className="mt-4 flex items-end gap-2 h-40">
          {bars.map((b, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t bg-brand" style={{ height: `${b}%` }} />
              <span className="text-xs text-muted-foreground">{days[i]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <h2 className="font-display font-bold">Most compared packages</h2>
        <ol className="mt-2 space-y-1.5 text-sm">
          {PACKAGES.slice(0, 5).map((p, i) => <li key={p.id} className="flex justify-between"><span>{i + 1}. {p.name}</span><span className="text-muted-foreground">{Math.floor(Math.random() * 500)} compares</span></li>)}
        </ol>
      </div>
    </div>
  );
}

function SettingsSection() {
  const [tab, setTab] = useState('general');
  const tabs = [['general', 'General'], ['integrations', 'Provider integrations'], ['email', 'Email'], ['analytics', 'Analytics'], ['api', 'API'], ['notifications', 'Notifications'], ['legal', 'Legal']];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Settings</h1>
      <div className="flex gap-1 overflow-x-auto no-scrollbar">
        {tabs.map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={cn('whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium', tab === k ? 'bg-brand/10 text-brand' : 'border border-border hover:bg-muted')}>{l}</button>)}
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start gap-3"><SettingsIcon className="h-5 w-5 text-brand" /><div><p className="font-medium">Configuration</p><p className="text-sm text-muted-foreground">These settings are UI placeholders. Production values are managed server-side and never exposed in the frontend.</p></div></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block"><span className="text-sm font-medium">Product name</span><input defaultValue="FibreConnect SA" className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-brand" /></label>
          <label className="block"><span className="text-sm font-medium">Support email</span><input placeholder="Configured server-side" disabled className="mt-1 h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground" /></label>
          <label className="block"><span className="text-sm font-medium">API base URL</span><input placeholder="Configured server-side" disabled className="mt-1 h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground" /></label>
          <label className="block"><span className="text-sm font-medium">Maps API key</span><input placeholder="Configured server-side" disabled className="mt-1 h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground" /></label>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">⚠️ Never expose real production secrets in the UI. All sensitive configuration is enforced by the backend.</p>
      </div>
    </div>
  );
}
