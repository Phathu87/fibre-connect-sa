# WP8 Phase 8.5C-1 - Controlled Production Migration

Date: 2026-10-05

Status: **PASS**

Scope: production schema migration and read-only verification only. No seed, user, administrator, enquiry, or application data was created. Netlify, Resend, DNS, plan, and public traffic were not changed.

## Production Project

- Project: `fibreconnect-sa-prod`
- Reference: `qzjcoytfhpnlgmnptfzl`
- Organization: `Solarity Works Org`
- Region: `eu-west-1`
- PostgreSQL: `17.11`
- Plan: Free
- Dashboard status immediately before migration: Healthy
- Data API: disabled before and after migration
- Supabase account MFA remains unconfirmed by the account holder.

## Git and Release Identity

- Branch: `main`
- Application/release candidate SHA: `fa6fde145de69c8902b5a0192c9f8dbda62de807` (the CI-green application commit; the current HEAD is a later documentation-only commit).
- Current repository HEAD at execution: `ef426c9d12c7a4ea3274938d790cd1787c2b531a`.
- `origin/main` at execution: `fa6fde145de69c8902b5a0192c9f8dbda62de807`.
- Migration files and Prisma schema/configuration were clean and unchanged. No migration SQL or application code was edited.
- Documentation changes from this phase are not pushed and do not change which application SHA produced the schema.

## Pre-Migration State

An encrypted read-only connection was established to the approved production session pooler and verified by project-specific username/reference and hostname before mutation:

- Host: shared Supabase session pooler in `eu-west-1`, port `5432`.
- Database: `postgres`; role: `postgres`.
- PostgreSQL version: `17.11`.
- Supabase overview reported `8/60` connections at the pre-migration observation.
- FibreConnect application tables: `0`.
- Prisma migration ledger: absent.
- Supabase Auth users: `0`.
- Application data: `0`.
- Pre-migration recovery checkpoint: verified empty application database, no application tables or migration ledger, with the immutable checked-in migration chain identified as the reconstruction source. The project remained before public traffic.

The repository `.env` was confirmed to point to development and was not used. A dedicated ignored production environment was used for the migration and runtime read verification. Connection values and passwords are deliberately omitted from this document.

## Migration List

Exactly five migration directories and five `migration.sql` files existed, in Prisma execution order:

1. `20260917000000_initial_foundation`
2. `20260917130000_enable_public_table_rls`
3. `20260917160000_coverage_foundation`
4. `20260917163000_harden_prisma_migration_ledger`
5. `20260917170000_auth_sessions_rbac`

The chain matches the previously audited and successfully exercised development and PostgreSQL CI chain. The SQL files were unchanged at execution. Their reviewed SHA-256 digests were:

| Migration | SHA-256 |
| --- | --- |
| `20260917000000_initial_foundation` | `40CC814116CEEDD631A0C3CD9A093A37E7C95171EA93A960D34DB6C8CC690A74` |
| `20260917130000_enable_public_table_rls` | `B4CC8FA93683716EF2BAFA04ADC6C0D647BABF46EA75C021B3FCA1448A9A4EF3` |
| `20260917160000_coverage_foundation` | `278997419F95C32DF58BB9327ED7369CD12C48DBCAA2D310E2B605ABA1D4DBB5` |
| `20260917163000_harden_prisma_migration_ledger` | `EC385C66DD7C7137042C65D15B86816D98B74909C7419E4A33B33CD7A27FD1DB` |
| `20260917170000_auth_sessions_rbac` | `5DD503ECBA10D20E7F8C9A057C9EA6912A87B1D13F2D482955046B866A008E97` |

## SQL Destructive-Operation Review

- No `DROP TABLE`, `DROP COLUMN`, destructive `ALTER ... DROP`, `TRUNCATE`, `DELETE FROM`, `UPDATE`, `INSERT`, or `CREATE EXTENSION` operation was present.
- The migrations create the initial tables/types/indexes/constraints, add coverage columns and indexes, enable RLS, harden RLS on Prisma's ledger, and add auth session/token structures and types.
- Foreign-key definitions include expected `ON DELETE CASCADE`, `RESTRICT`, and `SET NULL` referential actions. These define future delete behavior; the migration statements do not delete existing application rows.
- No environment-specific project reference or application data assumption was found.
- Review result: safe to execute against the verified empty production project.

## Connection Identity Verification

- Migration command used production `DIRECT_URL` via the Supabase IPv4 session pooler on port `5432`.
- Runtime Prisma read verification used production `DATABASE_URL` via the transaction pooler on port `6543`.
- Before migration, a read-only query verified production project reference `qzjcoytfhpnlgmnptfzl`, host, PostgreSQL `17.11`, database/role, zero application tables, absent ledger, and zero Auth users.
- TLS was required on both connection strings and Node confirmed encrypted client transport. `pg_stat_ssl` on the database backend reported `false` through the Supabase pooler; the pooler-to-database TLS state was not independently observable from this client. Full certificate-chain validation failed because the local Node trust store rejected the presented chain, so the connection used PostgreSQL `sslmode=require` compatibility mode. Record this as encrypted transport with certificate identity verification unconfirmed.
- The existing development URLs were not used. No credentials are recorded here.

## Migration Execution

- Command: `npm run db:migrate` (`prisma migrate deploy`).
- Result: PASS; Prisma found five migrations and applied all five successfully in order.
- Failed migrations: `0`.
- Rolled-back migrations: `0`.
- No automatic repair, new migration, or seed command was run.

## Migration Ledger

The production `_prisma_migrations` ledger contains exactly these five records, each with `finished_at` set and `rolled_back_at` unset:

1. `20260917000000_initial_foundation`
2. `20260917130000_enable_public_table_rls`
3. `20260917160000_coverage_foundation`
4. `20260917163000_harden_prisma_migration_ledger`
5. `20260917170000_auth_sessions_rbac`

No failed or rolled-back migration record exists.

## Schema Counts

- Application tables: `20`.
- Public tables including `_prisma_migrations`: `21`.
- Application enums: `6`: `AccountStatus`, `AuthTokenType`, `ConnectivityType`, `CoverageResultType`, `EnquiryStatus`, `UserRole`.
- Public table primary-key constraints: `21`.
- Public foreign-key constraints: `22`.
- Public indexes: `58`.
- Every public application table and `_prisma_migrations` is present.

## Constraints and Indexes

Representative read-only checks passed:

- `Provider` table and its primary key exist.
- `User_email_key` unique index exists.
- `BroadbandPackage_providerId_active_idx` exists.
- `BroadbandPackage_providerId_fkey` exists.
- `User.email` is non-nullable.
- `CoverageArea.postalCode` is nullable.

The database contains the expected migration-defined constraints and indexes. No application CRUD or write test was performed.

## RLS

- RLS enabled on all `21/21` public tables, including `_prisma_migrations`.
- Tables with RLS disabled: `0`.
- Public policies: `0`.
- This matches the Fastify/Prisma-only data boundary; the browser receives no direct table policy.

## Data API

- Data API remains disabled after migration.
- Dashboard states no schemas can be queried while disabled.
- No public schema was enabled for PostgREST access.

## Extensions

The resulting extension inventory is `pg_stat_statements`, `pgcrypto`, `plpgsql`, `supabase_vault`, and `uuid-ossp`, matching platform/default extensions previously observed in development. The reviewed migrations create no extension, and no application-specific extension was enabled by this phase.

## Advisors

Fresh Supabase advisor results after migration and before seed:

- Security Advisor: `0` errors, `0` warnings, `21` informational suggestions. The suggestions are `RLS Enabled No Policy` notices on the 21 tables, expected for this architecture and the disabled Data API. No error-level finding requires repair in this phase.
- Performance Advisor: `0` errors, `0` warnings, `28` informational suggestions. Findings include unindexed foreign-key notices and unused-index suggestions. This newly migrated, empty database has no production workload; no speculative index changes were made.

Both advisors must be reviewed again after approved demo seed and representative workload evidence.

## Data Emptiness

Read-only database queries after migration returned:

- Providers: `0`.
- Networks: `0`.
- Packages: `0`.
- Coverage areas: `0`.
- Application settings: `0`.
- Users: `0`.
- Sessions: `0`.
- Auth/reset/verification tokens: `0`.
- Enquiries: `0`.
- Audit events: `0`.
- Supabase Auth users: `0`.
- Admin accounts: `0` (no application users exist).

No seed or general CRUD/write test was run.

## Prisma Read Verification

Using the repository's `server/db/client.ts` adapter architecture through production `DATABASE_URL` and the transaction pooler, read-only Prisma counts succeeded:

- Providers: `0`.
- Networks: `0`.
- Packages: `0`.

The Prisma client disconnected after the reads.

## Recovery Checkpoint

Phase 8.5C-1R attempted the required pre-seed logical checkpoint and remains **BLOCKED**. PostgreSQL 17.11 export/listing tools and a restricted external backup destination are ready, but the current production credential has not authenticated through the shared pooler, and live database identity/state therefore could not be reverified. A direct-host attempt failed at DNS resolution. No checkpoint was created; the checklist gate remains incomplete. See [WP8_PHASE_8_5C1R_PRESEED_RECOVERY.md](WP8_PHASE_8_5C1R_PRESEED_RECOVERY.md) and [WP8_PHASE_8_5C1RA_RECOVERY_TOOLING.md](WP8_PHASE_8_5C1RA_RECOVERY_TOOLING.md).

**Schema migrated successfully; application data remains empty.**

This post-migration/pre-seed checkpoint records five finished migration ledger entries, the verified 20-table application schema, all-table RLS, zero public policies, disabled Data API, and zero application/Auth data. The project is still before public traffic. Because the Free plan has no managed backups or PITR, do not authorize seed or public traffic until the owner records an acceptable logical export and restore/recreation procedure, names an operator, and confirms the public-demo RPO of up to 24 hours and RTO of approximately 4 hours. Before commercial release, reassess managed backup/PITR requirements.

If a later pre-traffic operation fails and forward repair is unsafe, recreating this empty-data project requires separate explicit approval; this phase did not destroy or recreate it.

## Phase 8.5C-2 Gates

Before any seed execution, Phase 8.5C-2 must verify:

- The exact demo seed contents and idempotency against the reviewed repository source.
- No users, admins, personal data, sessions, tokens, enquiries, or audit data exist immediately before seed.
- Provider, network, package, and coverage records remain explicitly labelled `DEMO`; no live-provider or availability claims are introduced.
- Production project name/reference and both production connection identities are confirmed immediately before any write.
- A separate explicit authorization to seed has been given.

## Remaining Blockers

- Seed authorization and the Phase 8.5C-2 review are outstanding; **seed executed: NO**.
- Establish and approve logical export, retention, restore/recreation procedure, operator, and public-demo RPO/RTO before seed/public traffic.
- Human confirmation of account MFA remains outstanding.
- Node did not validate the Supabase certificate chain from this local trust store; encrypted client transport is confirmed, certificate identity verification is not.
- Fresh post-seed advisor review, backup evidence, Netlify configuration, Resend, DNS/domain, deployment, smoke checks, and public-release approval remain future gates.

## Completion

Phase 8.5C-1 is **PASS** for the authorized controlled migration. The production identity was verified before mutation, the exact five reviewed migrations succeeded, expected schema/RLS state was verified, advisor results were recorded, and Prisma reads confirmed empty catalogue tables. **Seed executed: NO.** No push was performed. The production database password was rotated after migration verification; all temporary local credential and verification files were removed.
