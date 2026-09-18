import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Check, Edit, MapPin, RefreshCw, Wifi } from 'lucide-react';
import AddressSearchBar from '@/components/AddressSearchBar';
import NetworkPackageGroup from '@/components/coverage/NetworkPackageGroup';
import { coverageSessionService } from '@/services/coverageSessionService';
import { coverageHistoryService } from '@/services/userDataService';
import { events } from '@/services/analyticsService';

export default function CoverageResults() {
  const initial = coverageSessionService.get();
  const [address, setAddress] = useState(initial?.input || null);
  const [result, setResult] = useState(initial?.result || null);
  const [editing, setEditing] = useState(!initial);

  const receiveResult = (input, nextResult) => {
    setAddress(input);
    setResult(nextResult);
    setEditing(false);
    const kind = nextResult.status === 'AVAILABLE' || nextResult.status === 'PARTIAL' ? 'fibre' : nextResult.status === 'WIRELESS_ONLY' ? 'wireless' : 'none';
    events.coverageSearchCompleted(nextResult.status);
    coverageHistoryService.add({ address: { suburb: input.suburb, city: input.city, province: input.province }, type: kind });
  };

  const addressLine = address ? [address.suburb, address.city, address.province].filter(Boolean).join(', ') || 'Current location' : 'No coverage search yet';
  const fibre = result && ['AVAILABLE', 'PARTIAL'].includes(result.status);
  const wireless = result?.status === 'WIRELESS_ONLY';
  const unavailable = result && ['UNAVAILABLE', 'UNKNOWN'].includes(result.status);
  const failed = result?.status === 'PROVIDER_UNAVAILABLE';

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <nav className="mb-4 text-sm text-muted-foreground" aria-label="Breadcrumb"><Link to="/" className="hover:text-brand">Home</Link> <span className="mx-1">/</span><Link to="/coverage" className="hover:text-brand">Coverage</Link> <span className="mx-1">/</span> Results</nav>
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4">
        <div className="flex min-w-0 items-center gap-2"><MapPin className="h-5 w-5 shrink-0 text-brand" /><div className="min-w-0"><p className="text-xs font-semibold uppercase text-muted-foreground">Coverage area</p><p className="truncate font-medium">{addressLine}</p></div></div>
        <button type="button" onClick={() => setEditing(value => !value)} className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted"><Edit className="h-4 w-4" /> Edit</button>
      </div>
      {editing && <div className="mt-3 rounded-lg border border-border bg-card p-4"><AddressSearchBar onSearch={receiveResult} /></div>}

      {!result && !editing && <StatePanel icon={AlertCircle} title="No coverage result" message="Run a coverage check to see demo availability for your area." />}
      {result && <p className="mt-4 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-sm font-medium text-warning">{result.disclaimer}</p>}

      {fibre && <div className="mt-6"><StatePanel icon={Check} tone="success" title="Demo fibre coverage estimate" message={result.message} /><h2 className="mt-6 font-display text-xl font-bold">Recorded network operators</h2><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{result.networks.map(network => <Link key={network.id} to={`/networks/${network.slug}`} className="rounded-lg border border-border bg-card p-4 hover:border-brand"><p className="font-display font-bold">{network.name}</p><p className="text-xs text-muted-foreground">{network.infrastructure}</p></Link>)}</div><h2 className="mt-8 font-display text-xl font-bold">Demo packages ({result.packages.length})</h2><NetworkPackageGroup packages={result.packages} /></div>}
      {wireless && <div className="mt-6"><StatePanel icon={Wifi} tone="warning" title="Demo wireless coverage estimate" message={result.message} /><h2 className="mt-6 font-display text-xl font-bold">Recorded wireless packages</h2><NetworkPackageGroup packages={result.packages} /></div>}
      {unavailable && <div className="mt-6"><StatePanel icon={AlertCircle} title={result.status === 'UNKNOWN' ? 'Location not found in demo data' : 'No demo services recorded'} message={result.message} /><p className="mt-4 text-sm text-muted-foreground">Coverage notifications are not available yet. No alert has been registered.</p></div>}
      {failed && <div className="mt-6"><StatePanel icon={RefreshCw} title="Coverage check unavailable" message={result.message} /><button type="button" onClick={() => setEditing(true)} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white"><RefreshCw className="h-4 w-4" /> Try again</button></div>}
    </div>
  );
}

function StatePanel({ icon: Icon, title, message, tone = 'muted' }) {
  const colors = tone === 'success' ? 'border-success/30 bg-success/5 text-success' : tone === 'warning' ? 'border-warning/30 bg-warning/5 text-warning' : 'border-border bg-muted/30 text-foreground';
  return <div className={`flex items-center gap-3 rounded-lg border p-4 ${colors}`}><Icon className="h-6 w-6 shrink-0" /><div><p className="font-display text-lg font-bold">{title}</p><p className="text-sm text-muted-foreground">{message}</p></div></div>;
}
