# WP6 Security, Privacy and Observability

Date: 2026-09-23

Status: COMPLETE

## Security Controls

Fastify applies Helmet, exact-origin credentialed CORS, opaque request IDs and stable error envelopes. Sensitive public mutations use route-specific in-process rate limits. Registration, login, forgot-password and enquiry submission also pass through an optional Turnstile adapter. When `BOT_PROTECTION_SECRET` is absent the adapter is disabled; when configured it requires `x-bot-token` and validates it server-side.

Pino redacts authorization headers, request cookies, response cookies, passwords and common raw token fields. Validation responses do not echo rejected request bodies. Database and internal exceptions are logged server-side under the request ID but returned as a generic error envelope.

## Privacy Inventory

| Data | Purpose | Storage | User control | Deletion behavior |
| --- | --- | --- | --- | --- |
| Profile and contact details | Account and enquiry communication | `User` | View/update/export | Deleted |
| Addresses | Installation locations | `UserAddress` | Create/prefer/delete/export | Cascade-deleted |
| Saved packages and comparisons | Account convenience | `SavedPackage`, `Comparison` | Toggle/replace/export | Cascade-deleted |
| Notification preferences | Communication choices | `NotificationPreference` | Update/export | Cascade-deleted |
| Coverage summaries | Availability history and service evidence | `CoverageSearch` | Export | User link removed/deleted by relation behavior; exact street is never persisted |
| Enquiries and consent timestamps | Lead fulfilment and consent evidence | `Enquiry`, `EnquiryStatusHistory` | View/export | Retained operational record is unlinked and identifying fields are anonymized |
| Authentication sessions/tokens | Account security | `AuthSession`, `AuthToken` | Logout/reset indirectly | Cascade-deleted; never exported |
| Audit records | Privileged-operation evidence | `AuditLog` | Admin-only | Actor link becomes null; event evidence remains |

The export explicitly selects allowed fields and excludes password hashes, raw/hashed session tokens, CSRF hashes, authentication tokens and internal audit data.

## Account Erasure

`DELETE /api/me/account` requires an authenticated session, CSRF, the current password and a three-per-hour limit. A PostgreSQL transaction records the deletion event, anonymizes retained enquiries and deletes the user. User-owned sessions, tokens, addresses, saved packages, comparisons and preferences are removed through database cascades. Cookies are cleared after success.

## Audit Access

`GET /api/admin/audit-logs` requires `audit.read` and returns bounded, cursor-ready records with safe actor identity fields. The admin shell displays the authenticated database role; it no longer offers a client-side role selector.

## Verification

- Schema/client generation, lint and frontend/server type checks pass.
- 22 local unit/API tests pass.
- Eight live Supabase integration tests pass.
- The production Vite build passes with the known bundle-size warning.
- The WP6 integration test proves safe export, ordinary-user audit denial, administrator audit access, wrong-password deletion denial, transactional account deletion, enquiry anonymization and retained audit evidence.
- A live dependency audit reports 8 advisories (2 low, 2 moderate, 4 high, 0 critical). No remaining high advisory is on the deployed PostgreSQL API path; controlled major-version remediation remains a release task.

## External Configuration Gates

- Configure the Turnstile client widget and `BOT_PROTECTION_SECRET`, then validate challenge behavior in the production origin.
- Replace in-memory rate-limit storage with a shared adapter before running multiple API instances.
- Configure production monitoring/error reporting and alert destinations after the hosting environment is connected.
- Complete the Netlify account/repository connection and production environment variables described in `docs/NETLIFY_DEPLOYMENT.md`.
