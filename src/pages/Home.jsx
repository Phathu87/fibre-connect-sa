import React from 'react';
import { ShieldCheck, Layers, Zap } from 'lucide-react';
import AddressSearchBar from '@/components/AddressSearchBar';
import NetworkTicker from '@/components/home/NetworkTicker';
import FeaturedDeals from '@/components/home/FeaturedDeals';
import HowItWorks from '@/components/home/HowItWorks';
import SpeedCalculator from '@/components/home/SpeedCalculator';
import ConnectivityMatrix from '@/components/home/ConnectivityMatrix';
import ProvidersStrip from '@/components/home/ProvidersStrip';
import PopularLocations from '@/components/home/PopularLocations';
import FaqSection from '@/components/home/FaqSection';
import FinalCta from '@/components/home/FinalCta';

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-brand/5 to-background">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[1fr_320px] lg:py-20">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
              <Zap className="h-3.5 w-3.5" /> Compare multiple providers in one place
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-[1.3] tracking-tight text-balance sm:text-4xl lg:text-[4.5rem] lg:leading-[1.2]">
              Find the right internet package for your address
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
              Compare fibre, LTE and 5G packages available in your area across South African networks and service providers.
            </p>
            <div className="mt-6 rounded-2xl border border-border bg-card p-4 shadow-sm">
              <AddressSearchBar />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-success" /> POPIA-aware privacy</span>
              <span className="inline-flex items-center gap-1.5"><Layers className="h-4 w-4 text-brand" /> Fibre · 5G · LTE</span>
              <span className="inline-flex items-center gap-1.5"><Zap className="h-4 w-4 text-warning" /> Fast coverage check</span>
            </div>
          </div>
          <aside className="lg:pt-16">
            <NetworkTicker />
          </aside>
        </div>
      </section>

      <FeaturedDeals />
      <HowItWorks />
      <SpeedCalculator />
      <ConnectivityMatrix />
      <ProvidersStrip />
      <PopularLocations />
      <FaqSection />
      <FinalCta />
    </>
  );
}