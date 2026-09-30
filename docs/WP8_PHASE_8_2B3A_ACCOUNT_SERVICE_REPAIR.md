# WP8 Phase 8.2B-3A Account Root Service-Contract Repair

Date: 2026-09-30

Status: PASS

## Objective

Repair only the authenticated `/account` runtime crash caused by an obsolete frontend notification-service assumption, while preserving the existing persisted preference architecture, ownership controls, and routing behavior.

## Root Cause

`src/pages/account/Account.jsx` synchronously called `notificationService.list()` and treated the result as a notification inbox array. No such method or backend inbox exists.

The implemented WP5 contract is notification preferences:

- Frontend: `notificationService.getPrefs()` and `notificationService.setPrefs()`
- API: `GET` and `PUT /api/me/notification-preferences`
- Authorization: Fastify `auth.authenticate` for reads; authentication plus CSRF for writes
- Repository: `getPreferences(userId)` and `setPreferences(userId, data)`
- Persistence: one `NotificationPreference` row per user in PostgreSQL
- Ownership: the authenticated principal's user ID is supplied by the server; callers cannot select another user

The account notification page separately derives recent status messages from the authenticated user's enquiries. There is no persistent notification inbox to list, and none was fabricated in this repair.

## Contract Resolution

The account overview now loads the real persisted preference shape asynchronously through `notificationService.getPrefs()`. Its summary card reports the number of enabled communication channels across `email`, `sms`, `push`, and `marketing`, and links to the existing notification-preference page.

The overview loader uses `Promise.allSettled()` for enquiries and preferences. If either request fails, the account page remains rendered with empty enquiries and the established default preference shape instead of crashing or creating an unhandled rejection.

No backend route, repository, Prisma schema, migration, localStorage behavior, or authentication policy changed.

## Implementation

- Added `loadAccountOverview()` to resolve enquiries and persisted preferences with non-fatal defaults.
- Added `countEnabledNotificationChannels()` for the overview summary.
- Replaced the invalid synchronous `notificationService.list()` call with the implemented asynchronous `getPrefs()` contract.
- Preserved component unmount safety before applying asynchronous state updates.
- Changed the overview label from `Notifications` to `Notification channels` so the value accurately describes preferences rather than an inbox count.

## Security

- Ownership remains server-enforced with `request.auth.user.id`.
- Anonymous `GET /api/me/notification-preferences` returns `401 AUTHENTICATION_REQUIRED`.
- Preference writes retain authentication and CSRF enforcement.
- No cross-user identifier was added to the frontend or API contract.

## Automated Tests

Added `tests/accountOverview.test.jsx`:

1. The account overview uses the implemented preference service and preserves its response shape.
2. Rejected enquiry and preference requests return non-crashing defaults.
3. Enabled preference channels are counted correctly.

Extended `tests/app.test.ts` to verify anonymous preference access is rejected.

Focused results:

- Account overview suite: 3 passed
- HTTP foundation suite: 8 passed, including preference authorization
- Routing/security plus account overview: 20 passed
- Existing auth, environment, and coverage suites: 16 passed
- Total non-database suite: 44 passed across 6 files
- Existing dedicated routing/security suite: 17 passed

The React Router server-render warnings in the existing focused suite remain test-environment warnings and are not runtime navigation failures.

## Full Validation

- `npm run validate`: PASS
- Prisma schema validation: PASS
- Prisma client generation: PASS
- ESLint: PASS
- Frontend TypeScript: PASS
- Server TypeScript: PASS
- Tests: 44 PASS
- Production build: PASS
- Existing Vite chunk warning: unchanged and deferred

Because Windows detached aggregate child-process output, the validation stages were also rerun and verified explicitly. The production bundle remained successful at 861.31 kB JavaScript / 214.12 kB gzip.

## Rendered Verification

Environment:

- Frontend: `http://127.0.0.1:5173`
- API: `http://127.0.0.1:3000`
- Browser: Codex in-app Chromium
- Data: configured development PostgreSQL/Supabase database

Results:

- Authenticated `/account`: PASS
- Account heading and overview content rendered: PASS
- Notification channel summary rendered with one default enabled channel: PASS
- Former `notificationService.list` exception: absent
- Horizontal overflow on the checked account root: absent
- `/account/notifications` child route: PASS
- Persisted preference shape: email true; SMS, push, and marketing false
- Temporary development account: removed after verification and confirmed absent

The only console error retained by the browser was historical output from before the API restart; no new account-root exception was emitted after the repair.

## Files Changed

- `src/pages/account/Account.jsx`
- `tests/accountOverview.test.jsx`
- `tests/app.test.ts`
- `docs/WP8_PHASE_8_2B3A_ACCOUNT_SERVICE_REPAIR.md`
- `docs/WP8_PHASE_8_2B3_ROUTING_REGRESSION_VALIDATION.md`

## Decision

- Account service-contract repair: PASS
- Persisted notification preferences preserved: YES
- Ownership/authentication preserved: YES
- Account root rendered successfully: YES
- Account child route rendered successfully: YES
- React Router changed: NO
- Dependencies changed: NO
- Schema/migrations changed: NO
- Phase 8.2B-3 overall status: remains PARTIAL
- Safe to proceed to Phase 8.2B-3B after explicit approval: YES

## Remaining Phase 8.2B-3 Gaps

- Exact 390 x 844 mobile validation
- Browser Back/Forward validation
- Authorised admin and admin-child validation using an approved existing fixture

Recommended next phase: Phase 8.2B-3B - Mobile and Browser-History Validation.
