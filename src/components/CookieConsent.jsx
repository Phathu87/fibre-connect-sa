import React, { useState, useEffect } from 'react';
import { Cookie } from 'lucide-react';
import { getConsent, setConsent } from '@/services/analyticsService';
import { Link } from 'react-router-dom';

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  const [customize, setCustomize] = useState(false);
  const [prefs, setPrefs] = useState({ necessary: true, analytics: false, functional: false, marketing: false });

  useEffect(() => {
    const c = getConsent();
    if (!c._decided) setShow(true);
    setPrefs(c);
  }, []);

  const save = (consent) => {
    setConsent({ ...consent, _decided: true });
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-16 z-50 p-3 lg:bottom-4">
      <div className="mx-auto max-w-2xl rounded-xl border border-border bg-card p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          <div className="flex-1">
            <p className="text-sm font-semibold">We use cookies to improve your experience</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Necessary cookies are always on. You can choose to enable analytics, functional and marketing cookies. See our <Link to="/cookies" className="text-brand underline">Cookie Policy</Link>.
            </p>
          </div>
        </div>
        {customize && (
          <div className="mt-3 space-y-2 border-t border-border pt-3">
            {[
              ['necessary', 'Necessary', 'Required for the site to function. Cannot be disabled.'],
              ['analytics', 'Analytics', 'Help us understand how the site is used.'],
              ['functional', 'Functional', 'Enable extra features like saved preferences.'],
              ['marketing', 'Marketing', 'Personalised offers and communications.'],
            ].map(([key, label, desc]) => (
              <label key={key} className="flex items-center justify-between gap-3 text-sm">
                <span><span className="font-medium">{label}</span> — <span className="text-muted-foreground">{desc}</span></span>
                <input type="checkbox" checked={prefs[key]} disabled={key === 'necessary'} onChange={e => setPrefs(p => ({ ...p, [key]: e.target.checked }))} className="h-4 w-4 accent-brand" />
              </label>
            ))}
          </div>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => save({ necessary: true, analytics: false, functional: false, marketing: false })} className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted">Reject optional</button>
          <button onClick={() => save({ necessary: true, analytics: true, functional: true, marketing: true })} className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted">Accept all</button>
          {!customize ? (
            <button onClick={() => setCustomize(true)} className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark">Customise</button>
          ) : (
            <button onClick={() => save(prefs)} className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark">Save preferences</button>
          )}
        </div>
      </div>
    </div>
  );
}
