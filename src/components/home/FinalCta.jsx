import React from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import AddressSearchBar from '@/components/AddressSearchBar';

export default function FinalCta() {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-4xl px-4 py-14 text-center">
        <h2 className="text-2xl font-extrabold md:text-4xl">Ready to find your package?</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-primary-foreground/70">Enter your address and compare every fibre, 5G and LTE package available to you in one place.</p>
        <div className="mx-auto mt-6 max-w-3xl rounded-2xl bg-card p-4 text-foreground">
          <AddressSearchBar />
        </div>
        <Link to="/coverage" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-foreground/90 underline">
          Or use the full coverage checker <Search className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}