import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/ui/Logo';

const COLS = [
  { title: 'Discover', links: [
    ['Coverage checker', '/coverage'],
    ['All packages', '/packages'],
    ['Compare packages', '/compare'],
    ['Providers', '/providers'],
    ['Networks', '/networks'],
    ['Business internet', '/business'],
  ]},
  { title: 'Locations', links: [
    ['Fibre in Gauteng', '/fibre/gauteng'],
    ['Fibre in Johannesburg', '/fibre/gauteng/johannesburg'],
    ['Fibre in Cape Town', '/fibre/western-cape/cape-town'],
    ['Fibre in Durban', '/fibre/kwaZulu-natal/durban'],
  ]},
  { title: 'Account', links: [
    ['Sign in', '/login'],
    ['Register', '/register'],
    ['My account', '/account'],
    ['Saved packages', '/saved'],
    ['Help centre', '/help'],
  ]},
  { title: 'Company', links: [
    ['About / case study', '/about'],
    ['Partner with us', '/partners'],
    ['Contact', '/contact'],
    ['Download app', '/download'],
  ]},
  { title: 'Legal', links: [
    ['Terms', '/terms'],
    ['Privacy', '/privacy'],
    ['Cookies', '/cookies'],
    ['Accessibility', '/accessibility'],
    ['Disclaimer', '/disclaimer'],
  ]},
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-1">
            <Logo />
            <p className="mt-3 text-sm text-muted-foreground">Compare fibre, LTE and 5G packages available in your area across South Africa.</p>
          </div>
          {COLS.map(col => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{col.title}</h3>
              <ul className="mt-3 space-y-2">
                {col.links.map(([label, to]) => (
                  <li key={to}><Link to={to} className="text-sm text-foreground/70 hover:text-brand">{label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} FibreConnect SA. Independently developed. Demo/sample data — not affiliated with any provider.</p>
          <p>FibreConnect SA evolved from an earlier developer-assessment prototype based on a broadband product-discovery brief.</p>
        </div>
      </div>
    </footer>
  );
}