import React, { useEffect, useState } from 'react';
import { auditService } from '@/services/userDataService';

export default function AdminAudit() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => { auditService.list({ limit: 50 }).then(result => setItems(result.items)).catch(cause => setError(cause.message)); }, []);
  return <div className="space-y-4">
    <div><h1 className="text-2xl font-extrabold">Audit log</h1><p className="text-sm text-muted-foreground">Security and privileged operational events recorded by the server.</p></div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <div className="overflow-x-auto rounded-xl border border-border"><table className="w-full text-sm"><thead className="bg-muted/30"><tr><th className="p-3 text-left">Time</th><th className="p-3 text-left">Action</th><th className="p-3 text-left">Actor</th><th className="p-3 text-left">Target</th><th className="p-3 text-left">Request</th></tr></thead><tbody>{items.map(item => <tr key={item.id} className="border-t border-border"><td className="whitespace-nowrap p-3 text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</td><td className="p-3 font-medium">{item.action}</td><td className="p-3">{item.actor?.email || 'System/deleted user'}</td><td className="p-3">{item.targetType}{item.targetId ? ` · ${item.targetId}` : ''}</td><td className="p-3 font-mono text-xs text-muted-foreground">{item.requestId || '—'}</td></tr>)}</tbody></table></div>
  </div>;
}
