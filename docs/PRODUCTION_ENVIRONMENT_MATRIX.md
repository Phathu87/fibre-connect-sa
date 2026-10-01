# Production Environment Matrix

Date: 2026-10-01

Scope: variables actually consumed by FibreConnect source or deployment tooling. Values are intentionally excluded.

Legend: R = required, O = optional, - = not used. Preview and branch entries describe API-enabled deployments; without the listed non-production configuration, the static frontend may build but the Function fails closed.

| Variable | Consumer | Secret | Local | CI | Production | Preview | Branch | Migration only | Required / default | Failure behavior |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `NODE_ENV` | Server, cookies, provider selection | No | O (`development`) | R (`test`) | R (`production`) | R (`production`) | R (`production`) | - | Defaults to `development` | Deployed runtime without `production` can use unsafe cookie/runtime behavior |
| `APP_DEPLOYMENT_CONTEXT` | Server deployment classifier | No | O (`local`) | O (`test`) | R (`production`) | R (`preview`) | R (`branch`) | - | No deployed default | Production-mode environment validation fails when absent |
| `DATABASE_DEPLOYMENT_CONTEXT` | Database isolation guard | No | - | - | R (`production`) | R (`preview`) | R (`branch`) | - | No safe default | Mismatch/absence fails initialization before Prisma use |
| `DATABASE_URL` | Prisma Client, seed script | Yes | R for API/data work | R for PostgreSQL job | R, production Functions context | R, isolated non-production value only | R, isolated non-production value only | No | No default in server runtime | Environment validation fails; Function returns controlled 503 |
| `DIRECT_URL` | `prisma.config.ts` | Yes | O for local migrations | R for migration rehearsal | - | - | - | Yes, R for release migrations | Falls back to `DATABASE_URL` in Prisma tooling only | Migration connection may be unsuitable; never used by request runtime |
| `PUBLIC_APP_URL` | Trusted auth/email link origin | No | R | R in PostgreSQL job | R, exact final HTTPS origin | R, exact preview HTTPS origin | R, exact branch HTTPS origin | - | No default | Invalid/missing value fails initialization; request-host mismatch returns 503 |
| `CORS_ORIGINS` | Fastify credentialed CORS | No | R; loopback origins added | R | R, exact HTTPS origin list | R, exact preview HTTPS origin | R, exact branch HTTPS origin | - | No wildcard/default | Invalid config fails initialization; unlisted requests receive 403 |
| `TRUST_PROXY` | Fastify request IP/proxy handling | No | O (`false`) | O (`false`) | R (`true`) | R (`true`) | R (`true`) | - | Defaults to `false` | Proxy-derived IP behavior may be incorrect |
| `LOG_LEVEL` | Fastify/Pino | No | O (`info`/`debug`) | O (`silent`) | O (`info`) | O (`info`) | O (`info`) | - | Defaults to `info` | Invalid values fail validation |
| `HOST` | Standalone server | No | O | - | - | - | - | - | `127.0.0.1` | Invalid values fail validation |
| `PORT` | Standalone server | No | O | - | - | - | - | - | `3000` | Invalid values fail validation |
| `SESSION_COOKIE_NAME` | Auth middleware/routes | No | O | O | O | O | O | - | `fc_session` | Invalid values fail validation |
| `SESSION_TTL_HOURS` | Auth service | No | O | O | O | O | O | - | `168` | Invalid values fail validation |
| `BOT_PROTECTION_SECRET` | Turnstile server adapter | Yes | O | - | O only after client integration | Must be absent unless dedicated preview client config exists | Must be absent unless dedicated branch client config exists | - | Empty disables Turnstile | When set, protected routes require valid client tokens |
| `RESEND_API_KEY` | Resend provider | Yes | - | - | R for live auth email | Must be absent; preview email is disabled | Must be absent; branch email is disabled | - | No default | Production provider reports not configured; non-production deploys never select Resend |
| `EMAIL_FROM_ADDRESS` | Resend sender | No | - | - | R for live auth email | - | - | - | No default | Production provider reports not configured |
| `EMAIL_FROM_NAME` | Resend sender | No | O | O | O | O | O | - | `FibreConnect SA` | Invalid values fail validation |
| `EMAIL_PROVIDER_TIMEOUT_MS` | Email HTTPS adapter | No | O | O | O | O | O | - | `8000` | Invalid values fail validation |
| `VITE_API_BASE_URL` | Browser API client | No | O | O | O, leave unset | O, leave unset | O, leave unset | - | Same-origin `/api` | Explicit value changes browser API target; never place secrets here |

## Platform Variables

- Netlify `CONTEXT` (`production`, `deploy-preview`, `branch-deploy`, `dev`) and `DEPLOY_PRIME_URL` are automatic build variables, but Netlify does not expose them as read-only Function runtime variables.
- Configure `APP_DEPLOYMENT_CONTEXT` and `DATABASE_DEPLOYMENT_CONTEXT` through Netlify contextual values with Functions scope. Do not place them in `netlify.toml` because file-declared environment variables are not available to Functions runtime.
- `URL`, `SITE_NAME`, and `SITE_ID` are available to Functions, but `URL` is the main site address and is not a reliable preview/branch classifier.

## Context Policy

- Local: local database, HTTP loopback origins, development capture email, and non-Secure cookies are allowed.
- CI: test mode and disposable PostgreSQL only. No provider credentials.
- Production: exact HTTPS origin, production-labelled runtime database, Secure host-only cookies, and production-only Resend credentials.
- Preview: Policy B by default. The API is blocked unless an isolated database, `APP_DEPLOYMENT_CONTEXT=preview`, `DATABASE_DEPLOYMENT_CONTEXT=preview`, and exact preview origins are explicitly configured. External email remains disabled.
- Branch: same fail-closed policy with context value `branch` and an isolated branch/staging database.
- Migration tooling: `DIRECT_URL` exists only in the controlled release environment; Netlify Functions do not need it.

## Exposure Rules

- Never expose `DATABASE_URL`, `DIRECT_URL`, `RESEND_API_KEY`, or `BOT_PROTECTION_SECRET` through `VITE_*`, build output, documentation values, logs, or frontend scope.
- Netlify account variables default to all contexts/scopes unless narrowed. Production secrets must be production-context and Functions-scoped where the plan supports scopes.
- `VITE_API_BASE_URL` is the only consumed frontend variable. Same-origin `/api` is the production, preview, and branch default.
- `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` remain unused placeholders in `.env.example`; runtime database access uses `DATABASE_URL`.
