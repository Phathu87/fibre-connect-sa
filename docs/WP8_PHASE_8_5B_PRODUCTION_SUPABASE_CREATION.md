# WP8 Phase 8.5B - Production Supabase Project Creation

Date: 2026-10-02

Status: **PASS**

Release mode: **PUBLIC DEMO**

Execution boundary: one isolated production Supabase project was created and inspected. No application migration, seed, user, administrator, credential export, Netlify configuration, deployment, Resend change, or DNS change was performed.

## Project Identity

- Project name: `fibreconnect-sa-prod`
- Project reference: `qzjcoytfhpnlgmnptfzl`
- Branch: `main` / Production
- Compute: `nano` (`t4g.nano` shown on the project overview)
- GitHub integration: no repository connected
- Supabase branches: none
- Migration state: no migrations
- Backup state shown on overview: no backups

No database password, connection string, API key, service-role key, or other credential was read, copied, printed, or stored in the repository.

## Organisation

- Organization: `Solarity Works Org`
- Organization reference: `utcbjrwmyqsrrycsapkc`
- Organization plan: Free
- Spend cap: enabled
- Billing history inspected before creation showed no charges, and the dashboard indicated no extra usage charges under the selected Free plan. Project quota limits can still make the project unresponsive or read-only.

## Region

- West EU (Ireland)
- Region identifier: `eu-west-1`
- This matches the Phase 8.5A recommendation and the existing development-region baseline.

## PostgreSQL Version

A read-only SQL query against the new primary database returned PostgreSQL `17.11`:

```sql
select current_setting('server_version') as version;
```

The query was not saved and made no database change.

## Plan

- Selected plan: Free
- No paid plan, paid compute, or add-on was selected.
- The project uses the Free-plan `nano` compute allocation.

## Cost

- Creation introduced no approved charge.
- Scheduled backups require an upgrade to Pro.
- PITR is displayed as a Pro-plan add-on starting at `$100/month`; it was not enabled.

## Health Status

- Dashboard status: **Healthy**
- Primary database region and compute were visible on the project overview.
- The project overview reported no repository, no branches, no migrations, and no backups.

## Isolation Verification

- Development project: `fibreconnect-sa-dev` (`usszxjobogorpbbaqjmy`)
- Production project: `fibreconnect-sa-prod` (`qzjcoytfhpnlgmnptfzl`)
- The project references are different.
- Production has its own generated database credential, which was not exposed to Codex or repository output.
- No development schema, migrations, catalogue, users, sessions, enquiries, tokens, or credentials were copied.
- Preview and branch APIs remain fail-closed; no preview/staging project was created.

## Initial Application-Data State

- `public` schema: no tables or views
- Authentication: no users
- Prisma migration ledger: absent because no application migration was run
- Application migrations: none
- Application seed: not run
- Administrators: none
- User records, sessions, tokens, enquiries, audit records, and demo catalogue rows: none

Platform-managed schemas and services are not classified as FibreConnect application data.

## Security Advisors

Initial Security Advisor state before application migration:

- Errors: 0
- Warnings: 0
- Informational suggestions: 0
- Dashboard result: no errors detected

This is an empty-project baseline, not post-migration security evidence. Phase 8.5C must rerun the advisor after the schema and approved seed are applied.

## Performance Advisors

Initial Performance Advisor state before application migration:

- Errors: 0
- Warnings: 0
- Informational suggestions: 0
- Dashboard result: no errors detected

This is an empty-project baseline and does not replace post-migration performance review.

## Data API Posture

- Data API: disabled
- Dashboard result: no schemas can be queried; PostgREST `/rest/v1/` requests will fail while disabled.
- No `public` schema exposure was enabled.
- No browser-role policies or application tables exist.
- Fastify and Prisma remain the intended exclusive application data boundary.

## Backup Capability

- The project dashboard explicitly states that the Free plan does not include project backups.
- Scheduled backups are therefore **not available** for this project.
- No backup exists for the empty project.

## PITR Capability

- Point-in-Time Recovery is **not enabled**.
- The dashboard classifies PITR as a Pro-plan add-on starting at `$100/month`.
- No PITR or restore capability may be claimed for the current project.

## Pre-Migration Checkpoint Requirement

Because the selected Free plan provides neither scheduled backups nor PITR, Phase 8.5C must not begin until the owner approves and records a recovery approach for the empty baseline. At minimum, the release record must define:

- Free/manual-export versus paid backup operation
- required RPO and RTO
- named backup and restore operator
- pre-migration logical baseline/checkpoint method
- off-site encrypted storage location and retention
- non-production restore rehearsal method
- stop/recreate decision while the project remains empty and carries no user traffic

An empty project with no application objects cannot produce a useful application-schema logical dump. The controlled alternative before the first migration is to retain the immutable checked-in migration chain, record the verified empty state, and authorize recreation of the still-empty production project if migration fails. Any paid-plan upgrade or paid PITR add-on requires separate human approval.

## Remaining Blockers

- Human confirmation that Supabase account MFA is enabled.
- Human decision on Free/manual-export versus paid backup/PITR operation, including RPO/RTO.
- Approved pre-migration recovery checkpoint and restore procedure.
- Explicit Phase 8.5C authorization for the exact migration chain.
- Human approval of the labelled public-demo seed before any seed execution.
- Production database credentials must remain human-controlled and must be supplied only in the future authorized execution context.
- Netlify, Resend, DNS, production-domain, deployment, smoke-test, and public-release gates remain separate future work.
- Production Security and Performance Advisors must be rerun after migration and seed.

## Decision

Phase 8.5B is **PASS**. Exactly one isolated `fibreconnect-sa-prod` project was created in the approved organization and region, verified healthy on PostgreSQL `17.11`, and confirmed empty of FibreConnect application data. No charge was introduced, no credential was exposed, and no migration or seed was run. Phase 8.5C is not authorized by this result and remains blocked on the documented pre-migration recovery decision and explicit approval.

## Subsequent Phase Reference

Phase 8.5C-1 later applied the reviewed schema migration chain to this project without seeding. See `docs/WP8_PHASE_8_5C1_PRODUCTION_MIGRATION.md` for the migration execution evidence, post-migration schema state, empty-data verification, and remaining seed and release gates.
