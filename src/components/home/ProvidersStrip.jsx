import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProviderLogo from '@/components/ui/ProviderLogo';
import { StatusDot } from '@/components/ui/Connectivity';
import { providerService } from '@/services/providerService';

export default function ProvidersStrip() {
  const [providers, setProviders] = useState([]);
  useEffect(() => { providerService.list().then(setProviders); }, []);

  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-2xl font-extrabold md:text-3xl">Major providers & networks</h2>
        <p className="mt-1 text-sm text-muted-foreground">Compare packages from leading South African ISPs and network operators.</p>
        <div className="mt-6 flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {providers.map(p => (
            <Link key={p.id} to={`/providers/${p.slug}`} className="flex min-w-[200px] flex-col gap-3 rounded-xl border border-border bg-background p-4 hover:border-brand hover:shadow-sm">
              <div className="flex items-center gap-2.5">
                <ProviderLogo provider={p} size="lg" />
                <div>
                  <p className="font-display font-bold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.packageCount} packages</p>
                </div>
              </div>
              <StatusDot status="available" label={`${p.connectivity.join(', ')} available`} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}