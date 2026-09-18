import React from 'react';
import { cn } from '@/lib/utils';

const SIZES = {
  xs: 'h-5 w-8 text-[8px] rounded',
  sm: 'h-8 w-12 text-[10px] rounded-md',
  md: 'h-10 w-16 text-xs rounded-lg',
  lg: 'h-16 w-24 text-sm rounded-xl',
};

export default function NetworkLogo({ network, size = 'md', className = '' }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden border border-border bg-white p-1 font-display font-bold text-white',
        SIZES[size],
        className,
      )}
      style={network?.logo ? undefined : { backgroundColor: network?.color || '#0f172a' }}
      aria-hidden="true"
    >
      {network?.logo ? (
        <img src={network.logo} alt="" className="h-full w-full object-contain" loading="lazy" />
      ) : (
        network?.logoText || network?.name?.slice(0, 2) || '?'
      )}
    </span>
  );
}
