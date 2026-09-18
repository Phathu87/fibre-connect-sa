import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import ProviderLogo from '@/components/ui/ProviderLogo';
import Badge from '@/components/ui/Badge';
import { providerService } from '@/services/providerService';

export default function Providers() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { providerService.list().then(p => { setProviders(p); setLoading(false); }); }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-extrabold md:text-3xl">Internet service providers</h1>
      <p className="mt-1 text-sm text-muted-foreground">Compare ISPs and service providers offering fibre, 5G and LTE in South Africa.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-xl border border-border bg-muted/40" />) :
          providers.map(p => (
            <Link key={p.id} to={`/providers/${p.slug}`} className="group rounded-xl border border-border bg-card p-5 hover:border-brand hover:shadow-sm">
              <div className="flex items-center gap-3">
                <ProviderLogo provider={p} size="lg" />
                <div>
                  <h2 className="font-display text-lg font-bold group-hover:text-brand">{p.name}</h2>
                  <div className="flex items-center gap-1 text-sm"><Star className="h-3.5 w-3.5 fill-warning text-warning" /> <span className="font-medium">{p.rating}</span> <span className="text-muted-foreground">({p.reviewCount})</span></div>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.connectivity.map(c => <Badge key={c} variant="outline">{c}</Badge>)}
                <Badge variant="muted">{p.packageCount} packages</Badge>
              </div>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">View profile <ArrowRight className="h-4 w-4" /></span>
            </Link>
          ))}
      </div>
    </div>
  );
}