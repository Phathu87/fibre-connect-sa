import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Locate, Search } from 'lucide-react';
import { PROVINCES } from '@/data/mockData';
import { searchHistoryService } from '@/services/userDataService';
import { useRecentSearches } from '@/hooks/useCollections';
import { events } from '@/services/analyticsService';
import { coverageService } from '@/services/coverageService';
import { coverageSessionService } from '@/services/coverageSessionService';
import { locationService } from '@/services/locationService';

export default function AddressSearchBar({ variant = 'hero', onSearch = null }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ street: '', suburb: '', city: '', province: '', postalCode: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const recent = useRecentSearches();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e?.preventDefault();
    if (!form.street && !form.suburb && !form.city) return;
    setLoading(true);
    setError('');
    events.coverageSearchStarted(form);
    searchHistoryService.add(form);
    try {
      const result = await coverageService.check(form);
      coverageSessionService.set(form, result);
      if (onSearch) onSearch(form, result);
      else navigate('/coverage/results');
    } catch {
      setError('Coverage checking is temporarily unavailable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const useLocation = async () => {
    setError('');
    try { setForm({ street: '', suburb: '', city: '', province: '', postalCode: '', ...await locationService.getCurrentPosition() }); }
    catch (locationError) { setError(locationError.message); }
  };

  const applyRecent = (addr) => {
    setForm(addr);
  };

  const compact = variant === 'compact';

  return (
    <form onSubmit={submit} className={`w-full ${compact ? '' : ''}`}>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <input value={form.street} onChange={e => set('street', e.target.value)} placeholder="Street address" aria-label="Street address" className="h-11 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 sm:col-span-2 lg:col-span-2" />
        <input value={form.suburb} onChange={e => set('suburb', e.target.value)} placeholder="Suburb" aria-label="Suburb" className="h-11 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
        <input value={form.city} onChange={e => set('city', e.target.value)} placeholder="City" aria-label="City" className="h-11 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
        <select value={form.province} onChange={e => set('province', e.target.value)} aria-label="Province" className="h-11 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20">
          <option value="">Province…</option>
          {PROVINCES.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}
        </select>
        {!compact && (
          <input value={form.postalCode} onChange={e => set('postalCode', e.target.value)} placeholder="Code" aria-label="Postal code" inputMode="numeric" className="h-11 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20" />
        )}
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={useLocation} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted">
            <Locate className="h-4 w-4 text-brand" /> Use current location
          </button>
          {recent.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Recent:</span>
              {recent.slice(0, 3).map((r, i) => (
                <button key={i} type="button" onClick={() => applyRecent(r)} className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs hover:bg-muted">
                  <MapPin className="h-3 w-3 text-brand" /> {r.suburb || r.city || 'Address'}
                </button>
              ))}
            </div>
          )}
        </div>
        <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60">
          {loading ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> Checking…</> : <><Search className="h-4 w-4" /> Check coverage</>}
        </button>
      </div>
    </form>
  );
}
