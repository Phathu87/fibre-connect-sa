import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { events } from '@/services/analyticsService';

export default function usePageView() {
  const location = useLocation();
  useEffect(() => {
    events.pageView(location.pathname);
  }, [location.pathname]);
}