// Storage abstraction. Wraps localStorage so Codex can later swap to a secure backend store.
// Never access localStorage directly from components — use this module.

export const storage = {
  get(key, fallback = null) {
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* noop */ }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch { /* noop */ }
  },
};

export const KEYS = {
  SAVED: 'fc_saved_packages',
  COMPARE: 'fc_compare_packages',
  RECENT_SEARCHES: 'fc_recent_searches',
  COVERAGE_HISTORY: 'fc_coverage_history',
  ENQUIRIES: 'fc_enquiries',
  COMPARISONS: 'fc_comparisons',
  THEME: 'fc_theme',
  COOKIE_CONSENT: 'fc_cookie_consent',
  NOTIF_PREFS: 'fc_notif_prefs',
  PROFILE: 'fc_profile',
  ADDRESSES: 'fc_addresses',
};