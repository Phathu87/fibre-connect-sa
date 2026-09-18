# WP1 Database Execution Evidence

Date: 2026-09-17

Environment: DEVELOPMENT

Supabase project: `fibreconnect-sa-dev` (`usszxjobogorpbbaqjmy`)

## Completed

- Project state: ACTIVE_HEALTHY.
- Migration: checked-in `20260917000000_initial_foundation` applied successfully through the connected Supabase project.
- Migration history: independently verified in Supabase.
- Schema: 18 application tables verified with expected keys, relationships, constraints, indexes and enums.
- Security: tracked migration `20260917130000_enable_public_table_rls` applied and verified. RLS is enabled on all 18 tables with no client policies; Supabase has no error-level security findings.
- Security advisor refresh: 18 informational `rls_enabled_no_policy` notices and no error-level findings. This is intentional because the frontend must not access Supabase tables directly; Fastify/Prisma is the data boundary and application authorization remains server-enforced.
- Performance advisor refresh: 4 informational unindexed-foreign-key notices and 17 unused-index notices. The unused-index observations are expected on the newly seeded development database; no indexes were removed. Covering-index work remains evidence for later query-path optimisation rather than a runtime-connection workaround.
- Secret handling: `.gitignore` covers `.env` and `.env.*`; no root `.env` currently exists.
- Seed: 3 providers, 3 network operators, 3 broadband packages and 1 demo catalogue setting persisted.
- Classification: package descriptions identify all seeded offers as `DEMO / DEVELOPMENT DATA`.
- Idempotency: second seed pass completed with unchanged record counts.
- Relational read: provider, network and package join returned the expected representative record.
- CRUD: controlled provider create, read, update and delete passed with cleanup.
- Constraints: invalid foreign key and duplicate unique slug were rejected.
- Transactions: successful transaction committed; deliberately failed dependent transaction rolled back.
- Validation: `npm run validate` passed, including Prisma validation/generation, lint, frontend/server type checks, 6 tests and production build.

## Runtime Gate

- `DATABASE_URL: PRESENT` and `DIRECT_URL: PRESENT` in a Node process started at the repository root; values were never printed or recorded.
- Runtime mode: Supabase transaction pooler through `DATABASE_URL`.
- Migration mode: Supabase session pooler through `DIRECT_URL`.
- Prisma runtime connection: PASS; representative counts are 3 providers, 3 network operators and 3 broadband packages.
- Prisma migration status: PASS; both checked-in migrations are recorded and the database schema is up to date.
- Prisma seed: PASS twice through the application configuration.
- Fastify startup: PASS.
- `/api/health`: `200`, process healthy.
- `/api/ready`: `200`, database available.
- Controlled database failure: `/api/health` remained `200`; `/api/ready` returned `503` and database unavailable.
- Automated application/database integration: 4 tests pass through Fastify, the repository and Prisma.
- Full validation: PASS.

## Decision

WP1 COMPLETE - DATABASE EXECUTION GATE PASSED.

No credentials are recorded in this evidence.
