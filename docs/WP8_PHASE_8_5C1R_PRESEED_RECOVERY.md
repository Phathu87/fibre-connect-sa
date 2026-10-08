# WP8 Phase 8.5C-1R - Production Pre-Seed Recovery Checkpoint

Initial evidence: 2026-10-05

Recovery access attempts updated: 2026-10-07

Status: **BLOCKED - no export created**

Phase 8.5C-1R-A verified authenticated dashboard access, PostgreSQL 17.11 `pg_dump`/`pg_restore` tooling, five finished Prisma migrations and zero requested application/Auth counts on 2026-10-05, and established a restricted writable backup directory outside the repository. On 2026-10-07, the exact session-pooler endpoint was obtained, but authentication failed; a direct-host attempt failed at DNS resolution. The prior counts are historical and have not been reverified. This checkpoint phase remains **BLOCKED**. No dump was created. See [WP8_PHASE_8_5C1RA_RECOVERY_TOOLING.md](WP8_PHASE_8_5C1RA_RECOVERY_TOOLING.md) for updated evidence.

Scope: recovery preparation only. Read-only production queries were executed through the authenticated dashboard SQL Editor; no direct/session-pooler export connection was made. No seed, schema change, or data write was performed.

## Project Identity

The live dashboard confirmed `fibreconnect-sa-prod`, project ref `qzjcoytfhpnlgmnptfzl`, organisation `Solarity Works Org`, Healthy status, and region `eu-west-1` on 2026-10-05. A read-only dashboard SQL Editor query confirmed database `postgres`, role `postgres`, PostgreSQL `17.11` on that date. On 2026-10-07, shared-pooler authentication failed and the direct hostname did not resolve; no current direct DB connectivity was established.

## Pre-Checkpoint Database State

Historical live read-only verification on 2026-10-05 confirmed five Prisma ledger entries, all finished and none rolled back. Counts then were: providers 0, networks 0, packages 0, coverage areas 0, package availability 0, coverage searches 0, application users 0, sessions 0, tokens 0, enquiries 0, audit events 0, and Supabase Auth users 0. These counts were not reverified on 2026-10-07 and must not be treated as current. Public table and enum totals were not re-counted in this phase. Seed remains NOT EXECUTED.

## Blocker and Export Status

The current production database credential has not authenticated successfully. The exact session-pooler endpoint was obtained from the project's Connect dialog; `psql` reached the pooler but received password authentication failure. A direct-host attempt failed at DNS resolution before authentication, so it does not diagnose the password. Earlier, a credential was accidentally displayed in the Codex terminal during a failed hidden-prompt handoff; the user reported rotating it afterward. The exposed value is not reproduced here or in Git. No credential was added to repository files, and the development `.env` was not used. Avoid further pooler retries until access is resolved.

PostgreSQL 17.11 `pg_dump` and `pg_restore` are now available from the official EDB PostgreSQL 17.11-5 Windows x64 binary archive in a temporary directory outside the repository. Both report version 17.11. Supabase CLI and Docker are absent; CLI is not needed for the selected standard PostgreSQL export path. A direct DB connection was attempted on 2026-10-07 but the hostname failed DNS resolution before authentication. A dedicated local backup directory outside the repository was created with explicit ACLs for only the current user, SYSTEM, and local Administrators; a marker write/remove test passed. No dump or credentials were written there.

Therefore no export, checkpoint file, size, SHA-256, archive listing, or contents verification exists. Storage location and Git tracking status are NOT APPLICABLE; no dump was created. Restore-tool archive verification and full restore test were NOT PERFORMED.

The pre-seed recovery checkpoint is **not complete**. The release checklist remains unchecked for this gate. Do not seed production until this phase is rerun successfully and its completion is verified.

## Intended Export Scope and Recovery Artifacts

When prerequisites are available, create a PostgreSQL logical schema-and-migration checkpoint through a verified production session/direct connection. Include FibreConnect application tables, enums, constraints, indexes, RLS state, and the Prisma migration ledger as appropriate. Exclude unrelated Supabase platform-managed internals. Store the checkpoint outside the repository and public/frontend directories, record a safe location classification, size, and SHA-256, then verify it with the matching PostgreSQL restore/listing utility. Never restore over production as part of checkpoint verification.

The checked-in Prisma migrations remain the authoritative application schema-evolution history. A logical checkpoint is a recovery/evidence snapshot and supplements, but does not replace, migrations. Future production data exports/backups are a separate operational data-protection control.

## Restore Procedure

**Scenario A - before public traffic:** disable traffic; verify the exact approved production target; obtain explicit authorization before any destructive reset or recreation; reapply the reviewed Prisma migration chain or restore the verified checkpoint into an approved empty recovery target; validate migration state, schema, RLS, and expected data state; obtain separate authorization before any production seed.

**Scenario B - after public traffic:** do not casually recreate or clean production. Preserve current data and evidence, assess the incident, and require an explicit recovery decision. Prefer a reviewed forward-fix or a verified restore chosen for the incident; validate the recovery target before directing traffic to it.

Normal recovery principle: before public traffic, approved recreation/reapplication may be acceptable. After public traffic, preserve data and choose a reviewed forward fix or verified restore based on the incident.

Restore procedure documented; no checkpoint exists yet, and no restore/listing verification or full restore was executed. Current status: **RESTORE PROCEDURE DOCUMENTED - CHECKPOINT AND RESTORE-TOOL VERIFICATION NOT YET COMPLETED**.

## Backup Gates and Policy

- Before public traffic, complete and verify the pre-seed schema/migration checkpoint.
- After Phase 8.5C-2 is separately approved and succeeds, and before public traffic, create a second verified logical checkpoint containing migrated schema and the approved demo seed data. This becomes the immediate public-demo baseline. It has not been created.
- On the Free plan, if production data becomes meaningful, target logical exports at least daily, before migrations, and before risky administrative operations. Retain copies off-project/off-site. This is a recommendation; no automation or backup retention is currently verified.
- Public DEMO recovery targets: RPO up to 24 hours and RTO approximately 4 hours. These are project targets, not guaranteed commercial SLAs.
- Before LIVE COMMERCIAL MODE, reassess Supabase Pro, managed backups, PITR, tighter RPO/RTO, tested restore, and a named restore operator.

## Result

- Export method/format: NOT PERFORMED; `pg_dump` and `pg_restore` are available and the restricted external destination was verified, but database authentication remains blocked.
- Checkpoint filename/location: NONE; no dump created.
- Size/SHA-256: NOT APPLICABLE.
- Contents and restore-tool verification: NOT PERFORMED.
- Full restore test: NOT PERFORMED.
- Production identity, PostgreSQL version, Prisma ledger, and requested empty-data counts: VERIFIED READ-ONLY via dashboard SQL Editor on 2026-10-05 only; not current verification as of 2026-10-07.
- Seed: NO.
- Production schema change: NO.
- Production data write: NO.
- Recommended next action: resolve the password-authentication failure without sharing credentials; if the reset was recent, allow the pooler cache window to settle and avoid repeated retries. Reverify live state and connectivity before rerunning this checkpoint phase. Do not seed production.
