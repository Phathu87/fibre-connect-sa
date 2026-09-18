import React from 'react';
import { Search, GitCompare, FileCheck, Rocket } from 'lucide-react';

const STEPS = [
  { icon: Search, title: 'Check coverage', desc: 'Enter your address to see which fibre, 5G and LTE networks serve your area.' },
  { icon: GitCompare, title: 'Compare packages', desc: 'Filter and compare up to 4 packages side by side on speed, price and features.' },
  { icon: FileCheck, title: 'Enquire or apply', desc: 'Submit an enquiry with your details and we forward it to the provider.' },
  { icon: Rocket, title: 'Get connected', desc: 'The provider contacts you to finalise your order and schedule installation.' },
];

export default function HowItWorks() {
  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-2xl font-extrabold md:text-3xl">How FibreConnect works</h2>
        <p className="mt-1 text-sm text-muted-foreground">From address to connected in four clear steps.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative rounded-xl border border-border bg-background p-5">
              <span className="absolute right-4 top-4 text-3xl font-extrabold text-muted/40">{i + 1}</span>
              <s.icon className="h-7 w-7 text-brand" />
              <h3 className="mt-3 font-display text-base font-bold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}