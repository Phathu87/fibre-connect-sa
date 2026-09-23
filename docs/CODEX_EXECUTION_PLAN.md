# Codex Execution Plan

Date: 2026-09-17

Statuses: NOT STARTED, IN PROGRESS, BLOCKED, COMPLETE

## WP0 - Stabilise Current Baseline

Status: COMPLETE

Objective: Make the existing exported app install, lint, typecheck and build so future migration work starts from a known working frontend.

Files/features affected: `src/components`, `src/pages`, `jsconfig.json`, `package.json` scripts where necessary.

Dependencies: Existing Vite/React app and installed npm dependencies.

Database impact: None.

API impact: None.

Security impact: Low direct impact; required before safe production migration.

Tests required: `npm run lint`, `npm run typecheck`, `npm run build`.

Current evidence:

- Added missing `src/components/coverage/NetworkPackageGroup.jsx`, restoring the coverage results import.
- Ran `npm run lint:fix` to remove unused imports.
- `npm run lint` now passes.
- Removed the legacy hosted-platform runtime and replaced its implicit source alias with standard Vite configuration.
- Added explicit optional component defaults, typed DOM/Radix wrappers, filter/enquiry state contracts, analytics globals and safe date arithmetic.
- `npm run lint` passes on 2026-09-17.
- `npm run typecheck` passes on 2026-09-17 with `checkJs` enabled.
- `npm run build` passes on 2026-09-17. Remaining non-blocking warnings: stale Browserslist data and a JavaScript chunk slightly above 500 kB.

Completion criteria: COMPLETE. All three commands pass; build warnings are recorded for the performance work package.

## WP1 - Production Foundation

Status: COMPLETE

Objective: Establish TypeScript, environment validation, database configuration, Prisma schema, migrations, seed data, API conventions, logging and request correlation.

Files/features affected: app architecture, config, database schema, scripts, docs.

Dependencies: Decision on final framework migration strategy and PostgreSQL availability.

Database impact: Introduces PostgreSQL schema and migrations.

API impact: Establishes API response and error conventions.

Security impact: Adds server-side validation and safer configuration handling.

Tests required: migration validation, seed validation, unit tests for validation and money/reference helpers.

Completion criteria: Clean install, migrations and seed run successfully, app starts, production build succeeds, env validation works.

Current evidence:

- Added Fastify server composition with request IDs, structured error envelopes, security headers, allowlisted CORS, `/api/health` and database-backed `/api/ready`.
- Added strict server TypeScript configuration and runtime environment validation with secret-safe errors.
- Added Prisma 7 PostgreSQL schema, generated initial migration SQL, explicit seed command and generated-client workflow.
- `npm run db:check`, `npm run db:generate`, `npm run typecheck:server` and six foundation tests pass locally.
- The Supabase development project `fibreconnect-sa-dev` (`usszxjobogorpbbaqjmy`) was verified ACTIVE_HEALTHY on 2026-09-17.
- Applied the exact checked-in `20260917000000_initial_foundation` migration through the connected Supabase project. Supabase migration history records it, and inspection verifies all 18 Prisma tables plus their primary keys, foreign keys, unique constraints, indexes, enums and nullability.
- Corrected the incomplete Prisma seed so it now transactionally upserts three providers, three network operators, three MWEB-free broadband packages and the demo catalogue setting. All commercial records are explicitly labelled `DEMO / DEVELOPMENT DATA`.
- Executed equivalent seed operations twice against development Supabase. Both passes succeeded and final counts remained 3 providers, 3 networks, 3 packages and 1 catalogue setting, verifying idempotency.
- Live PostgreSQL checks passed for a representative provider/network/package join, create-read-update-delete cleanup, foreign-key rejection, unique-slug rejection, successful transaction commit and failed-transaction rollback.
- Applied and verified `20260917130000_enable_public_table_rls`. All 18 application tables have RLS enabled with no Data API policies, so anonymous and authenticated browser roles receive no table access. Supabase reports no error-level security findings; the 18 informational `rls_enabled_no_policy` notices are intentional for the Fastify/Prisma-only data boundary.
- `DATABASE_URL` is now present in a Node process started at the repository root, and `.gitignore` covers `.env` and `.env.*`. Its Supabase transaction-pooler shape is correct, but the password segment is still a placeholder. A real Prisma query reached Supabase and failed with PostgreSQL `28P01` / Prisma `P1000`; runtime connectivity, real `db:seed`, Fastify `/ready`, database integration tests and an isolated clean-migration rehearsal remain blocked until the real development password replaces the placeholder.
- Refreshed Supabase advisors on 2026-09-17: security has no error-level findings and only 18 intentional `rls_enabled_no_policy` informational notices; performance reports 4 unindexed-foreign-key and 17 unused-index informational notices. The database is newly seeded, so unused-index findings are not removal evidence.
- Runtime secrets are configured locally and ignored by Git. Prisma CLI uses `DIRECT_URL` through the session pooler while Fastify/Prisma runtime queries use pooled `DATABASE_URL`.
- Prisma runtime reads verified 3 providers, 3 network operators and 3 broadband packages. Prisma migration history was reconciled with the two already-applied Supabase migrations and reports the schema up to date.
- The checked-in seed executed twice through Prisma without duplicates.
- A listening Fastify process returned `200` from `/api/health` and `200` with database availability from `/api/ready`.
- The controlled failure test returned `200` from `/api/health` and `503` with database unavailable from `/api/ready`.
- The live PostgreSQL integration suite passes 4 tests; the consolidated `npm run validate` gate also passes after the runtime and catalogue work.
- The consolidated `npm run validate` gate passes after the seed correction on 2026-09-17: schema validation, client generation, lint, frontend/server type checking, 6 tests and the production frontend build.
- The consolidated `npm run validate` gate passes on 2026-09-17: schema validation, client generation, lint, frontend/server type checking, 6 unit/integration tests and the production frontend build.
- Current live `npm audit` reports 17 advisories (3 low, 6 moderate, 8 high), including direct-tooling advisories affecting Prisma and direct React Router advisories. Breaking forced remediation was not applied; dependency resolution remains release-blocking security work.

## WP2 - Public Catalogue Backend

Status: COMPLETE

Objective: Replace mock packages, providers and networks with repository/API-backed data while preserving current UI shapes.

Files/features affected: package/provider/network services, catalogue pages, API routes, Prisma models.

Dependencies: WP1.

Database impact: Provider, NetworkOperator, BroadbandPackage, Promotion and related indexes.

API impact: Public package/provider/network endpoints.

Security impact: Validated query parameters and safe pagination.

Tests required: filtering, sorting, package detail, inactive package and expired promotion tests.

Completion criteria: UI renders from database-backed services with no mock fallback in verified catalogue paths.

Current evidence:

- Added validated Fastify catalogue endpoints for package listing/detail/related packages, providers and network operators.
- Added a Prisma catalogue repository with active-record enforcement, pagination, filters, sorting and stable API serialization for decimals and connectivity labels.
- Replaced package, provider and network service mock imports with HTTP API calls. Vite proxies `/api` to the local Fastify process during development.
- Expired promotional prices are not presented as active prices; inactive packages return 404.
- Live integration coverage verifies filtering, highest-speed sorting, package detail relations, invalid query rejection, inactive-package exclusion and expired-promotion behavior.
- Rendered browser verification confirms the package page displays 3 database records and live provider/network filters; provider and network listing pages render the 3 seeded records from PostgreSQL.
- `npm run validate` and `npm run test:db:integration` pass on 2026-09-17.

## WP3 - Coverage Engine

Status: COMPLETE

Objective: Implement coverage and geocoding abstractions, demo provider, persistence and source labelling.

Files/features affected: coverage service, coverage results UI, API routes, CoverageArea, CoverageSearch.

Dependencies: WP1 and WP2.

Database impact: CoverageArea, PackageAvailability, CoverageSearch.

API impact: `POST /api/coverage/check`, location endpoints.

Security impact: Rate limiting, validation, privacy-safe analytics and no precise addresses in public URLs.

Tests required: covered, uncovered, invalid, provider failure, timeout and mobile flow tests.

Completion criteria: Coverage journey works from API/provider abstraction and clearly labels demo/estimated data.

Current audit:

- `coverageService` is frontend-only, imports `mockData`, uses random outcomes and has no provider/geocoding boundary.
- `/coverage/results` receives the precise street address in the public query string and the results page reads it directly.
- Current-location behavior inserts a fabricated Sandton address instead of using a permission-aware platform adapter.
- Notify-me currently displays success without persistence; it must remain explicitly unavailable until the later notification work package.
- Location pages read static mock provinces/cities/suburbs and derive package availability client-side.
- Existing `CoverageArea`, `PackageAvailability` and `CoverageSearch` models can be extended additively for source, freshness and privacy-safe search summaries; duplicate models are unnecessary.
- WP3 will preserve the existing UX while replacing its data path with Fastify, provider interfaces, repositories and Prisma.

Completion evidence:

- Deterministic geocoding and coverage provider interfaces now separate external integrations from orchestration and persistence.
- `POST /api/coverage/check` validates input, resolves seeded PostgreSQL coverage and returns explicit fibre, wireless, unavailable, unknown and provider-unavailable states.
- Searches persist privacy-minimized locality summaries; exact streets are excluded from API responses, persistence, analytics and result URLs.
- Browser geolocation is permission-aware and the previous fabricated Sandton location and random coverage outcomes are removed.
- Unit and live Supabase integration tests cover deterministic results, failure, timeout, validation, package relations and address non-disclosure.
- Full implementation and evidence are recorded in `docs/WP3_COVERAGE_EXECUTION.md`.
- `LIVE COVERAGE PROVIDER INTEGRATION — EXTERNAL BLOCKER` remains documented and does not block deterministic demo completion.

## WP4 - Authentication and RBAC

Status: COMPLETE

Objective: Replace the local demo authentication adapter with production auth and server-enforced authorization.

Files/features affected: auth service, auth pages, account/admin guards, API middleware, user/role schema.

Dependencies: WP1.

Database impact: User, roles, verification/reset/session data as required by selected auth provider.

API impact: auth endpoints and protected current-user endpoints.

Security impact: High. Adds secure sessions, password reset, role checks and protected server operations.

Tests required: registration, login, logout, reset, protected route, role-denial and ownership tests.

Completion criteria: Demo auth is removed and forbidden operations are rejected server-side.

Completion evidence:

- Replaced the forgeable local-storage demo identity with server-authenticated opaque sessions stored only as SHA-256 hashes and delivered in secure, HTTP-only, SameSite cookies.
- Added Argon2id password hashing, CSRF protection, email verification, single-use password reset tokens, logout and account-state enforcement.
- Added a centralized eight-role permission matrix and server middleware for authentication, permissions and strict resource ownership.
- Registration always creates a `USER`; profile input is strictly whitelisted and cannot mutate roles or status. Role/status administration is restricted to `SUPER_ADMIN` and audit logged.
- Added `AuthSession` and `AuthToken` tables, indexes, cascade relationships and RLS. The checked-in migration is applied to development Supabase and recorded in Prisma migration history.
- Live Supabase integration tests verify registration, verification, bad-password denial, CSRF denial, cross-account denial, role injection denial, admin denial, one-time reset, session revocation and disabled-account denial.
- The full six-test database integration suite passes. Supabase Security Advisor reports no warning/error findings; 21 no-policy informational notices are intentional because browser roles have no Data API access.
- Production SMTP remains `PRODUCTION AUTH EMAIL DELIVERY - CONFIGURATION BLOCKER`. Production registration/reset returns `503` before mutation until a delivery adapter is configured; this does not invalidate the completed auth architecture.
- Full implementation evidence is recorded in `docs/WP4_AUTH_RBAC_EXECUTION.md` and `docs/SECURITY_VALIDATION.md`.

## WP5 - User Data and Enquiry Pipeline

Status: COMPLETE

Objective: Persist profile, addresses, saved packages, comparisons, enquiries, status history and notification preferences.

Files/features affected: account pages, enquiry pages, user data services, admin enquiries.

Dependencies: WP1, WP2, WP3, WP4.

Database impact: UserAddress, SavedPackage, Comparison, ComparisonItem, Enquiry, EnquiryStatusHistory, NotificationPreference.

API impact: `/api/me/*`, `/api/enquiries`, admin enquiry endpoints.

Security impact: Ownership enforcement, duplicate prevention, consent timestamps, audit logs.

Tests required: full enquiry journey, duplicate protection, account/admin status visibility and IDOR checks.

Completion criteria: Primary enquiry workflow persists durably and can be operated by authorized admins.

Execution evidence:

- Replaced account `localStorage` persistence with authenticated Fastify routes for addresses, saved packages, comparisons, notification preferences and account enquiry history. Guest saved/comparison behavior remains local by design until authentication.
- Added public enquiry creation with strict validation, active-package checks, ten-minute duplicate suppression, explicit consent timestamps, optional authenticated ownership and initial status history.
- Added permission-protected admin listing and mutation. Status/note changes are durable, append enquiry history and create an `AuditLog` record; fictional staff assignment choices were removed from the UI.
- Repository ownership predicates prevent cross-account address mutation. Comparison writes reject inactive or unknown packages and cap unique selections at four.
- The seven-test live Supabase integration suite passes, including the full WP5 journey, duplicate denial, account/admin visibility, consent persistence, audit evidence and an IDOR deletion attempt.
- Prisma validation/client generation, lint, frontend/server type checks, unit tests and production build pass. Full evidence is recorded in `docs/WP5_USER_DATA_ENQUIRY_EXECUTION.md`.

## WP6 - Security, Privacy and Observability

Status: COMPLETE

Objective: Implement rate limits, bot protection hooks, headers, audit logging, privacy controls, data export/deletion, structured logs, health checks and monitoring adapters.

Files/features affected: server middleware, docs, account privacy pages, admin audit.

Dependencies: WP1-WP5.

Database impact: AuditLog, retention/export/deletion support.

API impact: security middleware and operational endpoints.

Security impact: High.

Tests required: unauthorized access attempts, repeated submissions, invalid input, unsafe redirect and PII leakage checks.

Completion criteria: `docs/SECURITY_VALIDATION.md` and privacy inventory are evidence-backed by actual checks.

Execution evidence:

- Added Pino redaction for authorization, cookies, response cookies, passwords and token-bearing request fields while preserving request IDs and structured operational errors.
- Added an optional Cloudflare Turnstile server adapter for registration, login, password-reset requests and enquiries. It is inert without a secret and fails closed when configured; production widget/secret activation remains an external configuration gate.
- Added authenticated personal-data export and password-confirmed account erasure. Account-owned records cascade-delete while retained enquiries are unlinked and identifying fields are anonymized in the same transaction.
- Added permission-protected, cursor-ready audit-log API/UI. Ordinary users receive 403; authorized administrators can inspect server-recorded privileged events.
- Removed the admin role simulation and the final profile notification-preference `localStorage` path.
- The eight-test live Supabase suite proves export safety, audit authorization, invalid-password denial, deletion, anonymization and retained deletion evidence. The 22-test local suite proves bot enforcement when configured and existing security boundaries.
- Full privacy inventory and validation evidence are recorded in `docs/WP6_SECURITY_PRIVACY_OBSERVABILITY.md` and `docs/SECURITY_VALIDATION.md`.

## WP7 - CI/CD and Release Documentation

Status: NOT STARTED

Objective: Add deterministic CI, release checklists, rollback, backup/recovery, metrics dictionary and production readiness documentation.

Files/features affected: `.github/workflows`, `docs/`, `CHANGELOG.md`, `.env.example`.

Dependencies: Stable local validation commands.

Database impact: Migration validation in CI.

API impact: None directly.

Security impact: Dependency review, secret scanning and protected workflow design.

Tests required: CI dry run or platform-run evidence where available.

Completion criteria: CI gates mirror local verification and docs clearly identify blockers.

## WP8 - PWA and Native Preparation

Status: NOT STARTED

Objective: Complete PWA manifest/service worker strategy, Capacitor preparation, platform release documentation and store metadata skeletons.

Files/features affected: public assets, service worker, Capacitor config, `store/`, release docs.

Dependencies: Stable web app and production URL strategy.

Database impact: None.

API impact: Version/deep-link compatibility considerations.

Security impact: Review offline caching and native permissions.

Tests required: installability, standalone mode, no private API caching, Android/iOS build checks where available.

Completion criteria: Platform readiness is documented honestly with missing credentials/devices marked blocked.
