# WP8 Phase 8.3A-2 Transactional Email Production Foundation

Date: 2026-10-01

Status: PASS - code complete; external provider configuration required

## Prior State

Authentication used an `AuthDelivery` interface with a no-op development implementation and an intentionally unconfigured production implementation. Production registration, forgot-password, and verification resend could not deliver email. No provider, template, timeout, sender configuration, or functional verification page existed.

## Workflow Audit

### Release Critical

- Registration email verification: token creation and API consumption existed; production delivery did not.
- Verification resend: token replacement/delivery path existed; production delivery did not.
- Forgot/reset password: secure token creation, one-hour expiry, single-use consumption, password replacement, and session revocation existed; production delivery did not.

### Important but Non-Blocking for Initial Portfolio Release

- Enquiry acknowledgement
- Enquiry status-change email
- Business lead acknowledgement
- Support acknowledgement

Those workflows have database/UI behavior but no current transactional email dispatch. They were deliberately not added in this authentication-critical phase. Notification preferences remain separate data and do not subscribe recipients to marketing lists.

## Provider Abstraction

`TransactionalEmailProvider.send(message)` accepts a canonical server-created message containing recipient, subject, text, HTML, template type, and safe request metadata. It returns one of:

- `SENT`
- `FAILED` with a normalized reason
- `NOT_CONFIGURED`

Application routes never accept arbitrary email HTML, sender details, subjects, or template identifiers from clients.

## Selected Production Provider

Resend was selected because its transactional API is a single HTTPS request, supports verified sender domains, and works with Node 22 serverless functions without a persistent process or filesystem. The integration uses built-in `fetch`; no SDK or dependency was added.

The adapter posts to `https://api.resend.com/emails` with bearer authorization, sender, recipient, subject, text, HTML, and a non-sensitive email-type tag. Provider 4xx/5xx responses, malformed success payloads, network failures, and timeouts are normalized. Provider bodies and credentials are never returned to clients.

## Development Adapter

`DevelopmentEmailProvider` performs no external delivery. It captures cloned canonical messages in memory and returns deterministic identifiers. Automated tests can inspect generated links without logs or real recipients.

Development API responses retain the existing development-only token fields needed by the current local/database test workflow. Production responses never include verification or reset tokens.

## Templates and Links

Two concise text/HTML templates exist:

- `VERIFY_EMAIL`: FibreConnect identity, verification purpose, 24-hour link, and ignore guidance.
- `RESET_PASSWORD`: FibreConnect identity, reset purpose, one-hour single-use link, and unsolicited-request guidance.

Security links are built only from validated `PUBLIC_APP_URL`. Production requires HTTPS and rejects URLs containing credentials. Request `Host`, `Origin`, user input, and redirect parameters cannot select the email-link origin. URL encoding plus HTML escaping prevents token markup injection.

The frontend now exposes `/verify-email?token=...`, which consumes the existing verification API and presents verified/invalid states. The existing `/reset-password?token=...` path remains the reset target.

## Authentication Integration

- Registration checks provider configuration before account creation, issues a 24-hour hashed token, sends through the provider boundary, and returns no token in production.
- Forgot-password checks provider configuration before account lookup. Unknown, disabled, and existing accounts retain the same public `{ accepted: true }` response. Runtime delivery failure is logged internally but does not disclose account existence.
- Reset consumes the existing hashed, expiring, single-use token and revokes sessions.
- Verification resend is authenticated/CSRF-protected, issues a new token, and reports controlled delivery failure.
- Missing production configuration returns `EMAIL_PROVIDER_NOT_CONFIGURED`; synchronous delivery failure returns `EMAIL_DELIVERY_FAILED` where disclosure does not create account enumeration.

No schema or migration change was required. Raw tokens remain ephemeral and only token hashes are persisted.

## Security, Logging, and Privacy

- Provider calls have an explicit timeout, defaulting to 8 seconds.
- There are no synchronous retries; queue/retry infrastructure remains future operational work.
- Logs contain only email type, normalized result/reason, and request ID.
- Logs exclude recipient, token, full URL, subject/body, API key, and provider response body.
- Fastify request redaction continues to cover password and token fields.
- Transactional delivery does not inspect or modify marketing consent and does not add recipients to lists.

## Environment Variables

- `RESEND_API_KEY`: required secret for production delivery.
- `EMAIL_FROM_ADDRESS`: required verified sender address.
- `EMAIL_FROM_NAME`: optional, defaults to `FibreConnect SA`.
- `EMAIL_PROVIDER_TIMEOUT_MS`: optional, defaults to 8000 and is bounded from 1000 to 20000.
- `PUBLIC_APP_URL`: existing trusted link origin; HTTPS required in production.

All are server runtime values. Only placeholders were added to `.env.example`. Real credentials must be function-scoped and production-context-specific in Netlify.

## Tests

Focused tests cover:

- verification/reset message construction;
- trusted base URL and production HTTPS validation;
- HTML escaping;
- deterministic development capture;
- missing production configuration;
- Resend success, rejection, malformed response, network failure, and timeout;
- token/body/recipient exclusion from logs;
- controlled production API error when configuration is missing;
- production response token exclusion and account-enumeration behavior in the PostgreSQL integration path;
- existing expiry/single-use reset behavior.

Actual validation completed on 2026-10-01:

- Focused email/environment/API tests: PASS - 3 files, 24 tests.
- Full `npm run validate`: PASS - Prisma validation/generation, ESLint, frontend/server TypeScript, 7 files with 55 tests, and the production Vite build.
- Total non-overlapping automated tests: PASS - 63 tests (55 standard-suite tests plus 8 PostgreSQL integration tests).
- Production build: PASS - 1,756 modules transformed. The existing chunk-size warning remains deferred performance work.
- PostgreSQL integration suite: PASS - 1 file, 8 tests. The first sandboxed attempt was blocked by local `EACCES` database access; the approved unrestricted rerun completed successfully without an application assertion failure.
- Netlify function import smoke: PASS - the production-mode function entrypoint imported the application/email adapter and returned `200` from `/api/health` using non-production dummy configuration.
- Dependency manifests, Prisma schema/migrations, and `netlify.toml`: unchanged.
- The PostgreSQL driver emitted its existing SSL compatibility deprecation warning; no database or connection configuration was changed in this phase.

## External Blockers

**PRODUCTION EMAIL PROVIDER CREDENTIALS / DOMAIN VERIFICATION - EXTERNAL BLOCKER**

Required human/account work:

1. Create or approve the Resend account.
2. Verify the sending domain and sender address through DNS.
3. Create a least-privilege production API key.
4. Configure production/function-scoped Netlify variables.
5. Send to an explicitly approved test recipient and validate delivery, links, logs, and provider status.

No account, DNS, credential, real recipient, or external email was used in this phase.

## Transactional Email Blocker

**CODE COMPLETE - EXTERNAL CONFIGURATION REQUIRED**

## Recommended Next Phase

**Phase 8.3A-3 - Netlify Environment and Preview Isolation**

Do not configure or deploy Netlify without explicit approval.
