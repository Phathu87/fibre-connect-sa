// Saved packages, comparison, enquiry, user, notification services.
// All use the storage abstraction so Codex can replace persistence with a real backend.

import { storage, KEYS } from './storageService';
import { getPackage } from '@/data/mockData';

function delay(ms = 150) { return new Promise(r => setTimeout(r, ms)); }

export const savedService = {
  async list() {
    await delay(100);
    const ids = storage.get(KEYS.SAVED, []);
    return ids.map(id => getPackage(id)).filter(Boolean).map(p => ({ ...p, provider: undefined, network: undefined }));
  },
  listSync() {
    const ids = storage.get(KEYS.SAVED, []);
    return ids;
  },
  async toggle(id) {
    const ids = storage.get(KEYS.SAVED, []);
    const exists = ids.includes(id);
    const next = exists ? ids.filter(x => x !== id) : [...ids, id];
    storage.set(KEYS.SAVED, next);
    return { saved: !exists, ids: next };
  },
  isSaved(id) {
    return storage.get(KEYS.SAVED, []).includes(id);
  },
  count() {
    return storage.get(KEYS.SAVED, []).length;
  },
};

export const compareService = {
  listSync() { return storage.get(KEYS.COMPARE, []); },
  async toggle(id) {
    const ids = storage.get(KEYS.COMPARE, []);
    if (ids.includes(id)) {
      storage.set(KEYS.COMPARE, ids.filter(x => x !== id));
      return { added: false, ids: ids.filter(x => x !== id) };
    }
    if (ids.length >= 4) return { added: false, ids, full: true };
    const next = [...ids, id];
    storage.set(KEYS.COMPARE, next);
    return { added: true, ids: next };
  },
  async remove(id) {
    const ids = storage.get(KEYS.COMPARE, []).filter(x => x !== id);
    storage.set(KEYS.COMPARE, ids);
    return ids;
  },
  async clear() { storage.set(KEYS.COMPARE, []); },
  isComparing(id) { return storage.get(KEYS.COMPARE, []).includes(id); },
  count() { return storage.get(KEYS.COMPARE, []).length; },
};

export const enquiryService = {
  async create(data) {
    await delay(800);
    const enquiries = storage.get(KEYS.ENQUIRIES, []);
    const ref = 'FC-' + Date.now().toString(36).toUpperCase().slice(-6);
    const enquiry = {
      id: ref,
      reference: ref,
      ...data,
      status: 'Submitted',
      statusHistory: [{ status: 'Submitted', at: new Date().toISOString(), note: 'Enquiry submitted.' }],
      createdAt: new Date().toISOString(),
    };
    storage.set(KEYS.ENQUIRIES, [enquiry, ...enquiries]);
    return enquiry;
  },
  async list() {
    await delay(200);
    return storage.get(KEYS.ENQUIRIES, []);
  },
  async get(id) {
    await delay(150);
    return storage.get(KEYS.ENQUIRIES, []).find(e => e.id === id);
  },
};

export const userService = {
  getProfile() {
    return storage.get(KEYS.PROFILE, { firstName: '', lastName: '', email: '', phone: '', marketingConsent: false });
  },
  setProfile(data) { storage.set(KEYS.PROFILE, data); return data; },
  getAddresses() { return storage.get(KEYS.ADDRESSES, []); },
  addAddress(addr) {
    const list = storage.get(KEYS.ADDRESSES, []);
    const item = { id: 'addr-' + Date.now().toString(36), ...addr };
    storage.set(KEYS.ADDRESSES, [...list, item]);
    return item;
  },
  removeAddress(id) {
    storage.set(KEYS.ADDRESSES, storage.get(KEYS.ADDRESSES, []).filter(a => a.id !== id));
  },
  setPreferred(id) {
    const list = storage.get(KEYS.ADDRESSES, []).map(a => ({ ...a, preferred: a.id === id }));
    storage.set(KEYS.ADDRESSES, list);
  },
};

export const notificationService = {
  getPrefs() {
    return storage.get(KEYS.NOTIF_PREFS, { email: true, sms: false, push: false, marketing: false });
  },
  setPrefs(prefs) { storage.set(KEYS.NOTIF_PREFS, prefs); return prefs; },
  list() {
    // generated notifications based on enquiries
    const enquiries = storage.get(KEYS.ENQUIRIES, []);
    const notifs = enquiries.slice(0, 5).map(e => ({
      id: 'n-' + e.id,
      title: `Enquiry ${e.reference}: ${e.status}`,
      body: `Your application for "${e.packageName}" is now "${e.status}".`,
      at: e.createdAt,
      read: false,
    }));
    return notifs;
  },
};

export const searchHistoryService = {
  list() { return storage.get(KEYS.RECENT_SEARCHES, []); },
  add(address) {
    const list = storage.get(KEYS.RECENT_SEARCHES, []);
    const key = JSON.stringify(address);
    const filtered = list.filter(a => JSON.stringify(a) !== key);
    storage.set(KEYS.RECENT_SEARCHES, [address, ...filtered].slice(0, 5));
  },
  clear() { storage.remove(KEYS.RECENT_SEARCHES); },
};

export const coverageHistoryService = {
  list() { return storage.get(KEYS.COVERAGE_HISTORY, []); },
  add(entry) {
    const list = storage.get(KEYS.COVERAGE_HISTORY, []);
    storage.set(KEYS.COVERAGE_HISTORY, [{ id: 'ch-' + Date.now().toString(36), ...entry, at: new Date().toISOString() }, ...list].slice(0, 20));
  },
};