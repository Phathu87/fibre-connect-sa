# FibreConnect SA Portfolio Release Checklist

Date: 2026-10-01

Release mode: **PUBLIC DEMO**

Legend: `[Codex]` repository/validation work; `[External tool]` connected-account action after explicit approval; `[Human]` owner decision/account action. No external step is complete at Phase 8.4 closure.

## A - Git Checkpoint

- [x] `[Codex]` Confirm `main`, clean working tree, and expected candidate HEAD.
- [x] `[Codex]` Review all commits/diff from `origin/main` and run a secret scan.
- [x] `[Human]` Authorize a normal push of `main`; no force-push.
- [x] `[Codex or External tool]` Push the candidate and record the remote SHA.
- [x] `[Codex or External tool]` Wait for all three mandatory GitHub Actions jobs.
- [ ] `[Human]` Approve the exact CI-green SHA as the Netlify candidate baseline.

Checkpoint result: **PASS** after the approved repair. CI run `#5` (ID `36982145284`) passed all three mandatory jobs for exact SHA `fa6fde145de69c8902b5a0192c9f8dbda62de807`. Human approval of this CI-green SHA remains outstanding before production provisioning or deployment.

## B - Supabase Environments

- [ ] `[Human]` Confirm existing `fibreconnect-sa-dev` remains development-only.
- [ ] `[Human]` Create isolated `fibreconnect-sa-prod`; confirm organization, plan, MFA, PostgreSQL 17.x, and preferred `eu-west-1` region.
- [ ] `[Human]` Decide Free/manual-export versus paid daily-backup/PITR policy, record RPO/RTO, and confirm a restorable pre-migration checkpoint.
- [ ] `[Human]` Keep previews fail-closed, or create a separate preview/staging project before enabling preview APIs.
- [ ] `[Human]` Obtain separate migration and pooled runtime credentials without exposing them to Codex/output.
- [ ] `[Codex]` From the CI-green commit, apply exactly five checked-in migrations through `DIRECT_URL` only after explicit migration approval and before Netlify traffic.
- [ ] `[Codex and Human]` Verify PostgreSQL version, 21 public tables, six application enums, migration ledger, all-table RLS, zero unintended policies, Data API exposure, extensions, advisors, SSL/network settings, and connection capacity.
- [ ] `[Human]` Approve only the visibly labelled demo catalogue/coverage seed: 3 providers, 4 networks, 5 packages, 3 areas, and 4 availability links.
- [ ] `[Codex]` Seed approved demo data through the explicitly targeted production `DATABASE_URL`; verify exact counts and `liveProviderData=false` in an authorized execution phase.
- [ ] `[Human and Codex]` Bootstrap one owner `ADMIN` only after normal registration/email verification, using a controlled, recorded promotion with no seeded credentials or public bootstrap endpoint.

## C - Resend

- [ ] `[Human]` Create/access the production Resend account and secure account access.
- [ ] `[Human]` Choose the sending domain and role sender.
- [ ] `[Human or External tool]` Add Resend's exact DNS records at the DNS provider.
- [ ] `[Human]` Confirm sending-domain verification.
- [ ] `[Human]` Create a sending-only/domain-restricted production API key.
- [ ] `[Human or External tool]` Store the key only in Netlify production Functions scope.
- [ ] `[Human]` Approve a controlled recipient before any real email test.
- [ ] `[Codex and Human]` Validate verification/reset delivery and redacted logs in a later authorized phase.

## D - Netlify Site

- [ ] `[Human]` Select the correct Netlify team and account plan.
- [ ] `[Human or External tool]` Import `Phathu87/fibre-connect-sa` from GitHub using `main`.
- [ ] `[Codex]` Verify `npm run build`, `dist`, `netlify/functions`, Node 22, redirects, and headers.
- [ ] `[Human]` Stop/lock automatic production publishing during initial validation where supported.
- [ ] `[Human]` Disable branch deploys initially.
- [ ] `[Human]` Keep Deploy Preview APIs fail-closed; do not add production secrets to preview contexts.
- [ ] `[Human]` Keep the temporary Netlify URL unadvertised until approval.

## E - Netlify Environment Variables

- [ ] `[Human or External tool]` Add production application/database context labels with production Functions scope.
- [ ] `[Human]` Add production pooled `DATABASE_URL` without exposing its value.
- [ ] `[Human or External tool]` Add `NODE_ENV`, `TRUST_PROXY`, session, and logging settings.
- [ ] `[Human]` Set exact temporary HTTPS `PUBLIC_APP_URL` and matching `CORS_ORIGINS`.
- [ ] `[Human]` Add verified sender configuration and production-only Resend key.
- [ ] `[Human]` Confirm `DIRECT_URL` is absent from Functions and retained only for migrations.
- [ ] `[Human]` Confirm database, Resend, and Turnstile secrets have no `VITE_` prefix/build scope.
- [ ] `[Human]` Leave `BOT_PROTECTION_SECRET` absent until frontend Turnstile integration is approved.
- [ ] `[Human]` Leave preview/branch DB and email secrets absent unless isolated environments are approved.

## F - Platform-Native Validation

- [ ] `[Codex]` Run `netlify build` after linking and record output without secrets.
- [ ] `[Codex]` Verify Function bundle/import, Node 22, SPA fallback, and `/api/*` rewrite.
- [ ] `[Codex]` Verify `/api/health` and configuration-failure behavior before production DB activation.
- [ ] `[Codex]` Verify server secrets do not appear in frontend assets or logs.
- [ ] `[Human]` Confirm no customer traffic, indexing, or public promotion during validation.

## G - First Deployment

- [ ] `[Human]` Authorize the exact CI-green candidate deployment.
- [ ] `[External tool or Human]` Deploy to the temporary Netlify URL with controlled publishing state.
- [ ] `[Codex]` Record deploy ID/URL, commit SHA, function status, migration ledger, and operator.
- [ ] `[Human]` Confirm `/api/ready` before any public promotion.
- [ ] `[Human]` Approve custom-domain work only after temporary-URL validation passes.

## H - Production Smoke

- [ ] `[Codex]` Test home, packages, demo detail, coverage, login, `/api/health`, and `/api/ready`.
- [ ] `[Human]` Approve a disposable test identity and email recipient.
- [ ] `[Codex]` Test registration, verification, resend/reset, login, account, and secure cookies.
- [ ] `[Codex]` Submit one labelled test enquiry and verify internal-only handling.
- [ ] `[Codex]` Verify anonymous/non-admin denial and controlled-admin enquiry access.
- [ ] `[Codex]` Test privacy export and safely delete the disposable account.
- [ ] `[Codex and Human]` Review Netlify, Supabase, and Resend health/log evidence for the observation window.
- [ ] `[Human]` Trigger rollback immediately if any gate in `docs/RELEASE_RUNBOOK.md` fails.

## I - Portfolio Release Approval

- [ ] `[Human]` Confirm release mode remains `PUBLIC DEMO`, not beta/commercial.
- [ ] `[Human]` Approve wording that catalogue and coverage are demo/sample data, not live availability.
- [ ] `[Human]` Approve wording that enquiries stay internal and are not transmitted to providers.
- [ ] `[Human]` Reconfirm Prisma portfolio risk acceptance and open commercial dependency gate.
- [ ] `[Human]` Confirm backup/rollback evidence and named release operator.
- [ ] `[Human]` Approve publication of the temporary or final canonical URL.
- [ ] `[Codex]` Record final SHA, CI run, deploy, smoke evidence, limitations, and approval in the release record.

## Explicit Human-Only / No-Codex Actions

- [ ] Choose or purchase a domain and accept registrar/provider legal or billing terms.
- [ ] Enter, reveal, copy, or rotate production database/API credentials.
- [ ] Approve destructive restore, database deletion, or production data loss.
- [ ] Approve real recipients, customer communication, commercial claims, or live-provider representation.
