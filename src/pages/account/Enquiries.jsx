import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, Clock } from 'lucide-react';
import { enquiryService } from '@/services/userDataService';

const STATUS_COLORS = {
  'Submitted': 'bg-muted text-foreground', 'Under review': 'bg-warning/10 text-warning',
  'Provider contacted': 'bg-brand/10 text-brand', 'Awaiting customer': 'bg-warning/10 text-warning',
  'Approved': 'bg-success/10 text-success', 'Installation scheduled': 'bg-brand/10 text-brand',
  'Completed': 'bg-success/10 text-success', 'Cancelled': 'bg-destructive/10 text-destructive',
};

export default function Enquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { enquiryService.list().then(e => { setEnquiries(e); setLoading(false); }); }, []);

  if (loading) return <div className="h-40 animate-pulse rounded-xl border border-border bg-muted/40" />;
  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-bold">My enquiries</h2>
      {enquiries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 font-medium">No enquiries yet</p>
          <p className="text-sm text-muted-foreground">Submit an enquiry from any package to track it here.</p>
          <Link to="/packages" className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">Browse packages <ArrowRight className="h-4 w-4" /></Link>
        </div>
      ) : (
        <div className="space-y-3">
          {enquiries.map(e => (
            <div key={e.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{e.packageName || e.type}</p>
                  <p className="text-xs text-muted-foreground">Ref {e.reference} · {new Date(e.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[e.status] || 'bg-muted'}`}>{e.status}</span>
              </div>
              {e.statusHistory?.length > 1 && (
                <div className="mt-3 border-t border-border pt-2">
                  <p className="flex items-center gap-1 text-xs font-medium text-muted-foreground"><Clock className="h-3 w-3" /> History</p>
                  <ol className="mt-1 space-y-1 text-xs text-muted-foreground">
                    {e.statusHistory.map((h, i) => <li key={i}>{new Date(h.at).toLocaleString()}: {h.status}</li>)}
                  </ol>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}