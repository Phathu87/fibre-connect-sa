import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, GitCompare, ArrowRight } from 'lucide-react';
import PackageCard from '@/components/PackageCard';
import { useSaved, useCompare } from '@/hooks/useCollections';
import { packageService } from '@/services/packageService';

export default function AccountSaved() {
  const { ids } = useSaved();
  const { count: compareCount } = useCompare();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { packageService.listAll().then(all => { setPackages(all.filter(p => ids.includes(p.id))); setLoading(false); }); }, [ids]);

  if (loading) return <div className="h-40 animate-pulse rounded-xl border border-border bg-muted/40" />;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">Saved packages</h2>
        {packages.length >= 2 && <Link to="/compare" className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white"><GitCompare className="h-4 w-4" /> Compare ({compareCount})</Link>}
      </div>
      {packages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <Heart className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 font-medium">No saved packages</p>
          <p className="text-sm text-muted-foreground">Save packages to revisit them here.</p>
          <Link to="/packages" className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">Browse packages <ArrowRight className="h-4 w-4" /></Link>
        </div>
      ) : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{packages.map(p => <PackageCard key={p.id} pkg={p} />)}</div>}
    </div>
  );
}