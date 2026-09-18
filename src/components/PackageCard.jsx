import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, GitCompare, ArrowRight, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import { SpeedBadge } from '@/components/ui/Connectivity';
import ProviderLogo from '@/components/ui/ProviderLogo';
import NetworkLogo from '@/components/ui/NetworkLogo';
import { useCompare, useSaved } from '@/hooks/useCollections';
import { events } from '@/services/analyticsService';

export default function PackageCard({ pkg, className = '' }) {
  const { toggle: toggleCompare, isComparing } = useCompare();
  const { toggle: toggleSaved, isSaved } = useSaved();
  const comparing = isComparing(pkg.id);
  const saved = isSaved(pkg.id);

  const effectivePrice = pkg.promotionalPrice || pkg.monthlyPrice;
  const hasPromo = pkg.promotionalPrice !== null;

  return (
    <article className={cn('group relative flex flex-col rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md', className)}>
      {/* badges */}
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {pkg.recommended && <Badge variant="brand">Recommended</Badge>}
        {pkg.bestValue && <Badge variant="success">Best value</Badge>}
        {pkg.mostPopular && <Badge variant="warning">Most popular</Badge>}
        {hasPromo && <Badge variant="dark">Promo</Badge>}
        {pkg.business && <Badge variant="outline">Business</Badge>}
      </div>

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <ProviderLogo provider={pkg.provider} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">{pkg.provider?.name}</p>
            <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground"><NetworkLogo network={pkg.network} size="xs" /> {pkg.network?.name} · {pkg.connectivityType}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { toggleSaved(pkg.id); events.packageSaved(pkg.id); }}
            className={cn('grid h-8 w-8 place-items-center rounded-lg border border-border transition-colors', saved ? 'border-destructive/30 bg-destructive/10 text-destructive' : 'text-muted-foreground hover:text-foreground')}
            aria-label={saved ? 'Remove from saved' : 'Save package'}
            aria-pressed={saved}
          >
            <Heart className={cn('h-4 w-4', saved && 'fill-current')} />
          </button>
        </div>
      </div>

      <Link to={`/packages/${pkg.slug}`} className="mt-3 block" onClick={() => events.packageView(pkg.slug)}>
        <h3 className="font-display text-base font-bold leading-snug group-hover:text-brand">{pkg.name}</h3>
      </Link>

      <div className="mt-3 flex items-center gap-2">
        <SpeedBadge download={pkg.downloadMbps} upload={pkg.uploadMbps} />
        {pkg.uncapped ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-success"><Check className="h-3.5 w-3.5" /> Uncapped</span>
        ) : (
          <span className="text-xs font-medium text-muted-foreground">{pkg.dataAllowanceGb}GB</span>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-display font-extrabold tracking-tight">R{effectivePrice}</span>
            <span className="text-xs text-muted-foreground">/month</span>
          </div>
          {hasPromo && <p className="text-xs text-muted-foreground line-through">R{pkg.monthlyPrice}</p>}
          {!hasPromo && pkg.installationFee === 0 && <p className="text-xs text-success font-medium">Free installation</p>}
          {pkg.installationFee > 0 && <p className="text-xs text-muted-foreground">Setup R{pkg.installationFee}</p>}
        </div>
        <div className="text-right text-xs text-muted-foreground">
          {pkg.routerIncluded ? <span className="inline-flex items-center gap-1 text-success"><Check className="h-3 w-3" /> Router incl.</span> : 'Router not incl.'}
          <p className="mt-0.5">{pkg.contractMonths === 0 ? 'Month-to-month' : `${pkg.contractMonths} mo`}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Link
          to={`/packages/${pkg.slug}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          onClick={() => events.packageView(pkg.slug)}
        >
          Get this package <ArrowRight className="h-4 w-4" />
        </Link>
        <button
          onClick={() => toggleCompare(pkg.id)}
          className={cn('inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors', comparing ? 'border-brand bg-brand/10 text-brand' : 'border-border text-foreground hover:bg-muted')}
          aria-pressed={comparing}
        >
          <GitCompare className="h-4 w-4" /> <span className="hidden sm:inline">Compare</span>
        </button>
      </div>
    </article>
  );
}
