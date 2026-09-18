# Codex Initial Audit

Date: 2026-09-17

## System Summary

FibreConnect SA is a substantial React/Vite product frontend with public discovery, account and admin experiences. It currently uses realistic sample catalogue and coverage data plus browser storage for user state. It is not yet a production full-stack service.

The original MWEB assessment is retained as historical source material in `mweb-fiber-app/`. The active application is independently branded and materially broader in scope.

## Architecture

Current flow:

`Pages/components -> service modules -> sample data or browser storage`

Target flow:

`Pages/components -> feature hooks -> API client -> server services -> repositories -> PostgreSQL/integrations`

## Feature Matrix

| Feature | Current implementation | Legacy platform dependency | Production requirement | Action |
| --- | --- | --- | --- | --- |
| Packages | Sample catalogue behind `packageService` | None | Database repository, API, validation and pagination | REPLACE |
| Coverage | Demo rules behind `coverageService` | None | Geocoding/coverage adapters, persistence, rate limiting and source labels | REPLACE |
| Comparison | Browser-local collection and responsive UI | None | Guest persistence plus authenticated merge and durable records | REFACTOR |
| Favourites | Browser-local storage | None | User-owned persistence and guest merge | REPLACE |
| Authentication | Browser-local demo session adapter | None | Secure server sessions, verification, reset and deletion | REPLACE |
| Account | Protected frontend routes with local data | None | Server-owned profile, addresses, history and preferences | REPLACE |
| Enquiries | Multi-step UI persisted in browser storage | None | Server validation, durable records, status history, duplicate protection and notifications | REPLACE |
| Admin | Demonstration screens without server enforcement | None | Server RBAC, repositories, audit logs and operational controls | REPLACE |
| Analytics | Consent-aware local event queue and provider hook | None | Production adapter, environment separation and validated no-PII events | REFACTOR |
| Notifications | Local preference state only | None | Transactional provider adapters, queue, retries and delivery evidence | IMPLEMENT |

## Keep

- Current brand, information architecture, routes and responsive product journeys.
- Service boundary pattern and stable catalogue identifiers.
- Package comparison, coverage, enquiry and account UX where production behaviour can replace local adapters without redesign.
- Draft legal pages, with mandatory professional review before commercial release.

## Replace Or Implement

- Browser-local authentication, user data and enquiries.
- Sample catalogue and coverage sources in verified production paths.
- Demonstration admin behaviour and all client-only authorization assumptions.
- Missing server, PostgreSQL schema/migrations, API validation, queues, notification adapters, observability and deployment controls.

## External Blockers

- Live provider/package and coverage agreements or API credentials.
- Production hosting, domain/DNS, database, email/SMS/push and monitoring accounts.
- Legal approval of privacy, terms and commercial claims.
- Native signing credentials, developer/store accounts and physical-device validation.

These are `NOT VALIDATED`; they are not treated as passing merely because the frontend builds.
