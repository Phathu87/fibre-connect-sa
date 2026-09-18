# WP2 Public Catalogue Evidence

Date: 2026-09-17

Status: COMPLETE

## Implemented

- Fastify catalogue endpoints for packages, package detail, related packages, providers and network operators.
- Zod validation for catalogue filters, sorting, pagination and route parameters.
- Prisma repository reads active catalogue records from Supabase PostgreSQL.
- API serialization converts Prisma decimals and enum values to frontend-safe values.
- Frontend package/provider/network services now call the API and contain no mock-data fallback.
- Vite development proxy routes `/api` to Fastify.
- Seeded catalogue remains explicitly `DEMO / DEVELOPMENT DATA` and contains no MWEB records.

## Verification

- Package filtering and sorting: PASS.
- Package detail with provider/network relations: PASS.
- Invalid query handling: PASS with `400 validation_error`.
- Inactive package handling: PASS with 404.
- Expired promotion handling: PASS; historical promotional value is not exposed as active pricing.
- Rendered packages, providers and networks pages: PASS against the live API and PostgreSQL.
- `npm run validate`: PASS.
- `npm run test:db:integration`: PASS, 4 tests.

No credentials are recorded in this evidence.
