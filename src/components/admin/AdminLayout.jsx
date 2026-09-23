import React, { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Building2, Network, Package, MapPin, FileText, Users, Tag, FileEdit, BarChart3, Settings, ShieldCheck, LogOut, ScrollText } from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/lib/AuthContext';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/providers', label: 'Providers', icon: Building2 },
  { to: '/admin/networks', label: 'Networks', icon: Network },
  { to: '/admin/packages', label: 'Packages', icon: Package },
  { to: '/admin/coverage', label: 'Coverage', icon: MapPin },
  { to: '/admin/enquiries', label: 'Enquiries', icon: FileText },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/promotions', label: 'Promotions', icon: Tag },
  { to: '/admin/content', label: 'Content', icon: FileEdit },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/audit', label: 'Audit log', icon: ScrollText },
];

export default function AdminLayout() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 border-r border-border bg-card transition-transform lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center border-b border-border px-4"><Logo /></div>
        <nav className="flex flex-col gap-0.5 p-2" aria-label="Admin">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.end} onClick={() => setOpen(false)} className={({isActive}) => cn('inline-flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium', isActive ? 'bg-brand/10 text-brand' : 'text-foreground/70 hover:bg-muted')}>
              <n.icon className="h-4 w-4" /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto p-3">
          <Link to="/" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"><LogOut className="h-4 w-4" /> Exit admin</Link>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-card px-4">
          <button onClick={() => setOpen(true)} className="lg:hidden"><LayoutDashboard className="h-5 w-5" /></button>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand"><ShieldCheck className="h-3.5 w-3.5" /> {user?.role || 'Admin'}</span>
          <p className="ml-auto text-xs text-muted-foreground">Server-enforced administrative access</p>
        </header>
        <div className="p-4 lg:p-6"><Outlet /></div>
      </div>
    </div>
  );
}
