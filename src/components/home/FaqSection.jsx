import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FAQS } from '@/data/mockData';

export default function FaqSection() {
  const [open, setOpen] = useState(null);
  return (
    <section className="border-t border-border bg-card">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h2 className="text-2xl font-extrabold md:text-3xl">Frequently asked questions</h2>
        <div className="mt-6 divide-y divide-border rounded-xl border border-border">
          {FAQS.map(f => (
            <div key={f.id}>
              <button onClick={() => setOpen(open === f.id ? null : f.id)} className="flex w-full items-center justify-between gap-4 p-4 text-left" aria-expanded={open === f.id}>
                <span className="font-medium">{f.question}</span>
                <ChevronDown className={cn('h-5 w-5 shrink-0 text-muted-foreground transition-transform', open === f.id && 'rotate-180')} />
              </button>
              {open === f.id && <p className="px-4 pb-4 text-sm text-muted-foreground">{f.answer}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}