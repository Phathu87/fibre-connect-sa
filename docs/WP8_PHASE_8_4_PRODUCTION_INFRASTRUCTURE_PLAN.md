# WP8 Phase 8.4 Production Infrastructure and External Configuration Plan

Date: 2026-10-01

Status: PASS - planning complete; no external action performed

Release classification: **PUBLIC DEMO**

## Decision Summary

The current local `main` HEAD, `f09a6d0bb00ceab1655f7029f08bfb91df1c1996`, should become the candidate baseline before Netlify linking, but only after all 14 local commits are pushed and mandatory GitHub CI passes on that exact SHA. This preserves one reviewed source of truth for Netlify and prevents linking against the stale remote baseline.

The first release must remain a public portfolio demo. Catalogue and coverage data are deterministic demo data, live coverage-provider integration is absent, enquiries are retained internally, and dependency acceptance is limited to portfolio use.

## External Systems

| System | Required role | Owner/action |
| --- | --- | --- |
| GitHub | Canonical source, CI checkpoint, release commit | Human authorizes push; Codex may execute and record evidence |
| Netlify | Vite hosting, redirects, Fastify Function, logs, immutable deploy rollback | Human owns team/project/billing and secrets; approved connected tool may assist |
| Supabase | Separate PostgreSQL environments, backups, advisors, pooled runtime and migration connections | Human creates projects and controls credentials; Codex must not handle displayed secrets |
| Resend | Production verification/reset delivery | Human owns account/domain/key; connected tool may assist only with explicit approval |
| DNS/domain provider | Netlify domain routing and Resend sender authentication | Human approves domain and publishes provider-issued records |

## 1. GitHub Checkpoint

1. Confirm `main`, clean working tree, HEAD `f09a6d0...`, and the 14 commits ahead of `origin/main`.
2. Inspect `git log origin/main..main`, the cumulative diff, and secret scan.
3. Push `main` only after explicit authorization. Do not force-push.
4. Wait for the GitHub Actions workflow on the resulting HEAD.
5. Require `Validate application`, `PostgreSQL integration`, and `Dependency critical gate` to pass.
6. Record repository, branch, full SHA, workflow run URL/number, completion time, and job results.
7. If HEAD changes or any mandatory job fails, do not link Netlify; repair through a separately approved phase and repeat the checkpoint.

Recommended push point: **YES - current HEAD after this documentation commit**, followed by exact-SHA CI verification.

## 2. Supabase Topology

| Environment | Recommendation | Data and access policy |
| --- | --- | --- |
| Development | Keep existing `fibreconnect-sa-dev`; never promote its credentials to production | Developer/testing data, local migration work, no public traffic |
| Preview/staging | Initially none; previews remain fail-closed. Create a separate project before enabling API-backed previews | Synthetic/demo data only; preview/branch credentials only; never production customer data |
| Portfolio production | Create a separate FibreConnect production project | Demo catalogue plus public-demo user/enquiry data; production-only credentials, backup policy, advisors, monitoring |

Development and production must never share a project, password, pooler URL, migration connection, or backup lifecycle. A staging project is recommended before recurring API-enabled previews; it is not required while previews remain frontend-only/fail-closed.

### Controlled Production Migration

1. Human creates the production Supabase project in the intended region and enables account MFA.
2. Confirm plan, backup availability, recovery expectations, SSL, network controls, and connection limits.
3. Capture an approved restorable checkpoint before schema changes.
4. Obtain the session/direct migration URL for `DIRECT_URL` and transaction-mode pooled runtime URL for `DATABASE_URL`; never record either in source or chat output.
5. From the exact CI-green release commit, run `prisma migrate deploy` through the controlled migration environment, never `db push` or reset.
6. Verify `_prisma_migrations`, expected tables, extensions/prerequisites, and migration success.
7. Verify checked-in RLS enablement on all public/application tables and run Supabase Security Advisor and Performance Advisor. Record findings; do not manufacture passing evidence.
8. Seed only approved demo catalogue data.
9. Verify catalogue mode remains `demo` and `liveProviderData=false`.
10. Exercise `/api/ready` with the pooled runtime connection and monitor connections/errors.
11. Record project identity, migration ledger, backup state, advisor results, operator, and time without recording credentials.

### Seed Policy

**SAFE DEMO DATA**

- `catalogue_mode={mode: demo, liveProviderData: false}`.
- Existing provider/network records whose descriptions explicitly say demo/development.
- `demo-*` packages explicitly labelled as non-live commercial offers.
- `source=DEMO` coverage areas and their package availability mappings.

**DEVELOPMENT ONLY**

- Integration-test users, temporary administrators, generated enquiry records, test sessions/tokens, and test audit events.
- Any local diagnostics or browser-test records not created by the production seed.

**DO NOT SEED**

- Real customer identities, addresses, consent, enquiries, credentials, sessions, or tokens.
- Fabricated staff/provider accounts, production administrator passwords, secrets, live prices, or unverified live coverage claims.
- Development database exports or copied production-like personal data.

## 3. Netlify Site Plan

Human account actions:

1. Import the existing GitHub repository `Phathu87/fibre-connect-sa` into the correct Netlify team.
2. Use production branch `main` at the recorded CI-green candidate SHA.
3. Confirm build command `npm run build`, publish directory `dist`, Functions directory `netlify/functions`, and Node `22` from repository configuration.
4. Keep the same-origin `/api` rewrite and SPA fallback from `netlify.toml`.
5. Initially disable branch deploys.
6. Deploy Previews may remain enabled for frontend review, but their API must remain fail-closed until an isolated preview database and context-specific variables exist.
7. Keep automatic production publishing stopped/locked during initial configuration and smoke validation where the Netlify plan permits it. Do not advertise the temporary URL.
8. Do not add a custom domain until the temporary Netlify URL passes platform-native validation.
9. Enable automatic production publishing only after the initial release is approved, branch protection is active, and Netlify deploys the same GitHub CI-green `main` commit. A later policy change must preserve the mandatory CI gate.

### Production Variables

| Variable | Scope | Secret | Source | Required | Purpose |
| --- | --- | --- | --- | --- | --- |
| `NODE_ENV` | Functions | No | Approved constant | Yes | Production runtime/cookies |
| `APP_DEPLOYMENT_CONTEXT` | Functions, production context | No | Approved constant | Yes | Select production behavior |
| `DATABASE_DEPLOYMENT_CONTEXT` | Functions, production context | No | Approved constant | Yes | Bind DB label to production |
| `DATABASE_URL` | Functions, production context | Yes | Production Supabase pooler | Yes | Request runtime database |
| `PUBLIC_APP_URL` | Functions, production context | No | Current canonical HTTPS origin | Yes | Trusted links and host validation |
| `CORS_ORIGINS` | Functions, production context | No | Approved exact origin list | Yes | Credentialed browser access |
| `TRUST_PROXY` | Functions, production context | No | Approved constant | Yes | Netlify proxy/IP behavior |
| `LOG_LEVEL` | Functions, production context | No | Release decision | Optional | Operational logs |
| `SESSION_COOKIE_NAME` | Functions, production context | No | Repository default/decision | Optional | Session cookie name |
| `SESSION_TTL_HOURS` | Functions, production context | No | Security decision | Optional | Session lifetime |
| `RESEND_API_KEY` | Functions, production context | Yes | Resend sending-only key | Yes for auth flows | Transactional email |
| `EMAIL_FROM_ADDRESS` | Functions, production context | No | Verified Resend domain | Yes for auth flows | Sender identity |
| `EMAIL_FROM_NAME` | Functions, production context | No | Brand decision | Optional | Sender display name |
| `EMAIL_PROVIDER_TIMEOUT_MS` | Functions, production context | No | Repository default/decision | Optional | Provider timeout |
| `BOT_PROTECTION_SECRET` | Functions, production context | Yes | Turnstile account | No until frontend exists | Must remain absent now |
| `VITE_API_BASE_URL` | Builds | No | Leave unset | No | Defaults safely to `/api` |

`DIRECT_URL` is not a Netlify Function variable. Keep it only in controlled migration/release tooling.

### Deploy Preview Variables

| Variable | Scope | Secret | Source | Required | Purpose |
| --- | --- | --- | --- | --- | --- |
| `NODE_ENV` | Functions | No | Approved constant | Yes | Secure deployed runtime |
| `APP_DEPLOYMENT_CONTEXT` | Functions, Deploy Previews | No | Contextual value | Yes for API | Preview classification |
| `DATABASE_DEPLOYMENT_CONTEXT` | Functions, Deploy Previews | No | Contextual value | Yes for API | Preview DB guard |
| `DATABASE_URL` | Functions, Deploy Previews | Yes | Isolated preview/staging project | Yes for API; otherwise absent | Non-production data only |
| `PUBLIC_APP_URL` | Functions, Deploy Previews | No | Exact stable approved preview origin | Yes for API | Trusted host/origin |
| `CORS_ORIGINS` | Functions, Deploy Previews | No | Same exact preview origin | Yes for API | Credentialed CORS |
| `TRUST_PROXY` | Functions, Deploy Previews | No | Approved constant | Yes for API | Proxy behavior |
| `LOG_LEVEL` | Functions, Deploy Previews | No | Release decision | Optional | Preview logs |
| `RESEND_API_KEY` | Functions | Yes | None | No; must be absent | Prevent external email |
| `BOT_PROTECTION_SECRET` | Functions | Yes | None | No; must be absent | Frontend integration incomplete |
| `VITE_API_BASE_URL` | Builds | No | Leave unset | No | Same-origin `/api` |

Initial policy: do not configure the API-required preview variables. The static frontend may render, while API/readiness requests fail honestly with 503.

### Branch Variables

| Variable | Scope | Secret | Source | Required | Purpose |
| --- | --- | --- | --- | --- | --- |
| `NODE_ENV` | Functions | No | Approved constant | Yes | Secure deployed runtime |
| `APP_DEPLOYMENT_CONTEXT` | Functions, branch context | No | Contextual value | Yes for API | Branch classification |
| `DATABASE_DEPLOYMENT_CONTEXT` | Functions, branch context | No | Contextual value | Yes for API | Branch DB guard |
| `DATABASE_URL` | Functions, branch context | Yes | Isolated branch/staging project | Yes for API; otherwise absent | Non-production data only |
| `PUBLIC_APP_URL` | Functions, branch context | No | Exact approved branch origin | Yes for API | Trusted host/origin |
| `CORS_ORIGINS` | Functions, branch context | No | Same exact branch origin | Yes for API | Credentialed CORS |
| `TRUST_PROXY` | Functions, branch context | No | Approved constant | Yes for API | Proxy behavior |
| `LOG_LEVEL` | Functions, branch context | No | Release decision | Optional | Branch logs |
| `RESEND_API_KEY` | Functions | Yes | None | No; must be absent | Prevent external email |
| `BOT_PROTECTION_SECRET` | Functions | Yes | None | No; must be absent | Frontend integration incomplete |
| `VITE_API_BASE_URL` | Builds | No | Leave unset | No | Same-origin `/api` |

Initially disable branch deploys, so no branch secrets should exist. If branch deploys are later enabled, all API variables must be supplied together from an isolated environment; partial or inherited production configuration is prohibited.

All database, Resend, and Turnstile credentials are Functions-only and server-only. `DATABASE_URL`, `DIRECT_URL`, `RESEND_API_KEY`, and `BOT_PROTECTION_SECRET` must never use a `VITE_` prefix or build/frontend scope. Only non-secret build controls such as Node version and optional `VITE_API_BASE_URL` may be build-visible.

## 4. Resend Plan

1. Human creates or accesses the production Resend account/team and enables appropriate account security.
2. Add the chosen sending domain after the domain strategy is approved.
3. Copy the exact DKIM/SPF/MX/verification records shown by Resend into the DNS provider; do not guess record names or values.
4. Wait for sending capability to be verified in Resend.
5. Create a sending-access API key restricted to the verified domain where available; record it once in the Netlify production Functions context only.
6. Select a role sender such as a no-reply/security address under the verified domain; configure its address and display name.
7. With an explicitly approved test recipient, validate registration verification, resend, password reset, expiry/single-use behavior, links, provider result, and redacted logs.
8. Rotate/delete any temporary key after suspected exposure or failed custody.

Before custom-domain verification, Resend's documented `resend.dev` test recipients can simulate delivered, bounced, and complained events without affecting domain reputation. Use them only for controlled provider-boundary testing. They do not validate real inbox delivery, branded sender identity, DNS authentication, or production readiness.

## 5. Domain and DNS Plan

Safest sequence:

1. Validate the temporary Netlify `*.netlify.app` production URL privately/unadvertised.
2. Decide between a dedicated FibreConnect domain and a subdomain of an existing owned domain. A controlled subdomain is lower-risk when ownership already exists; a dedicated domain is clearer if FibreConnect becomes independent.
3. Add the chosen custom domain to Netlify before publishing DNS records.
4. Add only the exact Netlify-provided CNAME/ALIAS/ANAME/flattened-CNAME/A records applicable to the DNS provider and apex/subdomain choice.
5. Add only Resend-issued sender-authentication records. Netlify routing records and Resend mail-authentication records have separate purposes and must coexist without overwriting unrelated SPF/DKIM/MX data.
6. Wait for DNS/HTTPS/domain verification, then switch canonical configuration in one controlled window.

Do not choose or purchase a domain in this phase. Provider dashboards are authoritative for exact DNS values.

### Canonical URL Transition

When moving from the temporary Netlify URL to the final domain:

1. Add/verify the domain and HTTPS in Netlify first.
2. Update production `PUBLIC_APP_URL` and ensure the same final origin is present in `CORS_ORIGINS`.
3. Redeploy because Function environment changes apply at deployment time.
4. Retest verification/reset links; old links retain their old host and should not be assumed valid after transition.
5. Confirm host-only cookies are newly issued on the final host and are not shared from the Netlify host.
6. Update canonical/OG/sitemap/robots values as required by the current static placeholder workflow.
7. Redirect the non-canonical host to the canonical host and verify no redirect loop.
8. If OAuth is added later, register the final callback origin separately; no OAuth configuration exists now.

## 6. Secret Entry Order

1. Keep production auto-publishing stopped and public promotion absent.
2. Create and migrate the dedicated production database; verify backup/advisor/RLS evidence.
3. Enter `APP_DEPLOYMENT_CONTEXT` and `DATABASE_DEPLOYMENT_CONTEXT` for production Functions.
4. Enter production `DATABASE_URL` in production Functions scope only.
5. Enter `NODE_ENV`, `TRUST_PROXY`, logging, and session settings.
6. Set the temporary Netlify HTTPS origin in both `PUBLIC_APP_URL` and `CORS_ORIGINS`.
7. Run platform-native build/function/readiness validation before email credentials.
8. Verify Resend domain, then enter sender settings and production-only `RESEND_API_KEY`.
9. Keep `BOT_PROTECTION_SECRET` absent until a separately approved frontend integration.
10. Trigger a fresh deploy so the scoped values are captured, then run controlled smoke tests before publishing.

## 7. Platform-Native Validation and First Deploy

Recommended first hosted deployment: **an unadvertised production-context deployment on the temporary Netlify URL, with automatic publishing locked/stopped during validation and no custom domain or customer traffic**. Preview APIs remain fail-closed and branch deploys disabled.

Validation sequence after linking:

1. Run platform-native `netlify build` against the exact candidate commit and record command/result.
2. Confirm build command, publish directory, Function bundle, Node 22, redirects, and no secret values in logs/artifacts.
3. Deploy the exact candidate to the temporary Netlify URL under controlled access/publishing state.
4. Verify `/api/health` returns 200 and `/api/ready` returns 200 only after production DB configuration.
5. Verify `/api/*` reaches Fastify and an unknown API route remains JSON 404 rather than SPA HTML.
6. Refresh a React deep link such as `/packages/<demo-slug>` and verify SPA fallback.
7. Confirm required server variables are available to Functions and absent from the browser bundle.
8. Confirm there is no production customer traffic and no search/public promotion before release approval.

## 8. Production Smoke Plan

Use dedicated demo identities and remove them where safe:

1. `/`, `/packages`, one demo package detail, and `/coverage` render with explicit demo limitations.
2. `/login`, `/api/health`, and `/api/ready` behave correctly.
3. Register a dedicated test user; confirm production response contains no token.
4. Receive and consume verification email once; verify expiry/resend handling as feasible.
5. Login, view account, save/compare a package, and confirm Secure host-only cookies.
6. Submit one clearly marked test enquiry and verify it appears only in FibreConnect's internal admin workflow.
7. Verify anonymous/non-admin access is denied for admin routes.
8. With a controlled administrator, verify enquiry access/update and audit evidence without changing real data.
9. Export the test account's data and inspect scope.
10. Delete the disposable account only after preserving required smoke evidence; verify sessions are revoked.
11. Check Netlify/Resend/Supabase logs for request IDs, unexpected 5xx, connection pressure, secret/PII leakage, and email failures.
12. Observe the deployment for the agreed window before advertising the URL.

## 9. Rollback Gate

Use `docs/RELEASE_RUNBOOK.md`. Immediately stop promotion and rollback for:

- failed health/readiness, sustained 5xx, broken API rewrite, blank frontend, or broken critical routes;
- authentication, verification/reset, cookie, CSRF, RBAC, privacy, or admin-denial failure;
- wrong database/project/context, production data visible in preview, migration mismatch, corruption, or uncontrolled writes;
- secret/token/PII disclosure in frontend, response, logs, or repository;
- materially incorrect demo/live claims or enquiry behavior;
- email sent from an unverified/wrong sender or to unintended recipients.

Use the previous immutable Netlify deploy only if schema-compatible. Database migrations are forward-only by default. If incompatible, stop writes, restore the approved database checkpoint, and redeploy the matching commit. Never run a destructive Prisma reset against production.

## 10. Public Claims and Residual Risk

**LIVE COVERAGE PROVIDER INTEGRATION - EXTERNAL BLOCKER**

Coverage is deterministic demo behavior backed by seeded `DEMO` areas, not live ISP/network availability. Public wording must say demo/sample coverage and packages; it must not claim real-time availability, guaranteed serviceability, current commercial pricing, provider endorsement, or an order placed with an ISP.

Enquiries remain internal to FibreConnect's PostgreSQL/admin workflow. They are not transmitted to an ISP, network operator, CRM, webhook, or external email recipient. Public wording may say "submit an enquiry to FibreConnect" but not "sent to the provider", "provider will contact you", or "order placed". Consent to provider contact records permission only; it does not prove transmission.

The Prisma/toolchain risk acceptance remains valid only for the portfolio/public demo through its documented review deadline/triggers. The live-commercial gate remains open, and repository-wide dependency drift requires a future refresh. This release is not a security certification.

## Responsibility Boundaries

**Codex may:** inspect Git, execute an explicitly authorized normal push, wait for CI, run documented validation, prepare commands/checklists, and record evidence that does not contain secrets.

**Connected external tools may:** inspect or update GitHub/Netlify/Supabase/Resend/DNS only after explicit authorization and within the approved phase; actions must remain visible and auditable.

**Human must:** approve push/release classification, own accounts/billing/MFA, choose domain/region/plan, create projects, enter secrets, approve recipients, accept risk, approve migrations/seeding, publish DNS, and authorize deploy/rollback.

**Do not use Codex for:** choosing/purchasing a domain, accepting provider legal/billing terms, pasting or replaying secret values, deciding destructive database restoration alone, approving customer communications, or claiming external validation without observed evidence.

## Official Platform References

- Netlify import from Git: https://docs.netlify.com/manage/projects/add-new-project/
- Netlify deploy/preview/branch controls: https://docs.netlify.com/deploy/deploy-overview/
- Netlify contextual variables and scopes: https://docs.netlify.com/build/environment-variables/overview/
- Netlify Function environment limitations: https://docs.netlify.com/build/functions/environment-variables/
- Netlify custom-domain/DNS sequence: https://docs.netlify.com/manage/domains/get-started-with-domains/
- Supabase production checklist: https://supabase.com/docs/guides/deployment/going-into-prod
- Supabase backups and PITR: https://supabase.com/docs/guides/platform/backups
- Supabase Security/Performance Advisors: https://supabase.com/docs/guides/database/database-advisors
- Supabase connection pooling: https://supabase.com/docs/guides/database/connecting-to-postgres/pooling-and-limits
- Resend sending-only API keys: https://resend.com/changelog/new-api-key-permissions
- Resend domain verification: https://resend.com/changelog/domain-verification-events
- Resend test recipients: https://resend.com/changelog/sending-test-emails
