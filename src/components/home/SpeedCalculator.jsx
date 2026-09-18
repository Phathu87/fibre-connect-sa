import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, MonitorPlay, Gauge, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { track } from '@/services/analyticsService';

const SIZES = [
  { key: '1-2', label: '1–2', desc: 'Solo or couple' },
  { key: '3-4', label: '3–4', desc: 'Small family' },
  { key: '5-6', label: '5–6', desc: 'Large family' },
  { key: '7+', label: '7+', desc: 'Shared home' },
];

const USAGE = [
  { key: 'light', label: 'Light', desc: 'Browsing, email, SD streaming', perPerson: 10 },
  { key: 'medium', label: 'Medium', desc: 'HD streaming, video calls, WFH', perPerson: 25 },
  { key: 'heavy', label: 'Heavy', desc: '4K streaming, gaming, big downloads', perPerson: 50 },
];

function sizeMultiplier(key) {
  if (key === '1-2') return 2;
  if (key === '3-4') return 4;
  if (key === '5-6') return 6;
  return 8;
}

function recommend(sizeKey, usageKey) {
  const people = sizeMultiplier(sizeKey);
  const perPerson = USAGE.find(u => u.key === usageKey).perPerson;
  const need = people * perPerson;
  // Snap to common package speeds
  const tiers = [25, 50, 100, 200, 500];
  const rec = tiers.find(t => t >= need) || 500;
  return { rec, need };
}

export default function SpeedCalculator() {
  const [size, setSize] = useState('3-4');
  const [usage, setUsage] = useState('medium');
  const [result, setResult] = useState(null);

  const calculate = () => {
    const { rec, need } = recommend(size, usage);
    setResult({ rec, need });
    track('speed_calculator_used', { household: size, usage, recommended_mbps: rec });
  };

  return (
    <section className="border-y border-border bg-muted/20">
      <div className="mx-auto max-w-5xl px-4 py-14">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
            <Sparkles className="h-3.5 w-3.5" /> Speed finder
          </span>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">What speed does your household need?</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Tell us how many people are at home and how they use the internet — we'll suggest a broadband speed that fits.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
          {/* Step 1: household size */}
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold"><Users className="h-4 w-4 text-brand" /> How many people in your household?</p>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {SIZES.map(s => (
                <button key={s.key} type="button" onClick={() => setSize(s.key)}
                  className={cn('rounded-xl border p-3 text-left transition', size === s.key ? 'border-brand bg-brand/10 ring-1 ring-brand' : 'border-border hover:bg-muted/50')}>
                  <p className="text-lg font-bold">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: usage */}
          <div className="mt-6">
            <p className="flex items-center gap-2 text-sm font-semibold"><MonitorPlay className="h-4 w-4 text-brand" /> What do you stream and do online?</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {USAGE.map(u => (
                <button key={u.key} type="button" onClick={() => setUsage(u.key)}
                  className={cn('rounded-xl border p-3 text-left transition', usage === u.key ? 'border-brand bg-brand/10 ring-1 ring-brand' : 'border-border hover:bg-muted/50')}>
                  <p className="font-bold">{u.label}</p>
                  <p className="text-xs text-muted-foreground">{u.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <button onClick={calculate} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-brand-dark sm:w-auto">
            <Gauge className="h-4 w-4" /> Suggest a speed
          </button>

          {/* Result */}
          {result && (
            <div className="mt-6 rounded-xl border border-brand/30 bg-brand/5 p-5 animate-fade-up">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Recommended speed</p>
                  <p className="mt-1 text-3xl font-extrabold text-brand">{result.rec} <span className="text-lg font-bold text-muted-foreground">Mbps</span></p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Based on roughly {result.need} Mbps of typical demand in your home. A {result.rec} Mbps package keeps everyone streaming smoothly, even at busy times.
                  </p>
                </div>
                <Link to={`/packages?minSpeed=${result.rec}`} className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark whitespace-nowrap sm:w-auto">
                  View {result.rec} Mbps packages <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
        <p className="mt-3 text-center text-xs text-muted-foreground">Estimate only. Real needs depend on devices, concurrent use and upload requirements.</p>
      </div>
    </section>
  );
}