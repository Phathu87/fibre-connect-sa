import React from 'react';
import { cn } from '@/lib/utils';

const VARIANTS = {
  brand: 'bg-brand text-white',
  dark: 'bg-primary text-primary-foreground',
  outline: 'border border-border bg-card text-foreground',
  success: 'bg-success/10 text-success border border-success/20',
  warning: 'bg-warning/10 text-warning border border-warning/20',
  muted: 'bg-muted text-muted-foreground',
};

export default function Badge({ children, variant = 'muted', className = '', ...props }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold', VARIANTS[variant], className)} {...props}>
      {children}
    </span>
  );
}
