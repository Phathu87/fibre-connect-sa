# WP8 Phase 8.1 Release Baseline

Date: 2026-09-28

Status: PASS

## Git Baseline

- Branch: `main`
- HEAD: `f398bcfb4e611d266f420487955552a279e682f3`
- `origin/main`: `f398bcfb4e611d266f420487955552a279e682f3`
- Synchronization: `main...origin/main`, no divergence reported
- Working tree before this evidence document: clean
- Commits after previously reported baseline `f398bcf`: none
- Latest relevant commits at or before the baseline:
  - `f398bcf docs: record successful CI execution`
  - `6a661ce fix: normalize badge imports for Linux CI`
  - `7ded4d1 ci: add validation and release controls`
  - `5365fee feat: add privacy controls and Netlify runtime`

## Validation

### `npm ci`

Result: PASS

The original clean install failed with Windows `EPERM` while npm attempted to create or access `C:\Users\Admin\AppData\Local\npm-cache\_cacache`. npm also warned that it could not remove `node_modules\@radix-ui\react-menu\node_modules`.

Phase 8.1A narrowed the primary cause to access restrictions affecting the standard AppData npm cache. No Node, npm, or Vite listener was found on the repository's development ports, and process command lines were unavailable, so no process was terminated without evidence that it belonged to this repository.

After confirming the repository root, the disposable `node_modules` directory was removed. A repository-local disposable npm cache avoided the AppData cache error. The first retry then encountered a managed-environment registry `EACCES`; the same lockfile-based install was rerun with network approval and completed successfully. `npm ci --cache .npm-cache` installed 798 packages and audited 799 packages. The temporary repository-local cache was removed afterward. No dependency versions or lockfile content were changed.

### `npm run validate`

Result: PASS

The complete validation command ran successfully after the clean install:

- Prisma schema validation: PASS
- Prisma client generation: PASS
- ESLint: PASS
- Frontend TypeScript: PASS
- Server TypeScript: PASS
- Vitest: 4 files and 23 tests passed
- Vite production build: PASS

Vite retained its existing warning that a generated JavaScript chunk exceeds 500 kB. This warning did not fail validation and was not remediated in this phase.

## CI

- Workflow: `.github/workflows/ci.yml`, named `CI`
- Triggers: pull requests and pushes to `main`
- Jobs:
  - `Validate application`: Node 22, `npm ci`, `npm run validate`, build artifact upload
  - `PostgreSQL integration`: disposable PostgreSQL 17, Prisma generate/migrate/seed, database integration suite
  - `Dependency critical gate`: `npm audit --audit-level=critical`
- Permissions: repository contents read-only
- Concurrency: one run per Git ref, older in-progress run cancelled
- Latest verified run associated with current HEAD: GitHub Actions run `#3`, commit `f398bcf`, successful in 57 seconds
- Run URL: `https://github.com/Phathu87/fibre-connect-sa/actions/runs/35871935784`

## Deployment Configuration

- Primary configured target: Netlify
- Netlify configuration: `netlify.toml` exists
- Frontend build/publish: `npm run build` to `dist`
- API hosting: `netlify/functions`, with `/api/*` rewritten to the Fastify function bridge
- SPA routing: fallback to `/index.html`
- Vercel configuration: no tracked `vercel.json` or `.vercel/` configuration found
- Configured target classification: Netlify only
- No deployment or hosting-account configuration was performed in this phase

## Existing Release Documentation

- `docs/NETLIFY_DEPLOYMENT.md`: Netlify source, repository configuration, required variables, and account-level work
- `docs/CI_EXECUTION.md`: CI platform evidence and Linux case-sensitivity defect evidence
- `docs/RELEASE_RUNBOOK.md`: release preconditions, deployment, rollback, backup/recovery, and hotfix process
- `docs/RELEASE_METRICS.md`: technical, security, operational, and product release metrics
- `docs/CODEX_EXECUTION_PLAN.md`: work-package status and execution evidence
- `docs/SECURITY_VALIDATION.md`: verified security controls, dependency state, and release blockers
- `CHANGELOG.md`: unreleased migration changes and known release blockers
- `README.md`: current architecture, setup, routes, and Netlify readiness summary

## Issues Discovered

- The standard AppData npm cache remains inaccessible in the managed Windows environment, but a clean repository-local disposable cache provided a deterministic recovery path.
- The successful install reported 8 known dependency advisories: 2 low, 2 moderate, and 4 high. No audit remediation or dependency change was performed.
- The production build reports an existing JavaScript chunk-size warning.

## Deferred Findings

- Phase 8.2 dependency concern: 8 advisories in total (2 low, 2 moderate, and 4 high). No investigation or remediation was performed during Phase 8.1.
- Performance concern: the existing Vite JavaScript chunk-size warning remains deferred. No bundle optimization or Vite configuration change was performed.
- Local environment limitation: the standard Windows npm cache at `C:\Users\Admin\AppData\Local\npm-cache` remains inaccessible. This is not an application release blocker because deterministic installation succeeded using an isolated repository-local cache. Windows policy, antivirus, indexing, or ownership controls may be investigated separately if restoration of the standard cache path is required.

## Phase 8.1A Recovery Evidence

- Repository root verified before cleanup: `C:\Users\Admin\fibre-connect-sa`
- Disposable dependency artifact removed and recreated: `node_modules`
- Disposable recovery cache used and removed: `.npm-cache`
- Repository-related process termination: none; no process could be safely attributed to this repository
- `npm ci`: PASS
- `npm run validate`: PASS
- `package-lock.json` changed: NO
- Application/source changes introduced: NO
- Phase closure change scope before commit: only this Phase 8.1 evidence document

## Phase Decision

- Acceptance status: PASS
- Phase 8.1 status: formally closed
- Verified release baseline: `f398bcfb4e611d266f420487955552a279e682f3`
- Safe to proceed to Phase 8.2: YES
- Recommended next phase: Phase 8.2 - Dependency Security Audit
