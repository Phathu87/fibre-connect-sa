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

`netlify.toml` configures `npm run build`. That command runs only `vite build`, which is the correct frontend production compiler but is insufficient for the complete Netlify application in a clean checkout.

The generated Prisma client is written to `src/generated/prisma`, is ignored by Git, and is not tracked. No `prebuild`, `postinstall`, or other lifecycle script runs `prisma generate`. The Fastify runtime imports `src/generated/prisma/client.js`, so a clean Netlify build has no guaranteed generated client for function bundling. This is a deployment blocker.

The repository also has no `engines.node`, `.nvmrc`, `.node-version`, or `NODE_VERSION` setting. CI uses Node 22, while the Netlify build/runtime version is not pinned. Netlify documents that a function's default Node runtime follows the build Node version. Pinning the validated major is required before deployment.

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
- `PUBLIC_APP_URL`
- `CORS_ORIGINS`
- `NODE_ENV=production`
- `TRUST_PROXY=true`

Secret values are `DATABASE_URL` and, only when enabled, `BOT_PROTECTION_SECRET`. `DIRECT_URL` is a migration/release secret and is not required by the production function runtime. No email-provider, analytics, `AUTH_SECRET`, or `CSRF_SECRET` variable is consumed by current code. The broader `ENVIRONMENT_VARIABLES.md` list is aspirational and stale where it implies those names are implemented.

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

Fastify, Prisma Client, `@prisma/adapter-pg`, `pg`, and route/repository modules are reachable from the function entry and should be traced by esbuild. `argon2` is explicitly externalized because it includes native code. The critical unresolved bundling issue is not package tracing but the absent generated Prisma client in a clean checkout.

The repository has not pinned the Netlify build/runtime Node version and has no clean Netlify bundle artifact from the current baseline. Both require Phase 8.3A validation.

## Health and Readiness Routing

- Liveness: deployed same-origin path `/api/health`; does not query the database.
- Readiness: deployed same-origin path `/api/ready`; performs `SELECT 1`, returning 200 when available and 503 when unavailable.

Both paths traverse the `/api/*` rewrite and the single Fastify function.

## Turnstile

`BOT_PROTECTION_SECRET` is optional. When absent, the server adapter is inert and registration, login, forgot-password, and enquiry routes rely on their existing rate limits. When present, those routes require `x-bot-token` and fail closed if verification is unavailable or unsuccessful.

No frontend code currently obtains or sends a Turnstile token. Setting the secret now would therefore block all protected public mutations. Operation without Turnstile is acceptable for a constrained portfolio demo with the limitation recorded; it is a commercial release blocker until client integration and production-origin validation exist.

## Transactional Email

Current production mode is intentionally unconfigured. Under `NODE_ENV=production`, registration, forgot-password, and resend-verification call `requireDelivery()` and return 503 before delivery work because `UnconfiguredProductionAuthDelivery.configured` is false. Login for an existing verified account can still work.

- Portfolio/public-demo blocker: YES if public account creation/recovery is in scope, as it is in the current UI and routes.
- Commercial-release blocker: YES.

No implemented provider or environment-variable name exists, so this cannot be solved by adding a Netlify secret alone.

## Logging

Fastify/Pino structured logs write to function stdout/stderr and are compatible with Netlify function logs. UUID request IDs are generated, inbound `x-request-id` is supported, response envelopes/headers preserve the ID, and privileged audit records retain it where implemented.

Redaction covers authorization, cookies, set-cookie, password, token, and reset-token paths. Database URLs and environment objects are not logged by application code. Initialization errors produced by Netlify may still be platform-formatted; secret redaction must be confirmed in deployed failure testing.

## Preview-Environment Risk

`netlify.toml` defines no deploy-context overrides. If Netlify variables are configured globally, Deploy Previews and branch deploys can inherit the production `DATABASE_URL` and function secrets. Preview code could then read or mutate production data, while preview origins would also fail the production CORS allowlist.

Netlify supports context-specific values and scopes. Production database credentials must be production-context/function-scoped; previews should be disabled for backend execution, receive isolated non-production credentials, or fail closed without database secrets. This account-level policy is a deployment blocker until explicitly configured and verified.

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

1. A clean Netlify build does not generate the ignored Prisma client required by the function bundle.
2. Production transactional email is unimplemented, so public registration and recovery routes return 503.
3. Netlify build/function Node version is unpinned despite CI validating Node 22.
4. Preview/branch environment isolation is undefined and could expose the production database to preview code.
5. Final production origin values and account-level secret scopes are not configured or validated.

Static CSP/HSTS coverage and Turnstile client integration are required hardening/commercial gates, but they do not independently prevent a deliberately constrained portfolio deployment once the blockers above are resolved and limitations are explicit.

## Recommended Next Phase

**Phase 8.3A - Netlify Build and Runtime Blocker Remediation**

That phase should guarantee Prisma generation in clean builds, pin the validated Node runtime, implement or deliberately scope production auth email behavior, define preview isolation, align deployment documentation, and validate a local Netlify production-context bundle. It must not deploy or configure account secrets without separate approval.

Do not proceed to deployment. After 8.3A, return to the Stage 8 gate before Phase 8.4.

## Platform References

- Netlify function bundling and Node runtime: https://docs.netlify.com/build/functions/configuration/
- Netlify deploy contexts: https://docs.netlify.com/deploy/deploy-overview/
- Netlify context-specific environment variables: https://docs.netlify.com/build/environment-variables/overview/
