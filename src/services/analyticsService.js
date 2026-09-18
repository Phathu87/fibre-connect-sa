// Analytics service abstraction. Components call this, never the platform directly.
// Codex can later connect GA4, GTM, PostHog or another platform by replacing this module.

const QUEUE_KEY = 'fc_analytics_queue';
const CONSENT_KEY = 'fc_cookie_consent';

export function getConsent() {
  try {
    return JSON.parse(localStorage.getItem(CONSENT_KEY)) || { necessary: true, analytics: false, functional: false, marketing: false };
  } catch {
    return { necessary: true, analytics: false, functional: false, marketing: false };
  }
}

export function setConsent(consent) {
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
}

function queue(event) {
  try {
    const q = JSON.parse(localStorage.getItem(QUEUE_KEY)) || [];
    q.push({ ...event, ts: Date.now() });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q.slice(-200)));
  } catch { /* noop */ }
}

export function track(eventName, properties = {}) {
  const consent = getConsent();
  // Page views and core navigation are "necessary"; behavioural analytics gated on consent.
  const isCore = ['page_view', 'coverage_search_started', 'enquiry_completed'].includes(eventName);
  if (!consent.analytics && !isCore) return;
  const event = { event: eventName, properties };
  queue(event);
  if (typeof window !== 'undefined' && window.fcAnalyticsLog) {
    window.fcAnalyticsLog(event);
  }
}

export const events = {
  pageView: (path) => track('page_view', { path }),
  coverageSearchStarted: (address) => track('coverage_search_started', { has_address: !!address }),
  coverageSearchCompleted: (result) => track('coverage_search_completed', { result_type: result }),
  coverageSearchNoResult: () => track('coverage_search_no_result'),
  packageImpression: (id) => track('package_impression', { package_id: id }),
  packageView: (slug) => track('package_view', { slug }),
  packageFilterApplied: (filters) => track('package_filter_applied', { filters: Object.keys(filters).length }),
  packageSortChanged: (sort) => track('package_sort_changed', { sort }),
  packageSaved: (id) => track('package_saved', { package_id: id }),
  compareAdded: (id) => track('compare_added', { package_id: id }),
  compareRemoved: (id) => track('compare_removed', { package_id: id }),
  comparisonViewed: (ids) => track('comparison_viewed', { count: ids.length }),
  enquiryStarted: (id) => track('enquiry_started', { package_id: id }),
  enquiryStepCompleted: (step) => track('enquiry_step_completed', { step }),
  enquiryAbandoned: (step) => track('enquiry_abandoned', { step }),
  enquiryCompleted: (ref) => track('enquiry_completed', { reference: ref }),
  phoneClicked: () => track('phone_clicked'),
  emailClicked: () => track('email_clicked'),
  locationPageViewed: (slug) => track('location_page_viewed', { slug }),
  providerViewed: (slug) => track('provider_viewed', { slug }),
};
