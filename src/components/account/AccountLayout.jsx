import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { User, MapPin, Heart, GitCompare, FileText, Bell, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';

const NAV = [
  { to: '/account', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/account/profile', label: 'Profile', icon: User },
  { to: '/account/addresses', label: 'Addresses', icon: MapPin },
  { to: '/account/saved', label: 'Saved packages', icon: Heart },
  { to: '/account/comparisons', label: 'Comparisons', icon: GitCompare },
  { to: '/account/enquiries', label: 'Enquiries', icon: FileText },
  { to: '/account/notifications', label: 'Notifications', icon: Bell },
  { to: '/account/privacy', label: 'Privacy', icon: ShieldCheck },
];

export default function AccountLayout() {
  const { user } = useAuth();
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-brand text-white font-bold">{(user?.full_name || user?.email || 'U').charAt(0).toUpperCase()}</span>
        <div>
          <h1 className="text-xl font-extrabold md:text-2xl">My account</h1>
          <p className="text-sm text-muted-foreground">{user?.email || 'Guest session'}</p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside>
          <nav className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible no-scrollbar" aria-label="Account">
            {NAV.map(n => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({isActive}) => cn('inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium', isActive ? 'bg-brand/10 text-brand' : 'hover:bg-muted text-foreground/70')}>
                <n.icon className="h-4 w-4" /> {n.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div><Outlet /></div>
      </div>
    </div>
  );
}
