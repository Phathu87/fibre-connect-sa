import { useState, useEffect, useCallback } from 'react';
import { compareService, savedService } from '@/services/userDataService';
import { storage, KEYS } from '@/services/storageService';

// Cross-component sync via custom events
const COMPARE_EVENT = 'fc-compare-change';
const SAVED_EVENT = 'fc-saved-change';

function emit(name) { window.dispatchEvent(new CustomEvent(name)); }

export function useCompare() {
  const [ids, setIds] = useState(() => compareService.listSync());

  const sync = useCallback(() => setIds(compareService.listSync()), []);

  useEffect(() => {
    const h = () => sync();
    window.addEventListener(COMPARE_EVENT, h);
    window.addEventListener('storage', h);
    return () => { window.removeEventListener(COMPARE_EVENT, h); window.removeEventListener('storage', h); };
  }, [sync]);

  const toggle = useCallback(async (id) => {
    const res = await compareService.toggle(id);
    emit(COMPARE_EVENT);
    return res;
  }, []);

  const remove = useCallback(async (id) => {
    await compareService.remove(id);
    emit(COMPARE_EVENT);
  }, []);

  const clear = useCallback(async () => {
    await compareService.clear();
    emit(COMPARE_EVENT);
  }, []);

  return { ids, count: ids.length, toggle, remove, clear, isComparing: (id) => ids.includes(id) };
}

export function useSaved() {
  const [ids, setIds] = useState(() => savedService.listSync());

  const sync = useCallback(() => setIds(savedService.listSync()), []);

  useEffect(() => {
    const h = () => sync();
    window.addEventListener(SAVED_EVENT, h);
    window.addEventListener('storage', h);
    return () => { window.removeEventListener(SAVED_EVENT, h); window.removeEventListener('storage', h); };
  }, [sync]);

  const toggle = useCallback(async (id) => {
    const res = await savedService.toggle(id);
    emit(SAVED_EVENT);
    return res;
  }, []);

  return { ids, count: ids.length, toggle, isSaved: (id) => ids.includes(id) };
}

export function useRecentSearches() {
  const [searches, setSearches] = useState(() => storage.get(KEYS.RECENT_SEARCHES, []));
  const refresh = useCallback(() => setSearches(storage.get(KEYS.RECENT_SEARCHES, [])), []);
  useEffect(() => {
    const h = () => refresh();
    window.addEventListener('storage', h);
    return () => window.removeEventListener('storage', h);
  }, [refresh]);
  return searches;
}