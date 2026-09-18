import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function Logo({ className, compact = false }) {
  return (
    <Link to="/" className={cn('flex items-center gap-2 font-display font-extrabold tracking-tight', className)} aria-label="FibreConnect SA home">
      <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12h4l2-7 4 14 2-7h4" />
        </svg>
      </span>
      {!compact && (
        <span className="text-lg leading-none">
          FibreConnect<span className="text-brand"> SA</span>
        </span>
      )}
    </Link>
  );
}