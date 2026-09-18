import React, { useEffect, useState } from 'react';
import { Search, X, User, Mail, Phone, MapPin, MessageSquare, Send } from 'lucide-react';
import { enquiryService } from '@/services/userDataService';
import { ENQUIRY_STATUSES } from '@/data/mockData';

const STAFF = ['Unassigned', 'Thabo N.', 'Aisha K.', 'Lerato M.', 'Sipho D.'];

export default function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState([]);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);

  const load = () => enquiryService.list().then(setEnquiries);
  useEffect(() => { load(); }, []);

  const filtered = enquiries.filter(e => (e.reference + e.packageName + (e.firstName || '')).toLowerCase().includes(q.toLowerCase()));

  const update = (id, data) => {
    const all = JSON.parse(localStorage.getItem('fc_enquiries') || '[]');
    const updated = all.map(e => {
      if (e.id !== id) return e;
      const next = { ...e, ...data };
      if (data.status && data.status !== e.status) {
        next.statusHistory = [...(e.statusHistory || []), { status: data.status, at: new Date().toISOString(), note: data.note || '' }];
      }
      return next;
    });
    localStorage.setItem('fc_enquiries', JSON.stringify(updated));
    load();
    setSelected(s => updated.find(e => e.id === id) || s);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold">Enquiries</h1>
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search enquiries…" className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-brand" />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="font-medium">No enquiries found</p>
          <p className="text-sm text-muted-foreground">Enquiries submitted from the site will appear here for staff to manage.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/30"><tr><th className="p-3 text-left font-semibold">Reference</th><th className="p-3 text-left font-semibold">Package</th><th className="p-3 text-left font-semibold">Customer</th><th className="p-3 text-left font-semibold">Status</th><th className="p-3 text-left font-semibold">Assigned</th><th className="p-3 text-left font-semibold">Date</th></tr></thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} className="cursor-pointer border-t border-border hover:bg-muted/30" onClick={() => setSelected(e)}>
                  <td className="p-3 font-mono">{e.reference}</td>
                  <td className="p-3">{e.packageName || e.type}</td>
                  <td className="p-3">{e.firstName} {e.lastName}</td>
                  <td className="p-3"><span className="rounded-full bg-muted px-2 py-0.5 text-xs">{e.status}</span></td>
                  <td className="p-3 text-muted-foreground">{e.assignedTo || 'Unassigned'}</td>
                  <td className="p-3 text-muted-foreground">{new Date(e.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && <EnquiryDrawer enquiry={selected} onClose={() => setSelected(null)} onUpdate={update} />}
    </div>
  );
}

function EnquiryDrawer({ enquiry, onClose, onUpdate }) {
  const [note, setNote] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-md overflow-y-auto border-l border-border bg-card p-5">
        <div className="flex items-center justify-between"><h2 className="font-display text-lg font-bold">{enquiry.reference}</h2><button onClick={onClose} aria-label="Close"><X className="h-5 w-5" /></button></div>
        <p className="text-sm text-muted-foreground">{enquiry.packageName || enquiry.type}</p>

        <div className="mt-4 space-y-2 text-sm">
          <p className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" /> {enquiry.firstName} {enquiry.lastName}</p>
          <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {enquiry.email}</p>
          <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {enquiry.phone}</p>
          {enquiry.address && <p className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" /> {[enquiry.address.street, enquiry.address.suburb, enquiry.address.city].filter(Boolean).join(', ')}</p>}
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-sm font-medium">Status</label>
            <select value={enquiry.status} onChange={e => onUpdate(enquiry.id, { status: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-2 text-sm">
              {ENQUIRY_STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Assigned to</label>
            <select value={enquiry.assignedTo || ''} onChange={e => onUpdate(enquiry.id, { assignedTo: e.target.value })} className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-2 text-sm">
              {STAFF.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="text-sm font-medium">Internal note</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="Add a note for staff…" className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand" />
          <button onClick={() => { if (note) { onUpdate(enquiry.id, { note }); setNote(''); } }} className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-sm font-semibold text-white"><Send className="h-4 w-4" /> Add note</button>
        </div>

        <div className="mt-5">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold"><MessageSquare className="h-4 w-4" /> History</h3>
          <ol className="mt-2 space-y-1.5 text-xs text-muted-foreground">
            {(enquiry.statusHistory || []).map((h, i) => <li key={i} className="border-l-2 border-border pl-2">{new Date(h.at).toLocaleString()}: <strong className="text-foreground">{h.status}</strong> {h.note && `— ${h.note}`}</li>)}
          </ol>
        </div>
      </div>
    </div>
  );
}