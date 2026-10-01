# WP8 Phase 8.3 Netlify Configuration Audit

Date: 2026-09-30

Status: PASS (audit complete; deployment blockers remain)

Scope: read-only repository and dependency analysis. No Netlify site, environment variable, deployment, application source, dependency, database, migration, or configuration was changed.

## Git State

- Branch: `main`
- Audit baseline HEAD: `faf3300866124acdefee368747ec3af21c73ec51`
- `origin/main`: `f398bcfb4e611d266f420487955552a279e682f3`
- Ahead/behind: 10 ahead, 0 behind
- Working tree at audit start: clean
- Push performed: no

## Netlify Build

`netlify.toml` configures `npm run build`. Phase 8.3A-1 changed that repository command to run `npm run db:generate && vite build`, so it now produces both the ignored Prisma client required by the function and the Vite frontend from a clean checkout.

The generated Prisma client remains correctly ignored and untracked at `src/generated/prisma`. Generation does not run migrations or require database connectivity; `prisma.config.ts` supplies its local fallback URL when deployment database variables are absent.

Node is now pinned to `22.x` in `package.json`, while `[build.environment] NODE_VERSION = "22"` pins the Netlify build. Netlify Functions inherit the build Node version by default, and GitHub Actions already uses Node 22.

### Prisma clean-build generation

**RESOLVED.** A clean `npm ci` followed directly by `npm run build`, with both `dist` and `src/generated/prisma` absent beforehand, generated Prisma Client 7.10.0 and completed the Vite build.

### Node 22 runtime pinning

**RESOLVED.** Local validation used Node 22.21.0, CI specifies Node 22, package metadata requires `22.x`, and Netlify repository configuration selects Node 22.

No Netlify build plugins are configured.

## Publish Directory

`publish = "dist"` matches Vite's default production output. The configured immutable cache rule for `/assets/*` matches Vite's hashed asset directory.

## Functions Architecture

- Functions directory: `netlify/functions`
- Source entry: `netlify/functions/api.ts`
- Bundler: Netlify esbuild
- Explicit external module: `argon2`, preserving its native package structure
- App composition: the module lazily creates one Fastify instance with `createApp(loadEnv())`, caches it at module scope, and awaits `app.ready()`
- Request translation: method, path/query, string headers, Base64 decoding, and body are passed to `Fastify.inject()`
- Response translation: status, body, scalar headers, and multi-value headers are returned in Lambda-compatible form
- Error handling: Fastify maps known application/Zod errors to stable envelopes, logs server failures, and includes the request ID; initialization/configuration failures propagate as function failures

The module-scoped Fastify app and module-scoped Prisma client are reused in warm function instances. Cold instances create one app, one Prisma client, and one PostgreSQL adapter/pool. No client is created per request.

Netlify currently documents a 60-second synchronous execution limit and 6 MB buffered request/response payload limit. Existing JSON CRUD, catalogue, auth, coverage, and data-export operations do not expose an upload path or an obvious need to exceed those limits. This is an architectural assessment, not load evidence.

## API Routing

Redirect order is correct:

1. `/api/*` rewrites with status 200 and `force = true` to `/.netlify/functions/api/api/:splat`.
2. Only requests not matched by that rule fall through to the SPA rewrite.

The extra `/api/` segment in the target preserves the route prefix expected by Fastify. Therefore `/api/health`, `/api/ready`, catalogue, coverage, authentication, account/privacy, enquiry, and administrator APIs all use the same function bridge. The previous local Netlify function health smoke returned 200; deployed behavior remains unvalidated because no current site exists.

## SPA Routing

The final `/* -> /index.html` rewrite supports direct React Router links including `/packages/:slug`, `/coverage`, `/coverage/results`, `/login`, `/account/*`, and `/admin/*`. Because the API rewrite precedes the fallback, the SPA cannot swallow `/api/*` requests. The route tree and prior Phase 8.2B rendered evidence support deep-link compatibility; this phase did not repeat browser testing.

## Security Headers

Static Netlify responses receive:

- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(self)`
- `X-Frame-Options: DENY`

Fastify registers Helmet globally for API responses, providing API-side security headers including CSP, frame protection, content-type protection, referrer policy, and HSTS defaults. No dangerous repository-level conflict was identified, but protection is uneven: the Netlify static frontend has no configured Content-Security-Policy or Strict-Transport-Security header. Netlify HTTPS must be used; static CSP/HSTS policy remains a pre-deployment hardening item. Header behavior must be verified on the eventual deployed frontend and rewritten API responses.

## CORS

Production CORS is an exact comma-separated allowlist from `CORS_ORIGINS`, with credentials enabled. Requests without an `Origin` are allowed; browser origins not in the list receive 403. The final Netlify hostname and any custom canonical domain used by the browser must be explicitly represented. Same-origin browser requests still carry an origin on CORS-relevant API operations, so the canonical production origin must not be omitted.

Deploy Preview origins are unique and will not match a production-only allowlist. They require a deliberate preview policy rather than a wildcard credentialed origin.

## Authentication and Session Assumptions

- Session tokens are opaque, hashed in PostgreSQL, and sent in an HTTP-only host-only cookie.
- The CSRF token uses a readable host-only cookie and a matching request header.
- Both cookies use `SameSite=Strict`, path `/`, and `Secure` only when `NODE_ENV=production`.
- No cookie domain is set, which is appropriate for same-origin frontend/API operation and prevents sharing across unrelated preview/custom hosts.
- There is no session-signing secret: opaque token security relies on generated entropy, stored hashes, database integrity, HTTPS, and cookie controls.
- `NODE_ENV=production` is operationally required for secure cookies and production delivery behavior.
- `TRUST_PROXY=true` is required behind Netlify so request IP behavior used by logging, rate limiting, and Turnstile reflects the proxy topology.

The frontend defaults to `/api`; the Netlify rewrite therefore keeps frontend and API same-origin. `VITE_API_BASE_URL` is optional and should remain unset for this architecture.

## Environment-Variable Inventory

The authoritative name-only inventory is in `docs/PRODUCTION_ENVIRONMENT_MATRIX.md`.

Required for production function startup/behavior:

- `DATABASE_URL`
- `APP_DEPLOYMENT_CONTEXT=production`
- `DATABASE_DEPLOYMENT_CONTEXT=production`
- `PUBLIC_APP_URL`
- `CORS_ORIGINS`
- `NODE_ENV=production`
- `TRUST_PROXY=true`

Secret values are `DATABASE_URL`, `RESEND_API_KEY`, and, only when enabled, `BOT_PROTECTION_SECRET`. `DIRECT_URL` is a migration/release secret and is not required by the production function runtime. `APP_DEPLOYMENT_CONTEXT` and `DATABASE_DEPLOYMENT_CONTEXT` are non-secret but mandatory deployment labels. No analytics, `AUTH_SECRET`, or `CSRF_SECRET` variable is consumed by current code.

## Prisma Serverless Model

`server/db/client.ts` creates one `PrismaClient` with `PrismaPg` and caches it at module scope. That is appropriate for warm function reuse. Each cold function instance can still create its own PostgreSQL pool, so the runtime URL must use the Supabase transaction-mode pooler and connection capacity must be monitored under concurrency.

The production function imports generated Prisma Client and `@prisma/adapter-pg`; it does not import the Prisma CLI, `@prisma/config`, or `mysql2`. This remains aligned with Phase 8.2C.

## Supabase Connection Model

- Runtime: `DATABASE_URL` should be the IPv4-compatible transaction-mode pooler URL, including the required PgBouncer-compatible settings.
- Migrations: `DIRECT_URL` should use the session-mode pooler/direct migration connection and is read by `prisma.config.ts` before falling back to `DATABASE_URL`.
- Serverless concurrency: transaction pooling is the correct role for function requests, but each cold instance can own an adapter/pool. Actual plan connection limits and concurrency behavior are not validated in this audit.
- Browser exposure: neither database URL belongs in a `VITE_*` variable or frontend bundle.

## Migration Strategy

Ordinary Netlify deployment does not run migrations: `npm run build` invokes only Vite. This is desirable because arbitrary frontend/preview deploys must not mutate production schema.

The release runbook requires checked-in migrations to be applied with the migration connection before the exact release deploy. CI rehearses `prisma migrate deploy` against disposable PostgreSQL. The strategy is consistent, but no automated production migration job or operator evidence exists yet; execution remains a controlled release responsibility.

## Function Bundling

Fastify, Prisma Client, `@prisma/adapter-pg`, `pg`, and route/repository modules are reachable from the function entry and are resolved by server typechecking and direct execution of the TypeScript function entry. `argon2` is explicitly externalized because it includes native code. The generated Prisma client is now present before Netlify's function-bundling stage.

An esbuild dependency-trace bundle of the function entry completed. A platform-native `netlify build` could not start because this repository is not linked to a Netlify project; the CLI requested `netlify init`, `netlify deploy`, or `netlify link`, all explicitly outside Phase 8.3A-1. The real function handler nevertheless resolved and returned 200 for `/api/health` with a request ID under production-mode placeholder configuration. Deployed bundling remains unvalidated until an approved site-link phase.

## Health and Readiness Routing

- Liveness: deployed same-origin path `/api/health`; does not query the database.
- Readiness: deployed same-origin path `/api/ready`; performs `SELECT 1`, returning 200 when available and 503 when unavailable.

Both paths traverse the `/api/*` rewrite and the single Fastify function.

## Turnstile

`BOT_PROTECTION_SECRET` is optional. When absent, the server adapter is inert and registration, login, forgot-password, and enquiry routes rely on their existing rate limits. When present, those routes require `x-bot-token` and fail closed if verification is unavailable or unsuccessful.

No frontend code currently obtains or sends a Turnstile token. Setting the secret now would therefore block all protected public mutations. Operation without Turnstile is acceptable for a constrained portfolio demo with the limitation recorded; it is a commercial release blocker until client integration and production-origin validation exist.

## Transactional Email

Phase 8.3A-2 added a provider-neutral transactional email boundary, safe verification/reset templates, a deterministic development adapter, and a direct HTTPS Resend production adapter. Registration, password reset, verification resend, trusted-link generation, bounded provider timeout, and safe delivery logging are implemented at code level.

- Code-level blocker: **RESOLVED AT CODE LEVEL / EXTERNAL CONFIGURATION REQUIRED**.
- Portfolio/public-demo external blocker: YES if public account creation/recovery is in scope.
- Commercial-release external blocker: YES until a provider account, credential, verified sender/domain, and production configuration are validated.

Required names are `RESEND_API_KEY`, `EMAIL_FROM_ADDRESS`, optional `EMAIL_FROM_NAME`, and optional `EMAIL_PROVIDER_TIMEOUT_MS`. Missing provider configuration fails with `EMAIL_PROVIDER_NOT_CONFIGURED`; delivery failures are normalized without exposing vendor response bodies.

## Logging

Fastify/Pino structured logs write to function stdout/stderr and are compatible with Netlify function logs. UUID request IDs are generated, inbound `x-request-id` is supported, response envelopes/headers preserve the ID, and privileged audit records retain it where implemented.

Redaction covers authorization, cookies, set-cookie, password, token, and reset-token paths. Database URLs and environment objects are not logged by application code. Initialization errors produced by Netlify may still be platform-formatted; secret redaction must be confirmed in deployed failure testing.

## Preview-Environment Risk

**RESOLVED AT CODE/CONFIG LEVEL - ACCOUNT CONFIGURATION REQUIRED**

Production-mode startup now requires explicit matching application/database deployment labels. Preview and branch Functions fail closed before Prisma initialization unless they receive matching labels, an isolated non-production `DATABASE_URL`, and exact HTTPS origins. `/api/ready` returns a generic 503 for invalid configuration. A request-host/trusted-origin check also rejects preview requests carrying an inherited production `PUBLIC_APP_URL`. Preview/branch contexts cannot select the external email provider.

Netlify's automatic `CONTEXT` is build-only and is not available as a read-only Function variable. The account must therefore assign contextual Functions values to `APP_DEPLOYMENT_CONTEXT` and `DATABASE_DEPLOYMENT_CONTEXT`. Production credentials must be production-context/Functions-scoped; preview/branch APIs remain disabled until isolated credentials are deliberately supplied. No secrets or context values were added to `netlify.toml`.

## Dependency Drift Relevance

The live audit on 2026-09-30 reports 8 records: 5 high, 3 moderate, 0 critical.

| Record | Severity | Netlify classification | Evidence |
| --- | --- | --- | --- |
| `brace-expansion` | High | BUILD/DEVELOPMENT ONLY | Reached only through ESLint/minimatch; not in the frontend or function runtime graph |
| `fast-uri` | Moderate | NETLIFY RUNTIME RELEVANT | Runtime copies are reached through Fastify's AJV/fast-json-stringify stack; affected URL/mailto handling is not directly invoked by application code, but the package is in the function graph |
| `ip-address` | Moderate | NETLIFY RUNTIME RELEVANT | Reached through `@fastify/rate-limit`; request-IP handling is active in the function runtime |
| `moment` | Moderate | BUILD/DEVELOPMENT ONLY | Direct production declaration but no import exists, so Vite/esbuild does not include it in application bundles |

The four Prisma records retain their Phase 8.2C documented disposition. No newly published HIGH non-Prisma finding is runtime relevant or unknown with plausible production reachability, so the brief's dependency-specific Phase 8.3A trigger is not met. The two runtime-relevant moderate records still require the previously deferred dependency refresh; they are not treated as resolved.

## Vercel Audit

No `vercel.json`, `.vercel` metadata, Vercel serverless handler, Vercel package, or Vercel-specific production script is tracked. The only repository mention is historical audit evidence confirming absence. Netlify remains the sole configured target.

## Documentation Consistency

- `docs/NETLIFY_DEPLOYMENT.md` correctly describes build/publish/functions routing, same-origin API use, core runtime variables, and `DIRECT_URL` as migration-only.
- It does not record the missing Prisma generation step, Node pin, preview-context isolation, static CSP/HSTS gap, or unconfigured production email blocker.
- `ENVIRONMENT_VARIABLES.md` contains aspirational names not consumed by current code, including `API_BASE_URL`, `AUTH_SECRET`, provider, analytics, monitoring, rate-limit, and CSRF variables. The actual frontend name is `VITE_API_BASE_URL`.
- `docs/RELEASE_RUNBOOK.md` correctly separates migrations from deployment and already requires email/Turnstile blockers to be resolved or recorded.

## Deployment Blockers

Resolved in Phase 8.3A-1:

- Prisma clean-build generation: **RESOLVED**.
- Node 22 runtime pinning: **RESOLVED**.

Remaining blockers:

1. Transactional email is code complete, but the Resend account, API credential, verified sender/domain, and Netlify production configuration remain external blockers.
2. Preview/branch isolation is resolved at code/config level; Netlify contextual values and any isolated non-production database remain account-level work.
3. Final production origin values and account-level secret scopes are not configured or validated.
4. A platform-native Netlify build/deploy remains unvalidated because no project is linked.

Static CSP/HSTS coverage and Turnstile client integration are required hardening/commercial gates, but they do not independently prevent a deliberately constrained portfolio deployment once the blockers above are resolved and limitations are explicit.

## Recommended Next Phase

**Phase 8.4 - Production Infrastructure and External Configuration Plan**

Do not proceed to deployment. Production origins, account-level contextual values/secrets, Resend external configuration, and linked-site validation remain unresolved.

## Platform References

- Netlify function bundling and Node runtime: https://docs.netlify.com/build/functions/configuration/
- Netlify deploy contexts: https://docs.netlify.com/deploy/deploy-overview/
- Netlify context-specific environment variables: https://docs.netlify.com/build/environment-variables/overview/
