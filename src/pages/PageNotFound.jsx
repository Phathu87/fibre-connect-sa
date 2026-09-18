import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export default function PageNotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <p className="font-display text-7xl font-extrabold text-brand">404</p>
      <h1 className="mt-2 text-2xl font-extrabold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">The page you are looking for may have moved or no longer exists.</p>
      <div className="mt-6 flex gap-2">
        <Link to="/" className="inline-flex items-center gap-1.5 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white"><Home className="h-4 w-4" /> Home</Link>
        <Link to="/packages" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-5 py-2.5 text-sm font-medium"><Search className="h-4 w-4" /> Browse packages</Link>
      </div>
    </div>
  );
}