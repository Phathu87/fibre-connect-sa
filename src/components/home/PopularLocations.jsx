import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { POPULAR_LOCATIONS } from '@/data/mockData';

export default function PopularLocations() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <h2 className="text-2xl font-extrabold md:text-3xl">Popular locations</h2>
      <p className="mt-1 text-sm text-muted-foreground">Browse fibre availability in your area.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {POPULAR_LOCATIONS.map(loc => (
          <Link key={loc.label} to={`/fibre/${loc.province}/${loc.city}/${loc.suburb}`} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:border-brand hover:shadow-sm">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-brand/10 text-brand"><MapPin className="h-5 w-5" /></span>
            <div>
              <p className="font-display font-bold">{loc.label}</p>
              <p className="text-xs text-muted-foreground">View fibre availability</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}