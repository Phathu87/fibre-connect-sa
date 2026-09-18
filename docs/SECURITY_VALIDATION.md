# Security Validation

Date: 2026-09-18

## Verified Controls

| Control | Evidence | Result |
| --- | --- | --- |
| Password storage | Argon2id unit test; plaintext absent from hash | PASS |
| Session storage | Random opaque browser token; SHA-256 database hash | PASS |
| Cookie policy | HTTP-only session, SameSite Strict, Secure in production | PASS |
| CSRF | Missing token rejected on authenticated mutation | PASS |
| Mass assignment | Registration forced to `USER`; profile role field rejected | PASS |
| Authentication | Anonymous account/admin routes rejected | PASS |
| RBAC | Eight-role matrix tested; role administration super-admin only | PASS |
| IDOR/BOLA | Cross-account profile request rejected before data access | PASS |
| Reset replay | Used reset token rejected; existing sessions revoked | PASS |
| Account status | Disabled account rejected despite an existing cookie | PASS |
| Rate limiting | Per-route limits on registration, login, verification and reset | PASS |
| Database exposure | RLS enabled; no browser-role Data API policies | PASS |
| Secret examples | `.env.example` contains placeholders only | PASS |

## Advisor Results

Supabase Security Advisor reports one informational class across 21 tables: RLS enabled with no policy. This is intentional because FibreConnect uses Fastify and Prisma as the exclusive data boundary. There are no security warning or error findings.

Performance Advisor reports four pre-existing foreign keys without covering indexes and eleven currently unused indexes. The auth foreign-key access paths are covered. New-schema unused-index findings will be reassessed with production-like query telemetry.

## Dependency Result

`npm audit fix` without `--force` reduced the report from 17 to 8 advisories: 2 low, 2 moderate and 4 high. Remaining high findings are Prisma CLI/configuration chains, including unused MySQL tooling; remediation currently proposes an incompatible Prisma major downgrade. Remaining browser/editor findings require major upgrades. No forced breaking remediation was applied.

## Release Blockers

- Configure production transactional email and verify deliverability, templates and link handling.
- Configure production bot protection and validate rate-limit storage for a multi-instance deployment.
- Rotate the previously exposed Supabase secret key before production.
- Re-run dependency audit and complete controlled major-version remediation before release sign-off.
