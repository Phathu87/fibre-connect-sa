# WP3 Coverage Engine Execution

Date: 2026-09-17

## Delivered

- Added `GeocodingProvider` and `CoverageProvider` interfaces with deterministic demo implementations.
- Added `POST /api/coverage/check` with Zod validation and the standard request-correlated error envelope.
- Resolved coverage from PostgreSQL `CoverageArea` and `PackageAvailability` records and returned catalogue-compatible packages.
- Added explicit `AVAILABLE`, `PARTIAL`, `WIRELESS_ONLY`, `UNAVAILABLE`, `UNKNOWN`, and `PROVIDER_UNAVAILABLE` states.
- Added bounded provider timeouts and safe provider-failure responses.
- Persisted coverage search summaries without street addresses. Exact street input is not returned by the API, placed in result URLs, or sent to analytics.
- Replaced random browser mock coverage with the Fastify API and real permission-aware browser geolocation.
- Kept production CORS strict while allowing the standard loopback Vite origins only outside production.
- Replaced the fake notification success state with an explicit unavailable message.
- Seeded deterministic demo fibre, 5G and LTE coverage data. Every response is labelled `DEMO` and carries a provider-verification disclaimer.

## Evidence

- Prisma migration `20260917160000_coverage_foundation` applied to the development Supabase database.
- `npm run db:seed` completed against Supabase.
- Unit coverage includes fibre, wireless-only, uncovered, unknown, provider failure, timeout and street-address non-disclosure.
- Fastify validation test confirms invalid private input is not echoed.
- Live database integration verifies package-availability relations and confirms `CoverageSearch.address` contains locality only.
- Supabase security and performance advisors were run after DDL. Application tables have RLS enabled; the Prisma migration ledger was additionally hardened with RLS. Remaining findings are informational policy/index notices.

## Privacy Boundary

The frontend submits exact address input in a POST body over the API boundary. The browser result route is `/coverage/results` with no query string. The server stores only suburb, city, province, postal code and optional coordinates. Application logs use Fastify request metadata and do not log request bodies.

## External Blocker

`LIVE COVERAGE PROVIDER INTEGRATION — EXTERNAL BLOCKER`

No live provider credentials, commercial coverage API contract, SLA or production endpoint has been supplied. Demo mode remains deterministic and explicitly labelled; it does not claim live availability.
