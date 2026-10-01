# Production Environment Matrix

Date: 2026-10-01

Scope: variables actually consumed by the current FibreConnect repository. No values are recorded here.

| Variable | Consumer | Secret | Required | Phase | Netlify requirement | Failure behavior when absent |
| --- | --- | --- | --- | --- | --- | --- |
| `DATABASE_URL` | Server / Prisma Client | Yes | Required | Function runtime | Required; Functions scope, production context | Environment validation fails and the function cannot initialize |
| `DIRECT_URL` | Prisma CLI configuration | Yes | Required for production migrations, not request runtime | Migration/release tooling | Not required by the deployed function; required only in the controlled migration environment | Prisma CLI falls back to `DATABASE_URL`, which is inappropriate when a direct/session migration connection is required |
| `PUBLIC_APP_URL` | Server environment schema | No | Required | Function runtime | Required in production context | Environment validation fails and the function cannot initialize |
| `CORS_ORIGINS` | Fastify CORS | No | Required | Function runtime | Required; exact canonical browser origin(s) | Environment validation fails; incorrect values reject browser API requests with 403 |
| `NODE_ENV` | Server, cookies, auth-delivery selection | No | Operationally required as `production` | Build and function runtime | Required for production behavior | Defaults to `development`, producing non-Secure cookies and development auth behavior; unsafe for deployment |
| `TRUST_PROXY` | Fastify proxy/IP handling | No | Operationally required as `true` behind Netlify | Function runtime | Required for intended proxy behavior | Defaults to `false`; client IP-dependent logs, limits, and Turnstile context may reflect proxy topology incorrectly |
| `LOG_LEVEL` | Fastify/Pino | No | Optional | Function runtime | Optional | Defaults to `info` |
| `SESSION_COOKIE_NAME` | Auth middleware/routes | No | Optional | Function runtime | Optional | Defaults to `fc_session` |
| `SESSION_TTL_HOURS` | Auth service | No | Optional | Function runtime | Optional | Defaults to 168 hours; invalid values fail environment validation |
| `BOT_PROTECTION_SECRET` | Turnstile server adapter | Yes | Optional for portfolio; required only when Turnstile is enabled | Function runtime | Optional; Functions scope and production context only | Bot verification is disabled; rate limits remain. If configured before client token integration, protected public mutations fail |
| `RESEND_API_KEY` | Resend transactional email provider | Yes | Required for production authentication email | Function runtime | Required; Functions scope, production context | Provider reports `NOT_CONFIGURED`; registration and verification resend return controlled 503 responses |
| `EMAIL_FROM_ADDRESS` | Transactional email sender | No | Required for production authentication email | Function runtime | Required after sender/domain verification | Provider reports `NOT_CONFIGURED`; no external delivery is attempted |
| `EMAIL_FROM_NAME` | Transactional email sender display name | No | Optional | Function runtime | Optional | Defaults to `FibreConnect SA` |
| `EMAIL_PROVIDER_TIMEOUT_MS` | Transactional email HTTPS timeout | No | Optional | Function runtime | Optional | Defaults to 8000 ms; invalid values fail environment validation |
| `HOST` | Standalone Fastify server only | No | Optional / not used by Netlify handler | Standalone runtime | Not required for Netlify Functions | Defaults to `127.0.0.1`; the function handler does not call `listen()` |
| `PORT` | Standalone Fastify server only | No | Optional / not used by Netlify handler | Standalone runtime | Not required for Netlify Functions | Defaults to 3000; the function handler does not call `listen()` |
| `VITE_API_BASE_URL` | Browser API client | No | Optional | Frontend build time | Leave unset for same-origin `/api`, unless architecture changes | Defaults to `/api`, which is the required Netlify same-origin path |

## Explicit Absences

- No authentication/session signing-secret variable is used. Sessions use opaque random tokens whose hashes are stored in PostgreSQL.
- Transactional email uses a direct HTTPS Resend adapter. Production delivery remains externally blocked until a Resend account, API credential, verified sender/domain, and Netlify function-scoped production variables are configured.
- No analytics or monitoring environment variable is consumed by current source.
- `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` appear in `.env.example` but are not consumed by the application. Runtime database access uses `DATABASE_URL` only.
- Names in `ENVIRONMENT_VARIABLES.md` such as `API_BASE_URL`, `AUTH_SECRET`, `CSRF_SECRET`, unrelated provider keys, and analytics IDs are planning placeholders unless added to actual source in a future approved phase.

## Netlify Context Rules

- Production secrets must be limited to the production deploy context and Functions scope where supported.
- Deploy Previews and branch deploys must not inherit production `DATABASE_URL`, `DIRECT_URL`, `BOT_PROTECTION_SECRET`, or `RESEND_API_KEY`.
- Preview backends require isolated non-production credentials and matching preview CORS policy; otherwise backend execution should fail closed or previews should be disabled.
- Never expose server secrets through a `VITE_*` name because Vite embeds those variables in the browser bundle.
