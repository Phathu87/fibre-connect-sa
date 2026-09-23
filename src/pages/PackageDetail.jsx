import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, GitCompare, ShieldCheck, Clock, Router, FileText, ChevronDown, ArrowRight, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import Badge from '@/components/ui/badge';
import { ConnectivityIcon } from '@/components/ui/Connectivity';
import ProviderLogo from '@/components/ui/ProviderLogo';
import PackageCard from '@/components/PackageCard';
import { packageService } from '@/services/packageService';
import { useCompare, useSaved } from '@/hooks/useCollections';
import { events } from '@/services/analyticsService';

const FAQ_ITEMS = [
  { q: 'Is this package available at my address?', a: 'Run a coverage check to confirm which network operators serve your address. This package is available wherever the listed network operator has coverage.' },
  { q: 'What is the total first-month cost?', a: 'The first month typically includes your subscription plus any once-off installation or router fees. Promotional pricing may apply for the first few months.' },
  { q: 'How long does installation take?', a: 'Most installations are completed within 3 to 7 working days after your application is approved by the provider.' },
  { q: 'Can I cancel anytime?', a: 'Cancellation terms depend on the contract length. Month-to-month packages can be cancelled with notice; fixed-term contracts may have early cancellation fees.' },
];

export default function PackageDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [faqOpen, setFaqOpen] = useState(null);
  const { toggle: toggleCompare, isComparing } = useCompare();
  const { toggle: toggleSaved, isSaved } = useSaved();

  useEffect(() => {
    setLoading(true);
    events.packageView(slug);
    packageService.getBySlug(slug).then(p => { setPkg(p); setLoading(false); });
    packageService.getRelated(slug).then(setRelated);
  }, [slug]);

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-10"><div className="h-80 animate-pulse rounded-xl border border-border bg-muted/40" /></div>;
  }
  if (!pkg) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center">
        <h1 className="text-2xl font-extrabold">Package not found</h1>
        <p className="mt-2 text-muted-foreground">This package may have been removed or is no longer active.</p>
        <Link to="/packages" className="mt-4 inline-flex rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">Browse packages</Link>
      </div>
    );
  }

  const comparing = isComparing(pkg.id);
  const saved = isSaved(pkg.id);
  const effectivePrice = pkg.promotionalPrice || pkg.monthlyPrice;
  const hasPromo = pkg.promotionalPrice !== null;
  const firstMonth = effectivePrice + pkg.installationFee + pkg.routerFee;

  const startEnquiry = () => {
    events.enquiryStarted(pkg.id);
    navigate(`/enquire?package=${pkg.slug}`);
  };

  const specs = [
    ['Connectivity', pkg.connectivityType],
    ['Download speed', `${pkg.downloadMbps} Mbps`],
    ['Upload speed', `${pkg.uploadMbps} Mbps`],
    ['Monthly price', `R${effectivePrice}`],
    ['Promotional price', hasPromo ? `R${pkg.promotionalPrice}` : '—'],
    ['Installation fee', pkg.installationFee === 0 ? 'Free' : `R${pkg.installationFee}`],
    ['Router', pkg.routerIncluded ? 'Included' : 'Not included'],
    ['Contract', pkg.contractMonths === 0 ? 'Month-to-month' : `${pkg.contractMonths} months`],
    ['Data', pkg.uncapped ? 'Uncapped' : `${pkg.dataAllowanceGb}GB`],
    ['Activation estimate', pkg.activationEstimate],
    ['Classification', pkg.business ? 'Business' : 'Residential'],
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <nav className="mb-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-brand">Home</Link> <span className="mx-1">/</span>
        <Link to="/packages" className="hover:text-brand">Packages</Link> <span className="mx-1">/</span>
        <Link to={`/providers/${pkg.provider?.slug}`} className="hover:text-brand">{pkg.provider?.name}</Link> <span className="mx-1">/</span>
        {pkg.name}
      </nav>

      {/* header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <ProviderLogo provider={pkg.provider} size="lg" />
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              {pkg.recommended && <Badge variant="brand">Recommended</Badge>}
              {pkg.bestValue && <Badge variant="success">Best value</Badge>}
              {pkg.mostPopular && <Badge variant="warning">Most popular</Badge>}
              {hasPromo && <Badge variant="dark">Promo</Badge>}
            </div>
            <h1 className="mt-2 text-2xl font-extrabold md:text-3xl">{pkg.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{pkg.provider?.name} on {pkg.network?.name} · {pkg.connectivityType}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => toggleSaved(pkg.id)} className={cn('inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium', saved ? 'border-destructive/30 bg-destructive/10 text-destructive' : 'border-border hover:bg-muted')}>
            <Heart className={cn('h-4 w-4', saved && 'fill-current')} /> {saved ? 'Saved' : 'Save'}
          </button>
          <button onClick={() => toggleCompare(pkg.id)} className={cn('inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium', comparing ? 'border-brand bg-brand/10 text-brand' : 'border-border hover:bg-muted')}>
            <GitCompare className="h-4 w-4" /> {comparing ? 'Comparing' : 'Compare'}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* coverage prompt */}
          <div className="flex items-center gap-3 rounded-xl border border-brand/30 bg-brand/5 p-4">
            <MapPin className="h-5 w-5 text-brand" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Check this package is available at your address</p>
              <p className="text-xs text-muted-foreground">Coverage confirmation is required before enquiring.</p>
            </div>
            <Link to="/coverage" className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white">Check coverage</Link>
          </div>

          {/* key facts */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: ConnectivityIcon, label: 'Speed', value: `${pkg.downloadMbps}/${pkg.uploadMbps}Mbps` },
              { icon: ShieldCheck, label: 'Data', value: pkg.uncapped ? 'Uncapped' : `${pkg.dataAllowanceGb}GB` },
              { icon: Clock, label: 'Contract', value: pkg.contractMonths === 0 ? 'M2M' : `${pkg.contractMonths}mo` },
              { icon: Router, label: 'Router', value: pkg.routerIncluded ? 'Included' : 'Own' },
            ].map(f => (
              <div key={f.label} className="rounded-xl border border-border bg-card p-3 text-center">
                <f.icon type={pkg.connectivityType} className="mx-auto h-5 w-5 text-brand" />
                <p className="mt-1 text-xs text-muted-foreground">{f.label}</p>
                <p className="text-sm font-bold">{f.value}</p>
              </div>
            ))}
          </div>

          {/* description */}
          <div>
            <h2 className="font-display text-lg font-bold">About this package</h2>
            <p className="mt-2 text-sm text-muted-foreground">{pkg.description}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border border-success/20 bg-success/5 p-3">
                <p className="text-sm font-semibold text-success">Best for</p>
                <p className="text-sm text-muted-foreground">{pkg.bestUseCase}</p>
              </div>
              <div className="rounded-lg border border-border bg-card p-3">
                <p className="text-sm font-semibold">Extras</p>
                <p className="text-sm text-muted-foreground">{pkg.extras.length ? pkg.extras.join(', ') : 'Standard package features'}</p>
              </div>
            </div>
          </div>

          {/* full specs */}
          <div>
            <h2 className="font-display text-lg font-bold">Full specifications</h2>
            <div className="mt-2 overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <tbody>
                  {specs.map((row, i) => (
                    <tr key={row[0]} className={i % 2 ? 'bg-muted/20' : ''}>
                      <th scope="row" className="p-3 text-left font-medium text-muted-foreground w-1/2">{row[0]}</th>
                      <td className="p-3 font-medium">{row[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* fair usage + installation */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4">
              <FileText className="h-5 w-5 text-brand" />
              <h3 className="mt-2 font-display font-bold">Fair usage policy</h3>
              <p className="mt-1 text-sm text-muted-foreground">{pkg.fairUsagePolicy}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <Clock className="h-5 w-5 text-brand" />
              <h3 className="mt-2 font-display font-bold">Installation process</h3>
              <p className="mt-1 text-sm text-muted-foreground">A network technician installs the fibre/CPE at your premises. Estimated activation: {pkg.activationEstimate}. Ensure someone is present for the site visit.</p>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h2 className="font-display text-lg font-bold">Frequently asked questions</h2>
            <div className="mt-2 divide-y divide-border rounded-xl border border-border">
              {FAQ_ITEMS.map((f, i) => (
                <div key={i}>
                  <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} className="flex w-full items-center justify-between p-4 text-left" aria-expanded={faqOpen === i}>
                    <span className="font-medium">{f.q}</span>
                    <ChevronDown className={cn('h-5 w-5 text-muted-foreground transition-transform', faqOpen === i && 'rotate-180')} />
                  </button>
                  {faqOpen === i && <p className="px-4 pb-4 text-sm text-muted-foreground">{f.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* sticky sidebar */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-display font-extrabold">R{effectivePrice}</span>
              <span className="text-sm text-muted-foreground">/month</span>
            </div>
            {hasPromo && <p className="text-sm text-muted-foreground"><span className="line-through">R{pkg.monthlyPrice}</span> <span className="text-success font-medium">promo until {pkg.promotionEnd}</span></p>}
            <div className="mt-4 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Installation</span><span className={pkg.installationFee === 0 ? 'text-success font-medium' : ''}>{pkg.installationFee === 0 ? 'Free' : `R${pkg.installationFee}`}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Router</span><span>{pkg.routerIncluded ? 'Included' : `R${pkg.routerFee}`}</span></div>
              <div className="flex justify-between border-t border-border pt-1.5"><span className="font-semibold">Est. first month</span><span className="font-bold">R{firstMonth}</span></div>
            </div>
            <button onClick={startEnquiry} className="mt-4 w-full rounded-lg bg-brand py-3 text-sm font-semibold text-white hover:bg-brand-dark">Get this package</button>
            <Link to={`/providers/${pkg.provider?.slug}`} className="mt-2 block text-center text-xs text-muted-foreground hover:text-brand">View {pkg.provider?.name} profile</Link>
          </div>
        </aside>
      </div>

      {/* related */}
      {related.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl font-bold">Similar packages</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map(p => <PackageCard key={p.id} pkg={p} />)}
          </div>
        </div>
      )}

      {/* sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-card/95 p-3 backdrop-blur-md md:hidden safe-bottom">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{pkg.name}</p>
            <p className="text-sm"><span className="font-extrabold">R{effectivePrice}</span><span className="text-muted-foreground">/mo</span></p>
          </div>
          <button onClick={startEnquiry} className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white">Get this package <ArrowRight className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}
