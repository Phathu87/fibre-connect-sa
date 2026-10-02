# WP8 Phase 8.4A-R - PostgreSQL Integration CI Failure Repair

Date: 2026-10-02

Pre-push status: **LOCAL VALIDATION PASS - GITHUB CHECKPOINT PENDING**

## Root Cause

The PostgreSQL integration test's `tokenFromEmail` helper searched captured message text only for a whitespace-delimited value beginning with `https://`. GitHub CI configures the integration job with `PUBLIC_APP_URL=http://127.0.0.1:5173`, so the correctly generated verification link began with `http://`. Registration emitted the expected `VERIFY_EMAIL` message, but the obsolete test helper rejected the valid CI test-origin link and reported a missing token.

Classification: **A - Test expects the wrong/obsolete capture contract.**

The local test initially also surfaced Prisma `EACCES` during cleanup while database access was sandbox-restricted. Running with approved database access removed that environmental error; it was not a schema or application defect.

## Affected Test

- File: `tests/database.integration.test.ts`
- Workflow: `enforces registration, ownership, CSRF, reset, and session revocation`
- Original CI failure: `Missing VERIFY_EMAIL token in development email capture`

## Implementation

- Updated the existing `tokenFromEmail` helper; no second capture store was introduced.
- The helper accepts either HTTP or HTTPS links so local/CI test origins are valid.
- The helper selects the latest captured message matching both the exact transactional-email type and intended recipient.
- Verification and password-reset assertions still require `VERIFY_EMAIL` and `RESET_PASSWORD` respectively; the assertion was not weakened to accept an arbitrary email.
- No sleeps, retries, or timing workarounds were added.

## Security Invariants Preserved

- Production verification-token API leakage: none introduced.
- Production verification-token log leakage: none introduced.
- Production provider or Resend adapter changed: no.
- Email-provider selection changed: no.
- Development/test capture remains deterministic and in-memory.
- Forgot-password enumeration protection remains intact.
- Email verification remains required and its application behavior is unchanged.

## Validation

| Check | Result |
|---|---|
| Pre-fix standard application and email tests | PASS - 20/20 |
| Focused PostgreSQL integration workflow | PASS |
| Consecutive focused passes | PASS - 3/3 |
| Complete PostgreSQL integration suite | PASS - 8/8 |
| `npm run validate` | PASS |
| Standard tests within validation | PASS - 63/63 across 8 files |
| Email tests | PASS |
| Routing/security tests | PASS within the standard suite |
| Production build | PASS |
| `npm audit --audit-level=critical` | PASS - no critical advisories |

The production build retained the previously deferred chunk-size warning. The audit reported lower-severity advisories, which were not remediated in this phase.

## Git and GitHub Checkpoint

- Superseded candidate: `d9e2f5fdcd062036ffcf8b8a6fe323c3e5db3146`
- Repair commit: pending creation after this evidence and diff review.
- Pushed SHA: pending.
- Exact-SHA GitHub CI: pending.
- Release checkpoint: **BLOCKED** until all mandatory GitHub jobs pass.
