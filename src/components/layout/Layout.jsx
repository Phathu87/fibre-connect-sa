import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import MobileBar from '@/components/layout/MobileBar';
import CompareTray from '@/components/layout/CompareTray';
import CookieConsent from '@/components/CookieConsent';
import usePageView from '@/hooks/usePageView';

export default function Layout() {
  usePageView();
  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-background">
      <Navbar />
      <main className="min-w-0 flex-1 pb-20 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <MobileBar />
      <CompareTray />
      <CookieConsent />
    </div>
  );
}
