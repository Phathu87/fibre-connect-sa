import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Badge from '@/components/ui/badge';
import NetworkLogo from '@/components/ui/NetworkLogo';
import { networkService } from '@/services/networkService';

export default function Networks() {
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { networkService.list().then(n => { setNetworks(n); setLoading(false); }); }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-extrabold md:text-3xl">Fibre network operators</h1>
      <p className="mt-1 text-sm text-muted-foreground">The open-access fibre and wireless networks that deliver connectivity to your home.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-xl border border-border bg-muted/40" />) :
          networks.map(n => (
            <Link key={n.id} to={`/networks/${n.slug}`} className="group rounded-xl border border-border bg-card p-5 hover:border-brand hover:shadow-sm">
              <div className="flex items-center justify-between">
                <NetworkLogo network={n} />
                <Badge variant="outline">{n.infrastructure}</Badge>
              </div>
              <h2 className="mt-3 font-display text-lg font-bold group-hover:text-brand">{n.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{n.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">{n.coverageAreas.join(', ')}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">View network <ArrowRight className="h-4 w-4" /></span>
            </Link>
          ))}
      </div>
    </div>
  );
}
