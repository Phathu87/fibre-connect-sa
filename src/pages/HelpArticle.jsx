import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { HELP_ARTICLES } from '@/data/mockData';

export default function HelpArticle() {
  const { slug } = useParams();
  const article = HELP_ARTICLES.find(a => a.slug === slug);
  if (!article) return <div className="mx-auto max-w-2xl px-4 py-16 text-center"><h1 className="text-2xl font-extrabold">Article not found</h1><Link to="/help" className="mt-4 inline-flex rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">Help centre</Link></div>;
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <nav className="mb-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/help" className="hover:text-brand">Help</Link> <ChevronRight className="inline h-3 w-3" /> {article.title}
      </nav>
      <span className="text-xs font-medium text-brand">{article.category}</span>
      <h1 className="mt-1 text-2xl font-extrabold md:text-3xl">{article.title}</h1>
      <div className="prose mt-4 max-w-none text-sm text-muted-foreground">
        <p>{article.excerpt}</p>
        <p className="mt-3">This article covers the essentials of {article.title.toLowerCase()}. For detailed guidance, run a coverage check or contact our support team.</p>
        <p className="mt-3">If you still need help, <Link to="/contact" className="text-brand underline">contact support</Link> and we will assist you.</p>
      </div>
      <div className="mt-6 rounded-xl border border-border bg-card p-4">
        <p className="font-medium">Related help</p>
        <ul className="mt-2 space-y-1.5">
          {HELP_ARTICLES.filter(a => a.slug !== slug && a.category === article.category).slice(0, 3).map(a => (
            <li key={a.slug}><Link to={`/help/${a.slug}`} className="text-sm text-brand hover:underline">{a.title}</Link></li>
          ))}
        </ul>
      </div>
    </div>
  );
}