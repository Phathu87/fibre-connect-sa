import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Package, Check } from 'lucide-react';
import ProviderLogo from '@/components/ui/ProviderLogo';
import Badge from '@/components/ui/badge';
import PackageCard from '@/components/PackageCard';
import { providerService } from '@/services/providerService';
import { events } from '@/services/analyticsService';

export default function ProviderDetail() {
  const { slug } = useParams();
  const [provider, setProvider] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    events.providerViewed(slug);
    Promise.all([providerService.getBySlug(slug), providerService.packages(slug)]).then(([p, pkgs]) => {
      setProvider(p); setPackages(pkgs); setLoading(false);
    });
  }, [slug]);

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-10"><div className="h-40 animate-pulse rounded-xl border border-border bg-muted/40" /></div>;
  if (!provider) return <div className="mx-auto max-w-5xl px-4 py-16 text-center"><h1 className="text-2xl font-extrabold">Provider not found</h1><Link to="/providers" className="mt-4 inline-flex rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">All providers</Link></div>;

  const priceRange = packages.length ? [Math.min(...packages.map(p => p.promotionalPrice || p.monthlyPrice)), Math.max(...packages.map(p => p.promotionalPrice || p.monthlyPrice))] : [0, 0];
  const speeds = [...new Set(packages.map(p => p.downloadMbps))].sort((a, b) => a - b);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <nav className="mb-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-brand">Home</Link> <span className="mx-1">/</span>
        <Link to="/providers" className="hover:text-brand">Providers</Link> <span className="mx-1">/</span> {provider.name}
      </nav>
      <div className="flex items-start gap-4">
        <ProviderLogo provider={provider} size="lg" className="h-16 w-16 text-lg" />
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold md:text-3xl">{provider.name}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm"><Star className="h-4 w-4 fill-warning text-warning" /> <span className="font-medium">{provider.rating}</span> <span className="text-muted-foreground">({provider.reviewCount} reviews)</span></div>
          <p className="mt-2 text-sm text-muted-foreground">{provider.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {provider.connectivity.map(c => <Badge key={c} variant="brand">{c}</Badge>)}
            <Badge variant="muted">{packages.length} packages</Badge>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4"><Package className="h-5 w-5 text-brand" /><p className="mt-1 text-xs text-muted-foreground">Packages</p><p className="font-bold">{packages.length}</p></div>
        <div className="rounded-xl border border-border bg-card p-4"><Star className="h-5 w-5 text-brand" /><p className="mt-1 text-xs text-muted-foreground">Price range</p><p className="font-bold">R{priceRange[0]}–R{priceRange[1]}/mo</p></div>
        <div className="rounded-xl border border-border bg-card p-4"><Check className="h-5 w-5 text-brand" /><p className="mt-1 text-xs text-muted-foreground">Speeds</p><p className="font-bold">{speeds.join(', ')}Mbps</p></div>
      </div>

      <h2 className="mt-8 font-display text-xl font-bold">Available networks</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {provider.networks.map(n => <Link key={n.id} to={`/networks/${n.slug}`} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:border-brand">{n.name}</Link>)}
      </div>

      <h2 className="mt-8 font-display text-xl font-bold">Popular packages</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map(p => <PackageCard key={p.id} pkg={p} />)}
      </div>
    </div>
  );
}
