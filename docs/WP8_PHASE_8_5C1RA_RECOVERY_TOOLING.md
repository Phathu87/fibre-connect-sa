# WP8 Phase 8.5C-1R-A - Production Recovery Access and Export Tooling

Initial evidence: 2026-10-05

Recovery access attempts updated: 2026-10-07

Status: **PARTIAL - authenticated dashboard, PostgreSQL client tools, and private backup destination ready; direct database authentication remains blocked**

Scope: access and tooling readiness only. Read-only production queries were previously executed through the authenticated dashboard SQL Editor. A later direct/session-pooler attempt did not authenticate. No database mutation occurred.

## Supabase Access

- Authenticated production dashboard: YES, live session verified.
- Organisation: `Solarity Works Org`.
- Project: `fibreconnect-sa-prod`.
- Project ref: `qzjcoytfhpnlgmnptfzl`.
- Health: `Healthy`.
- Region: `eu-west-1` (West EU/Ireland).
- No new account or project was created.

The overview tile says “No migrations”; the read-only Prisma ledger query below independently confirms the five Prisma migration records. The overview tile is not used as evidence of the Prisma migration ledger.

## Database State

- Dashboard SQL Editor connectivity: PASS; read-only queries ran against database `postgres` as role `postgres`.
- Direct/session-pooler connectivity using the current database password: NOT TESTED on 2026-10-05; current credentials were unavailable then.
- PostgreSQL version: `17.11` (live query).
- Prisma migration ledger: exactly five rows; each has `finished_at IS NOT NULL` and `rolled_back_at IS NULL`:
  - `20260917000000_initial_foundation`
  - `20260917130000_enable_public_table_rls`
  - `20260917160000_coverage_foundation`
  - `20260917163000_harden_prisma_migration_ledger`
  - `20260917170000_auth_sessions_rbac`
- Read-only counts: providers 0; networks 0; packages 0; coverage areas 0; package availability 0; coverage searches 0; application users 0; sessions 0; tokens 0; enquiries 0; audit events 0; Supabase Auth users 0.
- No migration, schema write, data write, or seed was run.

### 2026-10-07 Connection Recheck

- User supplied the Session pooler endpoint details from the production project's Connect dialog: host `aws-0-eu-west-1.pooler.supabase.com`, port `5432`, database `postgres`, user `postgres.qzjcoytfhpnlgmnptfzl`.
- A read-only `psql` attempt reached the shared pooler but was rejected with password authentication failure. This does not verify the current password or database state. No further pooler retries should be made until the credential is confirmed and any post-rotation pooler cache delay has elapsed.
- A read-only attempt to the direct hostname `db.qzjcoytfhpnlgmnptfzl.supabase.co:5432` failed at DNS resolution before authentication. Direct connectivity and password validity therefore remain unverified.
- The earlier hidden-prompt handoff failed: the password was accidentally entered as a command in the Codex terminal and displayed there. The user subsequently reported rotating the credential. The secret is not reproduced in this evidence or repository. Do not reuse the exposed credential.
- The rotated credential has not authenticated successfully through the available process. Do not ask for or record it in chat; use a verified, genuinely hidden local credential-entry flow if access is retried.
- Because no successful connection occurred, the migration ledger and application-data counts below are historical read-only dashboard evidence from 2026-10-05, not a current recheck.

## Tooling Assessment

Initial PATH and common-location searches found no `pg_dump`, `pg_restore`, or Supabase CLI. Docker was also unavailable, so the Supabase CLI backup path (which requires Docker) was not selected. The PostgreSQL project Windows downloads page links to EDB's official binaries archive; its PostgreSQL 17.11-5 Windows x64 archive was downloaded and extracted to a temporary directory outside the repository.

- `pg_dump`: available; `pg_dump (PostgreSQL) 17.11`.
- `pg_restore`: available; `pg_restore (PostgreSQL) 17.11`.
- Supabase CLI: unavailable and not required for the selected standard PostgreSQL tooling method.
- Source: official EDB binaries archive for PostgreSQL 17.11-5, linked from the PostgreSQL project Windows downloads page.
- Purpose: operator-only logical database export and custom archive verification/restore tooling.
- Tool location: temporary local tooling directory outside the repository; exact absolute path intentionally omitted.
- Temporary downloaded archive: removed after extraction. The extracted client binaries remain available for the next phase.
- Project dependency changes: none. `package.json` and lockfile were not changed.
- `pg_dump` is required for export; `pg_restore` is required for custom-format archive listing/verification and restore workflows.

## Credential Handling

- Current rotated production database credential available to Codex: NO; attempted pooler authentication failed.
- Credential accidentally displayed in a terminal during the earlier handoff: YES; user reported rotating it afterward. Secret value omitted.
- Credential recorded in documentation or Git: NO.
- Temporary credential files created: NO; cleanup: NOT APPLICABLE.
- The development `.env` was not used.

## Readiness

Authenticated dashboard identity and PostgreSQL 17.11, the PostgreSQL 17.11 client tools, and a dedicated local backup directory remain evidenced by the earlier checks. The migration ledger and empty-data counts were verified read-only through the dashboard on 2026-10-05 only; they were not reverified on 2026-10-07. The backup directory is outside the repository under the current user's LocalAppData, with explicit FullControl ACLs for only the current user, SYSTEM, and local Administrators. A harmless write/remove marker test passed and the marker was removed. The Documents folder remains unsuitable because its inherited ACL grants the local Codex sandbox group read/execute access. No database dump or credential was written to the new directory.

**Recovery readiness: BLOCKED.** The exact session-pooler endpoint is now known, but the attempted credential was rejected; direct-host DNS did not resolve. Current password validity and live database state are not verified. PostgreSQL 17 tooling and the external backup destination are ready. Do not make repeated pooler authentication attempts, rotate again solely to troubleshoot, export, or seed production until the credential/access path is resolved.

## Mutation Summary

- Schema writes: NO.
- Data writes: NO.
- Seed: NO.
- Export/restore: NO.
- Project/account/plan changes: NO.
