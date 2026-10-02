# WP8 Phase 8.4A - GitHub Candidate Push and CI Checkpoint

Date: 2026-10-02

Final status after Phase 8.4A-R: **PASS**

Classification: **GITHUB RELEASE CANDIDATE CHECKPOINT - PASS**

Release mode: **PUBLIC DEMO**

## Candidate SHA

- Branch: `main`
- Candidate: `d9e2f5fdcd062036ffcf8b8a6fe323c3e5db3146`
- Candidate matched the Phase 8.4 authorized SHA before push: yes

## Pre-push Git State

- Repository root: `C:\Users\Admin\fibre-connect-sa`
- Working tree: clean
- Local `main`: 15 commits ahead of `origin/main`
- Local `main`: 0 commits behind `origin/main`
- The 15-commit candidate range was inspected: 43 files changed, 3,753 insertions, and 160 deletions.
- The commits were consistent with the controlled Stage 8 work described by the phase authorization.
- No unexpected remote commits or divergence were detected after `git fetch origin`.

## Secret Check

- Candidate history and paths were checked for environment files, database URLs, Resend credentials, passwords, tokens, signing credentials, Supabase passwords, private keys, generated Prisma clients, database dumps, and unexpected binary artifacts.
- High-confidence secret findings: none.
- Sensitive tracked paths: none.
- Generated Prisma client or database dump committed: no.
- `.gitignore` continues to ignore `.env`, `.env.*`, and `*.local`, while allowing the non-secret `.env.example` template.
- Result: pass.

## Push Result

- Command: `git push origin main`
- Result: pass.
- Remote update: `f398bcf..d9e2f5f main -> main`
- Force push used: no.

## Remote SHA

- `origin/main`: `d9e2f5fdcd062036ffcf8b8a6fe323c3e5db3146`
- The remote SHA exactly matches the authorized candidate.

## CI Run

- Workflow: `CI`
- Run number: `4`
- Run ID: `36979187788`
- SHA: `d9e2f5fdcd062036ffcf8b8a6fe323c3e5db3146`
- Run URL: <https://github.com/Phathu87/fibre-connect-sa/actions/runs/36979187788>
- Overall result: **FAIL**

## Required Job Results

| Job | Result | Evidence |
|---|---|---|
| Validate application | PASS | Completed successfully for the exact candidate SHA. |
| PostgreSQL integration | FAIL | Failed in `Run npm run test:db:integration`. |
| Dependency critical gate | PASS | Completed successfully for the exact candidate SHA. |

### PostgreSQL Integration Failure

- Failed job ID: `110749597082`
- Failed step: `Run npm run test:db:integration`
- Safe error summary: `tests/database.integration.test.ts` reported `Missing VERIFY_EMAIL token in development email capture` from `tokenFromEmail` at line 12, reached by the test at line 160. The step exited with code 1.
- Setup, PostgreSQL container initialization, checkout, Node setup, `npm ci`, Prisma generation, migrations, and seed all completed before the failing test step.
- GitHub exposed the failure annotations publicly, but the detailed job log required sign-in. No secret-bearing output was copied into this evidence.
- Additional non-failing runner annotations: GitHub reported that Node.js 20-based action runtimes are being forced to Node.js 24, and that `ubuntu-latest` is scheduled to migrate to Ubuntu 26. These are deferred observations, not the cause recorded for this failure.
- No repair was attempted because Phase 8.4A explicitly requires a hard stop on mandatory CI failure.

## Final Synchronization State

- Local `main`: `d9e2f5fdcd062036ffcf8b8a6fe323c3e5db3146`
- `origin/main`: `d9e2f5fdcd062036ffcf8b8a6fe323c3e5db3146`
- Candidate synchronized: yes.
- Post-CI evidence remains uncommitted for review as required. Committing it would create a different documentation-only SHA and require separate synchronization.

## Remaining External Blockers

- Mandatory PostgreSQL integration CI repair and a new exact-SHA green CI checkpoint.
- Production Supabase provisioning and verification.
- Resend account, API key, and sending-domain verification.
- Netlify project/account configuration and contextual variables/secrets.
- Linked-project build validation.
- Temporary-domain deployment validation.
- Production smoke validation.
- Final public-demo approval.
- Prisma commercial security gate remains open.
- Live provider coverage remains unavailable and enquiries remain internal.

## Initial Decision

The candidate was pushed safely and local `main` is synchronized with `origin/main`, but the mandatory PostgreSQL integration job failed. Phase 8.4A is therefore **BLOCKED**, and the candidate is not approved for production deployment.

## Phase 8.4A-R Repair Update

- The failed candidate `d9e2f5fdcd062036ffcf8b8a6fe323c3e5db3146` is superseded as a release candidate by the approved repair work.
- Root cause: the integration-test capture helper only recognized verification links beginning with `https://`, while the CI test environment intentionally uses `PUBLIC_APP_URL=http://127.0.0.1:5173`. The application correctly emitted a `VERIFY_EMAIL` message, but the obsolete helper rejected its valid test-origin link.
- Repair: the helper now accepts HTTP or HTTPS test links and selects the captured message by both transactional-email type and intended recipient before extracting the token.
- Production email provider selection, Resend delivery, API responses, application logging, and verification semantics were not changed.
- Local focused result: 3 consecutive passes.
- Full PostgreSQL integration result: 8/8 tests passed.
- `npm run validate`: passed, including 63/63 standard tests and the production build.
- `npm audit --audit-level=critical`: passed with no critical advisories; lower-severity findings remain deferred.
- Repair commit: `fa6fde145de69c8902b5a0192c9f8dbda62de807` (`test: fix transactional email integration fixture`).
- The repair was pushed normally to `origin/main`; no force push was used.
- Exact-SHA GitHub CI: workflow `CI`, run `#5`, run ID `36982145284`.
- Validate application: PASS.
- PostgreSQL integration: PASS.
- Dependency critical gate: PASS.
- Overall CI: PASS.
- Final checkpoint: **GITHUB RELEASE CANDIDATE CHECKPOINT - PASS**.
- These post-CI evidence updates remain uncommitted so the validated candidate SHA is not changed.
