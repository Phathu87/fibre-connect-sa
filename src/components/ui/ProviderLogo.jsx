import React from 'react';
import { cn } from '@/lib/utils';

export default function ProviderLogo({ provider, size = 'md', className = '' }) {
  const sizes = { sm: 'h-7 w-7 text-[10px]', md: 'h-9 w-9 text-xs', lg: 'h-12 w-12 text-sm' };
  return (
    <span
      className={cn('inline-flex items-center justify-center rounded-lg font-display font-bold text-white shrink-0', sizes[size], className)}
      style={{ backgroundColor: provider?.color || '#0f172a' }}
      aria-hidden="true"
    >
      {provider?.logoText || provider?.name?.slice(0, 2) || '?'}
    </span>
  );
}
