import React from 'react';
import { cn } from '@/lib/utils';

export function SpeedBadge({ download, upload, className = '', size = 'md' }) {
  const sizes = { sm: 'text-xs px-2 py-0.5', md: 'text-sm px-2.5 py-1', lg: 'text-base px-3 py-1.5' };
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md border border-brand/30 bg-brand/5 font-mono font-semibold text-brand', sizes[size], className)}>
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" /></svg>
      {download}<span className="font-normal text-muted-foreground">/{upload}Mbps</span>
    </span>
  );
}

export function ConnectivityIcon({ type, className = '' }) {
  const paths = {
    Fibre: <path d="M4 12h16M4 6h16M4 18h16" />,
    '5G': <path d="M5 12.5a7 7 0 0114 0M8 12.5a4 4 0 018 0M11 12.5a1 1 0 012 0" />,
    LTE: <path d="M2 12a10 10 0 0120 0M6 12a6 6 0 0112 0M10 12a2 2 0 014 0" />,
  };
  return (
    <svg viewBox="0 0 24 24" className={cn('h-4 w-4', className)} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      {paths[type] || paths.Fibre}
    </svg>
  );
}

export function StatusDot({ status = 'available', label }) {
  const colors = {
    available: 'bg-success',
    partial: 'bg-warning',
    unavailable: 'bg-muted-foreground',
  };
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
      <span className={cn('h-2 w-2 rounded-full animate-pulse-dot', colors[status])} />
      {label}
    </span>
  );
}
