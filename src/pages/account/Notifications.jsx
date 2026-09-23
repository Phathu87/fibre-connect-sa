import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { notificationService } from '@/services/userDataService';
import { enquiryService } from '@/services/userDataService';

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const [prefs, setPrefs] = useState({ email: true, sms: false, push: false, marketing: false });
  useEffect(() => { notificationService.getPrefs().then(setPrefs); enquiryService.list().then(items => setNotifs(items.slice(0, 5).map(item => ({ id: item.id, title: `Enquiry ${item.reference}: ${item.status}`, body: `Your application for "${item.packageName}" is now "${item.status}".` })))); }, []);
  const toggle = async (k) => { const next = { ...prefs, [k]: !prefs[k] }; setPrefs(await notificationService.setPrefs(next)); };

  return (
    <div className="space-y-5">
      <h2 className="font-display text-lg font-bold">Notifications</h2>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="font-display font-bold">Recent</h3>
        {notifs.length === 0 ? (
          <div className="mt-2 text-center py-6">
            <Bell className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No notifications yet. Enquiry updates will appear here.</p>
          </div>
        ) : (
          <ul className="mt-2 divide-y divide-border">
            {notifs.map(n => (
              <li key={n.id} className="flex items-start gap-2 py-3">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand" />
                <div><p className="text-sm font-medium">{n.title}</p><p className="text-xs text-muted-foreground">{n.body}</p></div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="font-display font-bold">Preferences</h3>
        <p className="text-xs text-muted-foreground">Transactional notifications (enquiry updates) are always on. Marketing is optional.</p>
        <div className="mt-3 space-y-2">
          {[['email', 'Email'], ['sms', 'SMS'], ['push', 'Push (mobile app)'], ['marketing', 'Marketing communications']].map(([k, label]) => (
            <label key={k} className="flex items-center justify-between rounded-lg border border-border p-3">
              <span className="text-sm font-medium">{label}</span>
              <input type="checkbox" checked={prefs[k]} onChange={() => toggle(k)} className="h-5 w-5 accent-brand" />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
