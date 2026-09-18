# WP4 Authentication and RBAC Execution

Date: 2026-09-18

Status: COMPLETE

## Architecture

FibreConnect SA owns authentication in the Fastify API and PostgreSQL database. Passwords use Argon2id. Browser sessions and CSRF tokens are random opaque values; only SHA-256 hashes are persisted. Session cookies are HTTP-only, Secure in production and SameSite Strict. Mutation requests must also present the matching readable CSRF token in `x-csrf-token`.

The frontend calls `/api/auth/*` and `/api/me`; it no longer stores identity claims in local storage. Frontend guards are navigation UX only. Fastify middleware and repository ownership filters are the authorization boundary.

## Authorization

The centralized role matrix covers `USER`, `SUPPORT`, `SALES`, `PROVIDER_MANAGER`, `CONTENT_EDITOR`, `ANALYST`, `ADMIN` and `SUPER_ADMIN`. `roles.manage` is exclusive to `SUPER_ADMIN`. Registration ignores additional role input and always persists `USER`. Profile updates use a strict field whitelist.

Account-scoped routes compare the authenticated principal ID with the requested user ID before repository access. Administrative role and status changes require authentication, CSRF and `roles.manage`, and produce audit records.

## Database

Migration `20260917170000_auth_sessions_rbac` adds account status, last-login evidence, `AuthSession` and `AuthToken`. Both sensitive tables have RLS enabled and no Data API policy. The application reaches them only through the server database role.

The migration was applied to development project `usszxjobogorpbbaqjmy` and reconciled with Prisma migration history. The direct session pooler was unreachable from this host during validation, so the authenticated Supabase migration API was used; runtime transaction-pooler queries and all integration tests succeeded.

## Verification

- Prisma schema validation and client generation pass.
- Frontend and server type checks pass.
- Unit coverage verifies Argon2id and every role boundary.
- Six live database integration tests pass.
- The auth flow verifies registration, forced base role, verification, invalid login, ownership denial, CSRF denial, profile role-injection denial, admin denial, one-time password reset, old-session revocation, old-password denial and disabled-session denial.
- Supabase Security Advisor has no warning/error findings. Its 21 `rls_enabled_no_policy` informational notices are intentional deny-by-default behavior.
- Performance Advisor reports four pre-existing unindexed foreign keys and newly-created unused indexes; unused-index findings on a new development schema are not removal evidence.

## External Blockers

`PRODUCTION AUTH EMAIL DELIVERY - CONFIGURATION BLOCKER`: configure a transactional email provider and production templates before release. The unconfigured production adapter returns `503` before creating accounts or reset tokens.

`BOT PROTECTION - CONFIGURATION BLOCKER`: route rate limits are implemented. CAPTCHA/provider credentials and production thresholds require the selected deployment environment and traffic profile.

The Supabase secret key previously present in `.env.example` was removed. Rotate that key before production because it was exposed in a tracked-style configuration file, even though the production root had not yet been committed.
