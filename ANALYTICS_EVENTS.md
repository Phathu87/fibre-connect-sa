# Analytics Events

All analytics flows through `src/services/analyticsService.js`. Components call `events.*` helpers, never the platform directly. Codex connects GA4, GTM, PostHog or another platform by replacing that module.

## Consent
Analytics (non-core) events are gated on cookie consent (`getConsent()`). Core navigation events (page_view, coverage_search_started, enquiry_completed) fire regardless. See `src/components/CookieConsent.jsx`.

## Event model

| Event | Trigger | Properties |
|-------|---------|------------|
| `page_view` | Route change | `path` |
| `coverage_search_started` | User submits coverage form | `has_address` |
| `coverage_search_completed` | Coverage resolves | `result_type` (fibre/wireless/none) |
| `coverage_search_no_result` | No coverage found | — |
| `package_impression` | Package card visible | `package_id` |
| `package_view` | Package detail opened | `slug` |
| `package_filter_applied` | Filters changed | `filters` (count) |
| `package_sort_changed` | Sort changed | `sort` |
| `package_saved` | Save toggled on | `package_id` |
| `compare_added` | Added to comparison | `package_id` |
| `compare_removed` | Removed from comparison | `package_id` |
| `comparison_viewed` | Compare page opened | `count` |
| `enquiry_started` | Enquiry flow opened | `package_id` |
| `enquiry_step_completed` | Enquiry step advanced | `step` |
| `enquiry_abandoned` | Enquiry left incomplete | `step` |
| `enquiry_completed` | Enquiry submitted | `reference` |
| `phone_clicked` | Phone link clicked | — |
| `email_clicked` | Email link clicked | — |
| `location_page_viewed` | Location page opened | `slug` |
| `provider_viewed` | Provider page opened | `slug` |

## Implementation notes
- Events are queued in localStorage (`fc_analytics_queue`) and can be forwarded through `window.fcAnalyticsLog` when a production analytics provider is configured.
- `window.fcAnalyticsLog` can be set in dev to log events to console.
- No PII is sent in event properties.
