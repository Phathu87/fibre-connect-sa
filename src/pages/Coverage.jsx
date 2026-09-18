import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Check, AlertCircle, Wifi } from 'lucide-react';
import AddressSearchBar from '@/components/AddressSearchBar';
import { POPULAR_LOCATIONS } from '@/data/mockData';

export default function Coverage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <nav className="mb-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-brand">Home</Link> <span className="mx-1">/</span> Coverage
      </nav>
      <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">Check coverage at your address</h1>
      <p className="mt-2 text-muted-foreground">Enter your address to see which fibre network operators and wireless options are available.</p>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
        <AddressSearchBar />
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          { icon: Check, title: 'Fibre available', desc: 'See network operators and packages you can order.', color: 'text-success' },
          { icon: Wifi, title: 'Wireless alternatives', desc: '5G and LTE where fibre has not reached yet.', color: 'text-brand' },
          { icon: AlertCircle, title: 'No coverage yet', desc: 'Register for a notify-me alert for your area.', color: 'text-warning' },
        ].map(s => (
          <div key={s.title} className="rounded-xl border border-border bg-card p-4">
            <s.icon className={`h-6 w-6 ${s.color}`} />
            <h3 className="mt-2 font-display font-bold">{s.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="font-display text-lg font-bold">Popular areas</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {POPULAR_LOCATIONS.map(l => (
            <Link key={l.label} to={`/fibre/${l.province}/${l.city}/${l.suburb}`} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:border-brand">
              <MapPin className="h-3.5 w-3.5 text-brand" /> {l.label}
            </Link>
          ))}
        </div>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">Coverage data shown here is sample data for demonstration. Live availability is confirmed by the network operator during the application process.</p>
    </div>
  );
}