import React from 'react';
import { Link } from 'react-router-dom';

const AREAS = [
  ['React architecture', 'Service-layer abstraction, typed data contracts, route-level code splitting.'],
  ['Responsive design', 'Mobile-first layouts from 320px to 1920px with native-feeling mobile patterns.'],
  ['Accessibility', 'WCAG 2.2 AA fundamentals — semantic headings, keyboard nav, focus states, ARIA.'],
  ['Filtering & comparison', 'Advanced filters, sorting and a 2–4 product comparison with mobile-first UX.'],
  ['Conversion design', 'Address → coverage → packages → compare → enquiry, with clear progress.'],
  ['Analytics & PWA', 'Analytics abstraction layer and PWA-ready architecture.'],
];

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-extrabold md:text-4xl">About FibreConnect SA</h1>
      <p className="mt-3 text-muted-foreground">FibreConnect SA evolved from an earlier developer-assessment prototype based on a broadband product-discovery brief and was independently redesigned and expanded into a complete broadband comparison platform.</p>

      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-bold">The problem</h2>
        <p className="mt-1 text-sm text-muted-foreground">South African households and businesses need an easier way to discover which internet packages are actually available at their address, across multiple networks and providers.</p>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-card p-5">
        <h2 className="font-display text-lg font-bold">The evolution</h2>
        <p className="mt-1 text-sm text-muted-foreground">The project expanded from a single-page product browser into a structured broadband discovery, comparison and lead-generation platform — with coverage checking, advanced filtering, side-by-side comparison, a multi-step enquiry flow, user accounts, an admin dashboard and SEO-ready location pages.</p>
      </div>

      <h2 className="mt-8 font-display text-xl font-bold">Engineering areas demonstrated</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {AREAS.map(([title, desc]) => (
          <div key={title} className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-medium">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-brand/20 bg-brand/5 p-5">
        <h2 className="font-display text-lg font-bold">Production status</h2>
        <p className="mt-1 text-sm text-muted-foreground">This is the frontend/product-readiness phase. The production backend, database, authentication, secure API, real coverage integrations, analytics, native packaging and store compliance remain to be implemented in a later release stage.</p>
        <Link to="/contact" className="mt-3 inline-block text-sm font-semibold text-brand hover:underline">Contact us</Link>
      </div>
    </div>
  );
}