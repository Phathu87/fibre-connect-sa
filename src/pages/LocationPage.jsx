import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Check, ArrowRight } from 'lucide-react';
import PackageCard from '@/components/PackageCard';
import AddressSearchBar from '@/components/AddressSearchBar';
import NetworkLogo from '@/components/ui/NetworkLogo';
import { getProvince, getCity, getSuburb, SUBURBS, CITIES, getNetwork } from '@/data/mockData';
import { packageService } from '@/services/packageService';
import { events } from '@/services/analyticsService';

export default function LocationPage() {
  const { province, city, suburb } = useParams();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const prov = getProvince(province);
  const cityObj = city ? getCity(city) : null;
  const suburbObj = suburb ? getSuburb(suburb) : null;

  const level = suburb ? 'suburb' : city ? 'city' : 'province';
  const label = suburbObj?.name || cityObj?.name || prov?.name || 'South Africa';
  const slugPath = `${province}${city ? `/${city}` : ''}${suburb ? `/${suburb}` : ''}`;

  useEffect(() => { events.locationPageViewed(slugPath); }, [slugPath]);

  // Determine networks for this location
  const networks = useMemo(() => {
    if (suburbObj) return suburbObj.networks.map(getNetwork).filter(Boolean);
    if (cityObj) {
      const subs = SUBURBS.filter(s => s.city === cityObj.slug);
      const ids = [...new Set(subs.flatMap(s => s.networks))];
      return ids.map(getNetwork).filter(Boolean);
    }
    if (prov) {
      const subs = SUBURBS.filter(s => s.province === prov.slug);
      const ids = [...new Set(subs.flatMap(s => s.networks))];
      return ids.map(getNetwork).filter(Boolean);
    }
    return [];
  }, [suburbObj, cityObj, prov]);

  useEffect(() => {
    setLoading(true);
    packageService.listAll().then(all => {
      const networkIds = networks.map(n => n.id);
      const filtered = all.filter(p => networkIds.includes(p.networkId));
      setPackages(filtered);
      setLoading(false);
    });
  }, [networks]);

  if (!prov) {
    return <div className="mx-auto max-w-3xl px-4 py-16 text-center"><h1 className="text-2xl font-extrabold">Location not found</h1><Link to="/" className="mt-4 inline-flex rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">Home</Link></div>;
  }

  const breadcrumbs = [['Home', '/'], ['Fibre locations', '/packages']];
  if (prov) breadcrumbs.push([prov.name, `/fibre/${prov.slug}`]);
  if (cityObj) breadcrumbs.push([cityObj.name, `/fibre/${prov.slug}/${cityObj.slug}`]);
  if (suburbObj) breadcrumbs.push([suburbObj.name, `/fibre/${prov.slug}/${cityObj.slug}/${suburbObj.slug}`]);

  const childLinks = level === 'province' ? CITIES.filter(c => c.province === prov.slug)
    : level === 'city' ? SUBURBS.filter(s => s.city === cityObj.slug) : [];

  const priceRange = packages.length ? [Math.min(...packages.map(p => p.promotionalPrice || p.monthlyPrice)), Math.max(...packages.map(p => p.promotionalPrice || p.monthlyPrice))] : null;
  const speeds = [...new Set(packages.map(p => p.downloadMbps))].sort((a, b) => a - b);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <nav className="mb-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
        {breadcrumbs.map(([l, to], i) => <span key={i}>{i > 0 && <span className="mx-1">/</span>}<Link to={to} className="hover:text-brand">{l}</Link></span>)}
      </nav>

      <h1 className="text-2xl font-extrabold md:text-4xl">Fibre & broadband in {label}</h1>
      <p className="mt-2 text-muted-foreground">Discover connectivity available in {label}, {prov.name}. Compare fibre, 5G and LTE packages from providers serving this area.</p>

      <div className="mt-5 rounded-2xl border border-border bg-card p-4">
        <AddressSearchBar variant="compact" />
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4"><MapPin className="h-5 w-5 text-brand" /><p className="mt-1 text-xs text-muted-foreground">Networks</p><p className="font-bold">{networks.length}</p></div>
        <div className="rounded-xl border border-border bg-card p-4"><Check className="h-5 w-5 text-brand" /><p className="mt-1 text-xs text-muted-foreground">Packages</p><p className="font-bold">{packages.length}</p></div>
        <div className="rounded-xl border border-border bg-card p-4"><ArrowRight className="h-5 w-5 text-brand" /><p className="mt-1 text-xs text-muted-foreground">Price range</p><p className="font-bold">{priceRange ? `R${priceRange[0]}–R${priceRange[1]}` : '—'}</p></div>
      </div>

      {childLinks.length > 0 && (
        <div className="mt-6">
          <h2 className="font-display text-lg font-bold">{level === 'province' ? 'Cities' : 'Suburbs'} in {label}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {childLinks.map(c => {
              const to = level === 'province' ? `/fibre/${prov.slug}/${c.slug}` : `/fibre/${prov.slug}/${cityObj.slug}/${c.slug}`;
              return <Link key={c.slug} to={to} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm hover:border-brand"><MapPin className="h-3.5 w-3.5 text-brand" /> {c.name}</Link>;
            })}
          </div>
        </div>
      )}

      <h2 className="mt-8 font-display text-xl font-bold">Network operators in {label}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {networks.length ? networks.map(n => <Link key={n.id} to={`/networks/${n.slug}`} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:border-brand"><NetworkLogo network={n} size="xs" />{n.name}</Link>) : <p className="text-sm text-muted-foreground">No networks confirmed in this area yet.</p>}
      </div>

      <h2 className="mt-8 font-display text-xl font-bold">Packages available in {label}</h2>
      {loading ? <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-xl border border-border bg-muted/40" />)}</div> :
        packages.length ? <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{packages.map(p => <PackageCard key={p.id} pkg={p} />)}</div> :
        <div className="mt-3 rounded-xl border border-dashed border-border p-8 text-center"><p className="font-medium">No packages found for this area.</p><p className="mt-1 text-sm text-muted-foreground">Run a coverage check for your exact address to see all available options.</p><Link to="/coverage" className="mt-3 inline-flex rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">Check coverage</Link></div>
      }

      <div className="mt-10 rounded-2xl bg-primary p-6 text-center text-primary-foreground">
        <h2 className="font-display text-xl font-bold">Check your exact address in {label}</h2>
        <p className="mt-1 text-sm text-primary-foreground/70">Availability can vary street by street. Confirm what is available at your home.</p>
        <Link to="/coverage" className="mt-4 inline-flex rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-primary">Check coverage</Link>
      </div>
    </div>
  );
}
