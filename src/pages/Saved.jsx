import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, GitCompare, ArrowRight } from 'lucide-react';
import PackageCard from '@/components/PackageCard';
import { useSaved, useCompare } from '@/hooks/useCollections';
import { packageService } from '@/services/packageService';

export default function Saved() {
  const { ids, toggle } = useSaved();
  const { toggle: toggleCompare } = useCompare();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    packageService.listAll().then(all => {
      setPackages(all.filter(p => ids.includes(p.id)));
      setLoading(false);
    });
  }, [ids]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold md:text-3xl">Saved packages</h1>
          <p className="mt-1 text-sm text-muted-foreground">{packages.length} package{packages.length !== 1 ? 's' : ''} in your shortlist.</p>
        </div>
        {packages.length >= 2 && <Link to="/compare" className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white"><GitCompare className="h-4 w-4" /> Compare saved</Link>}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-xl border border-border bg-muted/40" />)}
        </div>
      ) : packages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <Heart className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-3 font-display text-lg font-bold">No saved packages yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tap the heart on any package to save it here for later.</p>
          <Link to="/packages" className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white">Browse packages <ArrowRight className="h-4 w-4" /></Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map(p => <PackageCard key={p.id} pkg={p} />)}
        </div>
      )}
      <p className="mt-6 text-xs text-muted-foreground">Saved packages are stored locally in your browser. Sign in to sync them to your account in future.</p>
    </div>
  );
}