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
| Log redaction | Authorization, cookies, password and token paths redacted by Pino | PASS |
| Bot boundary | Configured public mutations require server-validated Turnstile token | PASS |
| Data export | Explicit allowlist excludes password/session/token/audit internals | PASS |
| Account deletion | Password + CSRF required; enquiry PII anonymized transactionally | PASS |
| Audit visibility | Ordinary user denied; `audit.read` administrator allowed | PASS |

## Advisor Results

Supabase Security Advisor reports one informational class across 21 tables: RLS enabled with no policy. This is intentional because FibreConnect uses Fastify and Prisma as the exclusive data boundary. There are no security warning or error findings.

Performance Advisor reports four pre-existing foreign keys without covering indexes and eleven currently unused indexes. The auth foreign-key access paths are covered. New-schema unused-index findings will be reassessed with production-like query telemetry.

## Dependency Result

The live 2026-09-23 `npm audit` reports 8 advisories: 2 low, 2 moderate, 4 high and 0 critical. Remaining high findings are Prisma CLI/configuration chains, including unused MySQL tooling; remediation currently proposes an incompatible Prisma major downgrade. The React Router findings require a major upgrade; FibreConnect's authentication return path already enforces same-origin URLs, rejects protocol-relative/backslash forms and strips authentication-shaped parameters. The Quill finding applies to HTML export functionality that FibreConnect does not expose. No forced breaking remediation was applied.

## Release Blockers

- Configure production transactional email and verify deliverability, templates and link handling.
- Configure production bot protection and validate rate-limit storage for a multi-instance deployment.
- Connect the active GitHub repository to Netlify and configure its production environment; both historical MWEB Netlify addresses now return `Site not found`.
- Rotate the previously exposed Supabase secret key before production.
- Re-run dependency audit and complete controlled major-version remediation before release sign-off.
