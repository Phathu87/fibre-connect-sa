import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, MapPin, GitCompare, Heart, User, Sun, Moon, Monitor, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '@/components/ui/Logo';
import { useTheme } from '@/lib/ThemeContext';
import { useCompare, useSaved } from '@/hooks/useCollections';
import { useAuth } from '@/lib/AuthContext';

const NAV_LINKS = [
  { to: '/coverage', label: 'Coverage' },
  { to: '/packages', label: 'Packages' },
  { to: '/providers', label: 'Providers' },
  { to: '/networks', label: 'Networks' },
  { to: '/business', label: 'Business' },
  { to: '/help', label: 'Help' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { count: compareCount } = useCompare();
  const { count: savedCount } = useSaved();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Logo />
        <span className="hidden items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground lg:inline-flex">
          <MapPin className="h-3.5 w-3.5 text-brand" /> South Africa
        </span>

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV_LINKS.map(l => (
            <NavLink key={l.to} to={l.to} className={({isActive}) => cn('rounded-lg px-3 py-2 text-sm font-medium transition-colors', isActive ? 'bg-brand/10 text-brand' : 'text-foreground/70 hover:text-foreground hover:bg-muted')}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 lg:ml-2">
          <Link to="/compare" className="relative hidden h-9 w-9 items-center justify-center rounded-lg text-foreground/70 hover:bg-muted hover:text-foreground lg:inline-flex" aria-label={`Compare ${compareCount} packages`}>
            <GitCompare className="h-5 w-5" />
            {compareCount > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">{compareCount}</span>}
          </Link>
          <Link to="/saved" className="relative hidden h-9 w-9 items-center justify-center rounded-lg text-foreground/70 hover:bg-muted hover:text-foreground lg:inline-flex" aria-label={`Saved ${savedCount} packages`}>
            <Heart className="h-5 w-5" />
            {savedCount > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">{savedCount}</span>}
          </Link>

          {/* theme */}
          <div className="relative hidden sm:block">
            <button onClick={() => setThemeOpen(v => !v)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground/70 hover:bg-muted hover:text-foreground" aria-label="Theme options" aria-expanded={themeOpen}>
              {theme === 'dark' ? <Moon className="h-5 w-5" /> : theme === 'light' ? <Sun className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
            </button>
            {themeOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setThemeOpen(false)} />
                <div className="absolute right-0 z-20 mt-2 w-40 rounded-lg border border-border bg-card p-1 shadow-lg">
                  {[['light', 'Light', Sun], ['dark', 'Dark', Moon], ['system', 'System', Monitor]].map(([val, label, Icon]) => (
                    <button key={val} onClick={() => { setTheme(val); setThemeOpen(false); }} className={cn('flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm', theme === val ? 'bg-brand/10 text-brand' : 'hover:bg-muted')}>
                      <Icon className="h-4 w-4" /> {label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {isAuthenticated ? (
            <Link to="/account" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted">
              <User className="h-4 w-4" /> <span className="hidden sm:inline">Account</span>
            </Link>
          ) : (
            <Link to="/login" className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-sm font-semibold text-white hover:bg-brand-dark sm:w-auto sm:gap-1.5 sm:px-3" aria-label="Sign in">
              <User className="h-4 w-4 sm:hidden" /> <span className="hidden sm:inline">Sign in</span>
            </Link>
          )}

          <button onClick={() => setOpen(v => !v)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-foreground lg:hidden" aria-label="Menu" aria-expanded={open}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* mobile menu */}
      {open && (
        <div className="border-t border-border bg-card lg:hidden">
          <nav className="flex flex-col p-2" aria-label="Mobile">
            {NAV_LINKS.map(l => (
              <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)} className={({isActive}) => cn('flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium', isActive ? 'bg-brand/10 text-brand' : 'hover:bg-muted')}>
                {l.label}
              </NavLink>
            ))}
            <Link to="/partners" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted"><Building2 className="h-4 w-4" /> Partners</Link>
            <Link to="/download" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted">Download app</Link>
            <Link to="/contact" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted">Contact</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
