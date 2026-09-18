import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, GitCompare, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCompare, useSaved } from '@/hooks/useCollections';

const ITEMS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/coverage', label: 'Coverage', icon: Search },
  { to: '/compare', label: 'Compare', icon: GitCompare, badge: 'compare' },
  { to: '/saved', label: 'Saved', icon: Heart, badge: 'saved' },
  { to: '/account', label: 'Account', icon: User },
];

export default function MobileBar() {
  const { count: compareCount } = useCompare();
  const { count: savedCount } = useSaved();
  const location = useLocation();
  const badges = { compare: compareCount, saved: savedCount };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur-md safe-bottom lg:hidden" aria-label="Mobile navigation">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-1">
        {ITEMS.map(({ to, label, icon: Icon, badge }) => {
          const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
          const count = badge ? badges[badge] : 0;
          return (
            <Link key={to} to={to} className={cn('relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium', active ? 'text-brand' : 'text-muted-foreground')}>
              <span className="relative">
                <Icon className="h-5 w-5" />
                {count > 0 && <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[9px] font-bold text-white">{count}</span>}
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
