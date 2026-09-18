import React from 'react';
import { Link } from 'react-router-dom';
import { X, GitCompare } from 'lucide-react';
import { useCompare } from '@/hooks/useCollections';
import { useIsMobile } from '@/hooks/use-mobile';
import { getPackage, getProvider } from '@/data/mockData';

export default function CompareTray() {
  const { ids, remove, clear } = useCompare();
  const isMobile = useIsMobile();
  if (ids.length === 0) return null;

  return (
    <div className={`fixed z-40 ${isMobile ? 'bottom-16 inset-x-2' : 'bottom-4 left-1/2 -translate-x-1/2'} max-w-2xl`}>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-lg">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold shrink-0">
            <GitCompare className="h-4 w-4 text-brand" /> {ids.length} selected
          </span>
          <div className="flex items-center gap-1.5">
            {ids.slice(0, 4).map(id => {
              const pkg = getPackage(id);
              if (!pkg) return null;
              const prov = getProvider(pkg.providerId);
              return (
                <span key={id} className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted px-2 py-1 text-xs">
                  <span className="h-4 w-4 rounded font-bold text-white text-[8px] grid place-items-center" style={{ backgroundColor: prov?.color }}>{prov?.logoText}</span>
                  <span className="hidden sm:inline max-w-24 truncate">{pkg.downloadMbps}Mbps</span>
                  <button onClick={() => remove(id)} aria-label="Remove from comparison" className="text-muted-foreground hover:text-destructive"><X className="h-3 w-3" /></button>
                </span>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {ids.length >= 2 ? (
            <Link to="/compare" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark">Compare</Link>
          ) : (
            <span className="text-xs text-muted-foreground">Select 2+</span>
          )}
          <button onClick={clear} className="text-xs text-muted-foreground hover:text-foreground" aria-label="Clear comparison">Clear</button>
        </div>
      </div>
    </div>
  );
}