import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import { HELP_ARTICLES } from '@/data/mockData';

const CATEGORIES = ['Coverage', 'Packages', 'Comparisons', 'Applications', 'Account', 'Installation', 'Billing information', 'Connectivity terminology'];

export default function Help() {
  const [q, setQ] = useState('');
  const filtered = HELP_ARTICLES.filter(a => (a.title + a.excerpt + a.category).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-extrabold">Help centre</h1>
      <p className="mt-1 text-muted-foreground">Find answers about coverage, packages, comparisons, applications and more.</p>
      <div className="relative mt-5">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search help articles…" className="h-12 w-full rounded-xl border border-border bg-card pl-11 pr-4 text-sm outline-none focus:border-brand" />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {CATEGORIES.map(c => <button key={c} onClick={() => setQ(c)} className="rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:border-brand">{c}</button>)}
      </div>
      <div className="mt-6 divide-y divide-border rounded-xl border border-border">
        {filtered.length ? filtered.map(a => (
          <Link key={a.slug} to={`/help/${a.slug}`} className="flex items-center justify-between gap-3 p-4 hover:bg-muted/30">
            <div><span className="text-xs font-medium text-brand">{a.category}</span><p className="font-medium">{a.title}</p><p className="text-sm text-muted-foreground">{a.excerpt}</p></div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        )) : <p className="p-6 text-center text-sm text-muted-foreground">No articles found. Try a different search.</p>}
      </div>
    </div>
  );
}