import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import PackageCard from '@/components/PackageCard';
import { packageService } from '@/services/packageService';

export default function FeaturedDeals() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    packageService.getFeatured().then(p => { setItems(p); setLoading(false); });
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-extrabold md:text-3xl">Featured fibre deals</h2>
          <p className="mt-1 text-sm text-muted-foreground">Top picks across providers and networks. Sample pricing for demonstration.</p>
        </div>
        <Link to="/packages" className="hidden items-center gap-1 text-sm font-semibold text-brand hover:underline sm:inline-flex">View all packages <ArrowRight className="h-4 w-4" /></Link>
      </div>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-64 animate-pulse rounded-xl border border-border bg-muted/40" />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(p => <PackageCard key={p.id} pkg={p} />)}
        </div>
      )}
      <div className="mt-6 text-center sm:hidden">
        <Link to="/packages" className="inline-flex items-center gap-1 text-sm font-semibold text-brand">View all packages <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </section>
  );
}