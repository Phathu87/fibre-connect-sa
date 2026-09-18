import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, FileText, MapPin, GitCompare, Bell, ArrowRight } from 'lucide-react';
import { useSaved, useCompare } from '@/hooks/useCollections';
import { coverageHistoryService, enquiryService, notificationService } from '@/services/userDataService';

export default function Account() {
  const { count: savedCount } = useSaved();
  const { count: compareCount } = useCompare();
  const [enquiries, setEnquiries] = useState([]);
  const [history, setHistory] = useState([]);
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    enquiryService.list().then(setEnquiries);
    setHistory(coverageHistoryService.list());
    setNotifs(notificationService.list());
  }, []);

  const cards = [
    { icon: Heart, label: 'Saved packages', value: savedCount, to: '/account/saved' },
    { icon: GitCompare, label: 'Comparisons', value: compareCount, to: '/account/comparisons' },
    { icon: FileText, label: 'Enquiries', value: enquiries.length, to: '/account/enquiries' },
    { icon: MapPin, label: 'Coverage searches', value: history.length, to: '/account/addresses' },
    { icon: Bell, label: 'Notifications', value: notifs.length, to: '/account/notifications' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-bold">Overview</h2>
        <p className="text-sm text-muted-foreground">Your activity at a glance.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map(c => (
          <Link key={c.label} to={c.to} className="rounded-xl border border-border bg-card p-4 hover:border-brand">
            <c.icon className="h-5 w-5 text-brand" />
            <p className="mt-2 text-2xl font-extrabold">{c.value}</p>
            <p className="text-xs text-muted-foreground">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold">Recent enquiries</h3>
          <Link to="/account/enquiries" className="text-sm text-brand hover:underline">View all</Link>
        </div>
        {enquiries.length ? (
          <ul className="mt-3 divide-y divide-border">
            {enquiries.slice(0, 3).map(e => (
              <li key={e.id} className="flex items-center justify-between py-2.5 text-sm">
                <div><p className="font-medium">{e.packageName}</p><p className="text-xs text-muted-foreground">{e.reference} · {new Date(e.createdAt).toLocaleDateString()}</p></div>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">{e.status}</span>
              </li>
            ))}
          </ul>
        ) : <p className="mt-2 text-sm text-muted-foreground">No enquiries yet. <Link to="/packages" className="text-brand">Browse packages</Link> to get started.</p>}
      </div>

      <div className="rounded-xl border border-brand/20 bg-brand/5 p-5">
        <h3 className="font-display font-bold">Ready to compare?</h3>
        <p className="mt-1 text-sm text-muted-foreground">Check coverage at your address and compare packages side by side.</p>
        <Link to="/coverage" className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">Check coverage <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </div>
  );
}