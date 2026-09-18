import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GitCompare, ArrowRight } from 'lucide-react';
import ProviderLogo from '@/components/ui/ProviderLogo';
import { useCompare } from '@/hooks/useCollections';
import { packageService } from '@/services/packageService';

export default function Comparisons() {
  const { ids } = useCompare();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { packageService.listAll().then(all => { setPackages(all.filter(p => ids.includes(p.id))); setLoading(false); }); }, [ids]);

  if (loading) return <div className="h-40 animate-pulse rounded-xl border border-border bg-muted/40" />;
  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-bold">Comparisons</h2>
      {packages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <GitCompare className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 font-medium">No active comparison</p>
          <p className="text-sm text-muted-foreground">Add 2–4 packages to compare them side by side.</p>
          <Link to="/packages" className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">Browse packages <ArrowRight className="h-4 w-4" /></Link>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2">
            {packages.map(p => (
              <span key={p.id} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm">
                <ProviderLogo provider={p.provider} size="sm" /> {p.provider?.name}
              </span>
            ))}
          </div>
          <Link to="/compare" className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">Open comparison <ArrowRight className="h-4 w-4" /></Link>
        </>
      )}
    </div>
  );
}