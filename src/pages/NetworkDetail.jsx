import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Badge from '@/components/ui/badge';
import PackageCard from '@/components/PackageCard';
import ProviderLogo from '@/components/ui/ProviderLogo';
import NetworkLogo from '@/components/ui/NetworkLogo';
import { networkService } from '@/services/networkService';

export default function NetworkDetail() {
  const { slug } = useParams();
  const [network, setNetwork] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([networkService.getBySlug(slug), networkService.packages(slug)]).then(([n, pkgs]) => {
      setNetwork(n); setPackages(pkgs); setLoading(false);
    });
  }, [slug]);

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-10"><div className="h-40 animate-pulse rounded-xl border border-border bg-muted/40" /></div>;
  if (!network) return <div className="mx-auto max-w-5xl px-4 py-16 text-center"><h1 className="text-2xl font-extrabold">Network not found</h1><Link to="/networks" className="mt-4 inline-flex rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">All networks</Link></div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <nav className="mb-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-brand">Home</Link> <span className="mx-1">/</span>
        <Link to="/networks" className="hover:text-brand">Networks</Link> <span className="mx-1">/</span> {network.name}
      </nav>
      <div className="flex items-start gap-4">
        <NetworkLogo network={network} size="lg" />
        <div>
          <h1 className="text-2xl font-extrabold md:text-3xl">{network.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{network.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge variant="brand">{network.infrastructure}</Badge>
            <Badge variant="muted">{packages.length} packages</Badge>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="font-display font-bold">Coverage areas</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {network.coverageAreas.map(a => <Badge key={a} variant="outline">{a}</Badge>)}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h2 className="font-display font-bold">Supported providers</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {network.providers.map(p => <Link key={p.id} to={`/providers/${p.slug}`} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-sm hover:border-brand"><ProviderLogo provider={p} size="sm" /> {p.name}</Link>)}
          </div>
        </div>
      </div>

      <h2 className="mt-8 font-display text-xl font-bold">Available packages</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map(p => <PackageCard key={p.id} pkg={p} />)}
      </div>
    </div>
  );
}
