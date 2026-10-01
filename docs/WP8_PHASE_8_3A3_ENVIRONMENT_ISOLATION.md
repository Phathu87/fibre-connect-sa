# WP8 Phase 8.3A-3 Netlify Environment and Preview Isolation

Date: 2026-10-01

Status: PASS - repository safeguards complete; account-level contextual values remain external configuration

## Deployment Contexts

FibreConnect distinguishes application deployment context from build optimization. `NODE_ENV=production` controls optimized/server security behavior but does not identify whether a Netlify deploy is production, preview, or branch.

Runtime classification uses `APP_DEPLOYMENT_CONTEXT`: `local`, `test`, `preview`, `branch`, or `production`. Netlify's automatic `CONTEXT` remains useful during builds but is not one of the read-only variables available to Functions. Therefore, Netlify account configuration must give `APP_DEPLOYMENT_CONTEXT` a context-specific Functions value.

## Selected Database Policy

Policy B is selected: preview and branch APIs are disabled unless an isolated non-production database is explicitly configured.

- Production requires `DATABASE_DEPLOYMENT_CONTEXT=production` and the production-context `DATABASE_URL`.
- Preview requires `APP_DEPLOYMENT_CONTEXT=preview`, `DATABASE_DEPLOYMENT_CONTEXT=preview`, and an isolated preview `DATABASE_URL`.
- Branch requires matching `branch` values and an isolated branch/staging `DATABASE_URL`.
- Missing or mismatched labels fail environment validation before Prisma initializes. The Function returns a generic 503 without printing configuration values.
- `DIRECT_URL` remains migration/release-tooling only and is never read by ordinary request runtime.

This explicit label does not inspect or guess database identity from a secret. Netlify context scoping remains mandatory. A second safeguard compares an incoming Function request host with the trusted `PUBLIC_APP_URL` host. A preview request carrying inherited production origin configuration is rejected; request headers never construct security links or select an origin.

## Origins and CORS

`PUBLIC_APP_URL` must be an HTTP/HTTPS origin with no credentials, path, query, or fragment. Production, preview, and branch require HTTPS. Verification and reset links continue to derive only from this trusted value.

`CORS_ORIGINS` accepts comma-separated exact HTTP/HTTPS origins. Wildcards, credentials, paths, malformed URLs, and non-HTTPS deployed origins are rejected. Credentialed CORS never uses `*`. Preview/branch APIs require their own exact origin.

The browser continues to default to same-origin `/api`; `VITE_API_BASE_URL` should remain unset on Netlify.

## Cookies

Netlify production, preview, and branch Functions run with `NODE_ENV=production`, retaining `Secure`, `SameSite=Strict`, and HTTP-only session cookies. CSRF cookies remain readable only for the double-submit header flow. No cookie `Domain` is set, so cookies are host-only and cannot be scoped to a future production domain or shared with preview hosts.

## External Services

Production selects Resend only when `APP_DEPLOYMENT_CONTEXT=production`. Preview and branch contexts always select the unconfigured provider even if email credentials are accidentally inherited; registration and other email-dependent operations fail honestly instead of sending customer-facing mail.

`BOT_PROTECTION_SECRET` remains optional. Production activation requires the still-unimplemented frontend Turnstile token flow. Preview and branch contexts must not receive the production secret; this phase did not implement Turnstile UI.

## Logging

- Local development: `info` by default; `debug` may be selected deliberately.
- CI: `silent` where already configured.
- Preview/branch/production: `info` default with existing authorization, cookie, password, and token redaction.

No environment values are logged. Configuration failures expose field names only.

## Netlify Variable Scopes

Production-only Functions secrets: `DATABASE_URL`, `RESEND_API_KEY`, and optional `BOT_PROTECTION_SECRET`.

Production-only Functions configuration: `APP_DEPLOYMENT_CONTEXT=production`, `DATABASE_DEPLOYMENT_CONTEXT=production`, `PUBLIC_APP_URL`, `CORS_ORIGINS`, sender configuration, `NODE_ENV=production`, and `TRUST_PROXY=true`.

Preview/branch-specific Functions configuration: matching application/database labels, exact HTTPS origins, and isolated database credentials. Resend and production Turnstile credentials remain absent.

Shared non-secret configuration may include cookie name/TTL, email display name/timeout, and log level. Build-only configuration is Node 22 and optional `VITE_API_BASE_URL`; the latter remains unset for same-origin routing.

`netlify.toml` was not changed. Netlify documents that file-defined environment values are unavailable to Functions, and secrets do not belong in repository configuration.

## Safeguards and Tests

Focused tests cover valid production configuration, missing production database, preview missing/mismatched database labels, branch mismatch, wildcard/non-origin CORS rejection, HTTPS trusted origins, safe preview email behavior, controlled `/api/ready` failure, request-host mismatch, and secret omission from responses.

The PostgreSQL integration suite verifies production cookies are Secure, SameSite Strict, and host-only.

Actual validation completed on 2026-10-01:

- Focused environment/API/email/function tests: PASS - 4 files, 32 tests.
- Full `npm run validate`: PASS - Prisma validation/generation, ESLint, frontend/server TypeScript, 8 files with 63 tests, and production build.
- PostgreSQL integration: PASS - 1 file, 8 tests, including cookie attributes.
- Total non-overlapping automated tests: PASS - 71 tests (63 standard plus 8 PostgreSQL integration).
- Production build: PASS - 1,756 modules transformed. The existing chunk-size warning remains deferred.
- Netlify Function smoke: PASS - production-mode `/api/health` returned 200 through the real handler with safe dummy configuration.
- `/api/ready` unsafe-preview behavior: PASS - controlled 503 with no URL or credential disclosure.
- Existing PostgreSQL driver deprecation warning remains deferred; no database configuration was changed.

## Remaining External Configuration

- Create/link the Netlify project in an approved later phase.
- Enter context-specific Functions variables and secrets in the Netlify account.
- Supply final production and preview/branch origin values.
- Provision a dedicated non-production database before enabling preview/branch APIs; otherwise leave those APIs blocked.
- Complete Resend account/API key/domain verification for production only.

## Platform References

- Netlify build variables and automatic `CONTEXT`: https://docs.netlify.com/build/configure-builds/environment-variables/
- Netlify Function runtime variables and Functions scope: https://docs.netlify.com/build/functions/environment-variables/
- Netlify deploy contexts: https://docs.netlify.com/deploy/deploy-overview/
