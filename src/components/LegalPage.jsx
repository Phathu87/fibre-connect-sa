import React from 'react';
import { Link } from 'react-router-dom';

export default function LegalPage({ title, lastUpdated, intro, sections, children = null }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <span className="inline-flex items-center rounded-full border border-warning/30 bg-warning/5 px-2.5 py-1 text-xs font-medium text-warning">Draft template — requires final legal review before commercial release</span>
      <h1 className="mt-3 text-3xl font-extrabold md:text-4xl">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">Last updated: {lastUpdated}</p>
      {intro && <p className="mt-4 text-sm text-muted-foreground">{intro}</p>}
      <div className="mt-6 space-y-6">
        {sections.map((s, i) => (
          <section key={i}>
            <h2 className="font-display text-lg font-bold">{s.heading}</h2>
            <div className="mt-1.5 space-y-2 text-sm text-muted-foreground">
              {s.body.map((p, j) => <p key={j}>{p}</p>)}
            </div>
          </section>
        ))}
        {children}
      </div>
      <div className="mt-8 flex flex-wrap gap-3 border-t border-border pt-4 text-sm">
        <Link to="/terms" className="text-brand hover:underline">Terms</Link>
        <Link to="/privacy" className="text-brand hover:underline">Privacy</Link>
        <Link to="/cookies" className="text-brand hover:underline">Cookies</Link>
        <Link to="/accessibility" className="text-brand hover:underline">Accessibility</Link>
        <Link to="/disclaimer" className="text-brand hover:underline">Disclaimer</Link>
      </div>
    </div>
  );
}
