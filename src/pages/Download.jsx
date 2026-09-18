import React from 'react';
import { Globe, Smartphone, Apple, Monitor, Download as DownloadIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const PLATFORMS = [
  { icon: Globe, name: 'Web', status: 'Available now', desc: 'Use FibreConnect SA directly in your browser — no install required.', available: true },
  { icon: Monitor, name: 'PWA', status: 'Installable', desc: 'Install on supported devices for an app-like experience with offline fallback.', available: true },
  { icon: Smartphone, name: 'Android', status: 'Platform build in preparation', desc: 'Prepared for future packaged release on Google Play.', available: false },
  { icon: Apple, name: 'iOS', status: 'Platform build in preparation', desc: 'Prepared for future App Store release.', available: false },
  { icon: Smartphone, name: 'Huawei', status: 'Platform build in preparation', desc: 'Prepared for future AppGallery release.', available: false },
  { icon: Monitor, name: 'Windows', status: 'Platform build in preparation', desc: 'Prepared for future Microsoft Store release as a PWA/MSIX.', available: false },
];

export default function Download() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-extrabold md:text-4xl">Get FibreConnect SA</h1>
      <p className="mt-2 text-muted-foreground">FibreConnect SA is available on the web today. Native app builds are in preparation.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {PLATFORMS.map(p => (
          <div key={p.name} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-3">
              <span className={`grid h-11 w-11 place-items-center rounded-lg ${p.available ? 'bg-brand/10 text-brand' : 'bg-muted text-muted-foreground'}`}><p.icon className="h-6 w-6" /></span>
              <div>
                <p className="font-display font-bold">{p.name}</p>
                <p className={`text-xs font-medium ${p.available ? 'text-success' : 'text-muted-foreground'}`}>{p.status}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{p.desc}</p>
            {p.available ? (
              p.name === 'PWA' ? <button className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white"><DownloadIcon className="h-4 w-4" /> Install app</button>
              : <Link to="/" className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Open web app</Link>
            ) : <p className="mt-3 text-xs text-muted-foreground">We will announce availability once the build is submitted and approved.</p>}
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
        <p>PWA preparation does not by itself guarantee acceptance by Google Play, Apple App Store, Huawei AppGallery or Microsoft Store. Store availability requires completed packaging, signing, compliance and store review — which remain release-stage work.</p>
      </div>
    </div>
  );
}