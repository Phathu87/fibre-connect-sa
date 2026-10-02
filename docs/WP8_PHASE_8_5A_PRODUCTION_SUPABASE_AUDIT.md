# WP8 Phase 8.5A - Production Supabase Readiness Audit

Date: 2026-10-02

Status: **PASS**

Release mode: **PUBLIC DEMO**

Audit boundary: repository inspection, official platform documentation, and read-only development-database queries. No project, credential, migration, seed, or infrastructure change was made.

## Recommended Production Project

- Development remains the existing `fibreconnect-sa-dev` project and must not receive production traffic or credentials.
- Create one isolated production project named `fibreconnect-sa-prod`.
- Preview and branch contexts remain fail-closed until a separate non-production project is explicitly provisioned.
- Development and production must not share project references, passwords, connection strings, backup lifecycle, or operator credentials.
- The project owner must choose the Supabase organization, plan, spend controls, MFA posture, region, and backup policy during Phase 8.5B.

## Region

Recommended production region: **West EU (Ireland), `eu-west-1`**.

Reasons:

- The development pooler and validated development environment are already in `eu-west-1`; retaining the region reduces an avoidable environment difference.
- Supabase currently offers Ireland as a specific region. Supabase does not list a South African project region.
- Netlify supports an Ireland Functions region (`dub`), allowing the future Fastify/Prisma Function to be colocated with PostgreSQL when the selected Netlify plan supports region configuration.
- Netlify's current default for new sites is Ohio (`cmh`), while regional Function selection is documented for Pro and Enterprise plans. The owner must therefore confirm the Netlify plan and set/verify `dub` before production traffic, or record measured latency and explicit acceptance if the default region must be retained.
- Region choice is a data-location and latency decision, not by itself proof of regulatory compliance.

Official references:

- Supabase regions: <https://supabase.com/docs/guides/platform/regions>
- Netlify Functions region configuration: <https://docs.netlify.com/build/functions/configuration/#region>

## Postgres Compatibility

- Development was verified read-only on PostgreSQL `17.6`.
- CI validates the complete migration and integration-test chain on `postgres:17-alpine`.
- Production should use managed PostgreSQL **17.x**. Record the exact server version before migration.
- Do not select or upgrade to a future major version without a fresh disposable migration rehearsal, Prisma generation/validation, integration tests, and extension compatibility review.
- Prisma `7.10.0`, `@prisma/client` `7.10.0`, and `@prisma/adapter-pg` `7.10.0` are the validated application stack.

## Schema Inventory

The Prisma schema defines 20 application tables:

1. `User`
2. `AuthSession`
3. `AuthToken`
4. `UserAddress`
5. `Provider`
6. `NetworkOperator`
7. `BroadbandPackage`
8. `Promotion`
9. `CoverageArea`
10. `PackageAvailability`
11. `SavedPackage`
12. `Comparison`
13. `ComparisonItem`
14. `CoverageSearch`
15. `Enquiry`
16. `EnquiryStatusHistory`
17. `NotificationPreference`
18. `ProviderRating`
19. `AuditLog`
20. `AppSetting`

It defines six enums: `UserRole`, `AccountStatus`, `AuthTokenType`, `ConnectivityType`, `CoverageResultType`, and `EnquiryStatus`.

The development database has 21 public tables: the 20 application tables plus Prisma's `_prisma_migrations` ledger.

## Migration Chain

Apply the five checked-in migrations in Prisma execution order:

1. `20260917000000_initial_foundation`
2. `20260917130000_enable_public_table_rls`
3. `20260917160000_coverage_foundation`
4. `20260917163000_harden_prisma_migration_ledger`
5. `20260917170000_auth_sessions_rbac`

The development ledger reports all five as finished and none rolled back. Migrations must remain immutable.

## RLS

- `20260917130000_enable_public_table_rls` enables RLS on the 18 initial application tables.
- `20260917163000_harden_prisma_migration_ledger` enables RLS on `_prisma_migrations`.
- `20260917170000_auth_sessions_rbac` creates `AuthSession` and `AuthToken` and enables RLS on both.
- No post-RLS application table is missing its own RLS enablement.
- Development verification: RLS is enabled on all 21 public tables, with zero public policies.
- Production requirement: all 20 application tables and `_prisma_migrations` must have RLS enabled after migration.
- No `anon` or `authenticated` policy is required because browsers do not access application tables directly. Adding a policy requires a separate architecture/security review.

## Data API Posture

Fastify and Prisma are the exclusive application data boundary. The browser must use the FibreConnect API and must not receive Supabase database credentials or query public tables directly.

- Keep the Supabase Data API disabled or restrict its exposed schemas so `public` is not exposed where the selected project controls allow this.
- Regardless of dashboard exposure settings, retain RLS with no `anon`/`authenticated` policies as defense in depth.
- Do not place Supabase `anon`, publishable, service-role, or secret keys in the frontend unless a separately approved feature creates a genuine client-side Supabase requirement.
- Runtime Prisma uses the production pooled `DATABASE_URL`; migrations use the separate direct/session `DIRECT_URL`.

## Extensions

- The schema and migrations contain no `CREATE EXTENSION` statement.
- No optional extension is an application prerequisite for this release. PostgreSQL 17 provides the `gen_random_uuid()` function used by the auth migration.
- Development currently reports platform/default extensions `pg_stat_statements`, `pgcrypto`, `plpgsql`, `supabase_vault`, and `uuid-ossp`. Their presence is evidence about development, not a requirement to enable extras manually in production.
- Record the production extension inventory after creation and enable nothing solely to mimic unused development defaults.

## Advisor Evidence

Existing documented development evidence reports:

- Security Advisor: no warning/error findings.
- Security Advisor informational state: RLS enabled with no policy across 21 public tables; intentional for the Fastify/Prisma boundary.
- Performance Advisor: four foreign keys without covering indexes and eleven currently unused indexes in the latest recorded evidence.
- Auth foreign-key paths are covered; unused-index findings require production-like telemetry before removal.

These development findings are not production evidence. Phase 8.5C must capture fresh production Security Advisor and Performance Advisor results after migration and seed.

## Seed Classification

### Safe For Portfolio Production

- `AppSetting.catalogue_mode` with `{ mode: "demo", liveProviderData: false }`.
- Three provider catalogue records, each described as demo data.
- Four network-operator records, each described as demo data.
- Five packages whose slugs begin with `demo-`, whose names begin with `Demo`, and whose descriptions state that they are not live commercial offers.
- Three coverage areas with `source = "DEMO"` and fixed `lastVerifiedAt` values.
- Four package-availability links generated only between the approved demo records.

Development read-only counts were: 3 providers, 4 networks, 5 demo packages, 3 demo coverage areas, 4 availability rows, and 1 demo-mode setting.

### Development Only

- Integration-test users, auth tokens, sessions, addresses, comparisons, saved packages, enquiries, audit logs, and other records created dynamically by tests.
- Any manually created development users or operational records already present in `fibreconnect-sa-dev`.
- These records are not created by `prisma/seed.ts` and must not be copied to production.

### Do Not Seed

- User or administrator accounts and password hashes.
- Sessions, CSRF hashes, verification/reset tokens, or API credentials.
- Development enquiries, personal information, audit history, coverage-search history, or test fixtures.
- Live-provider claims, unverified commercial pricing, or coverage represented as live availability.
- Environment-specific project references, connection strings, secrets, or Netlify/Resend configuration.

Seed script production-safe: **YES for the approved PUBLIC DEMO dataset**, subject to human approval and explicit targeting of the new production database. It is idempotent and contains no user, enquiry, credential, or development-fixture insertion. Execution evidence must confirm `liveProviderData=false` and the exact counts above. It must never run against production through an ambient or ambiguous environment.

## Production Data Labelling

- Catalogue mode must remain `demo` with `liveProviderData=false`.
- Package names/slugs/descriptions must continue to identify demo data.
- Coverage rows must retain `source="DEMO"`; UI/API wording must describe coverage as demo or estimated, never live availability.
- Provider and network names are reference labels only and must not imply endorsement, affiliation, current price accuracy, or order fulfilment.
- Enquiries remain internal to FibreConnect and are not transmitted to providers.

## Admin Bootstrap

Recommended method: **one-time controlled promotion after normal registration and email verification**.

1. The named owner registers through the production application using a unique owner-controlled email address and completes normal email verification.
2. A human operator confirms the exact user ID, normalized email, `ACTIVE` status, and ownership out of band.
3. During a controlled maintenance window, the operator uses authenticated Supabase SQL tooling and a transaction to promote only that exact user to `ADMIN` (not `SUPER_ADMIN`).
4. The operator records timestamp, project reference, target user ID, old/new role, approver, and verification query output without recording credentials.
5. The owner signs in again and verifies least-privilege admin access. Additional roles use the application's controlled admin workflow.

Do not seed administrator credentials, accept an environment-provided plaintext password, or expose a public first-admin endpoint.

## Backup Considerations

- The owner must select the plan and document actual backup capability before migration.
- Current Supabase documentation states that Pro, Team, and Enterprise projects receive daily backups; Pro retains seven days, Team fourteen days, and Enterprise up to thirty days. PITR is a paid add-on and replaces daily backups while enabled.
- Free projects do not provide automatic backups; Supabase recommends regular logical exports and off-site storage.
- Do not claim PITR or automated restore capability until the production dashboard proves it is enabled for this project.
- Before migration/seed, record a restorable empty-project checkpoint or approved logical baseline. After seed, capture a second recovery point and rehearse the documented restore method in a non-production environment when the selected plan permits.
- Backups cover the database, not Storage objects. FibreConnect does not currently require Supabase Storage for this release.

Official reference: <https://supabase.com/docs/guides/platform/backups>

Remaining owner decision: choose Free versus paid operation, required retention/RPO/RTO, PITR need, off-site export cadence, and the named restore operator.

## Migration Procedure

This is a future Phase 8.5C execution plan, not authorization to run it now.

1. Human creates `fibreconnect-sa-prod` in `eu-west-1`, confirms PostgreSQL 17.x, enables account MFA, and records project/plan/region without secrets.
2. Human confirms backup and restore capability and creates the approved pre-migration checkpoint.
3. Keep Netlify production traffic disabled or fail-closed.
4. From the exact CI-green release candidate, install with `npm ci` and run `npm run db:generate`.
5. Supply the production direct/session connection only as `DIRECT_URL`. Supply the production pooled runtime connection separately as `DATABASE_URL`; do not print either value.
6. Run `npm run db:migrate`. `prisma.config.ts` prioritizes `DIRECT_URL` for migration execution.
7. Verify the Prisma migration ledger before seeding; stop on any failed, partial, unexpected, or rolled-back migration.
8. After separate human approval of the demo dataset, run `npm run db:seed` with `DATABASE_URL` explicitly bound to the production database.
9. Perform the validation procedure below before any Netlify production traffic.

Execution owner: Codex or a named release operator only in an explicitly approved migration phase, with the human owner controlling credentials and destructive decisions.

## Validation Procedure

Collect and redact the following Phase 8.5C evidence:

- Project name/reference, organization, plan, region, PostgreSQL version, operator, and timestamps.
- Exact Git SHA and Prisma/package versions used.
- `prisma migrate status` and `_prisma_migrations` evidence showing exactly five successful migrations and no rollback/failure.
- 20 application tables plus `_prisma_migrations`; six application enums.
- Primary keys, unique constraints, foreign keys, expected indexes, and representative constraint failures.
- RLS enabled on all 21 public tables; zero unintended policies or browser-role grants.
- Exposed-schema/Data API settings and confirmation that the browser cannot query application tables directly.
- Production extension inventory and confirmation that no unapproved extension was enabled.
- Fresh Security Advisor and Performance Advisor results, classified by severity and disposition.
- Exact approved seed counts: 3 providers, 4 networks, 5 demo packages, 3 demo areas, 4 availability links, and one `catalogue_mode` row with `liveProviderData=false`.
- Absence of seeded users, sessions, tokens, enquiries, personal data, and credentials.
- Prisma read/query smoke through the pooled runtime connection.
- Connection pooling mode, SSL posture, connection limits, and failed-secret redaction checks.
- `/api/ready` must be tested only after the later authorized Netlify linkage; it is not database-only proof.
- Backup dashboard evidence and the named restore path without exposing backup contents or secrets.

## Rollback Considerations

- Before public traffic or user data, a failed migration/seed should stop the release. Prefer recreating the empty production project or restoring its approved pre-migration checkpoint, then rerun the unchanged migration chain after the cause is resolved.
- After production traffic or user data exists, default to a reviewed forward-fix migration. Do not edit applied migrations or invent ad hoc reverse SQL.
- Use Supabase restore/PITR only when the owner accepts downtime and data-loss implications for the selected restore point.
- Schema rollback requires a separately authored, reviewed, rehearsed migration and explicit approval; none exists today.
- Application rollback must keep schema compatibility with the prior deployed SHA. If compatibility is uncertain, fail closed and keep traffic disabled.

## External Blockers

- Human creation of the isolated Supabase production project.
- Supabase organization, plan, spend control, MFA, region, and PostgreSQL-version decisions.
- Backup/PITR/RPO/RTO decision and restorable checkpoint evidence.
- Production credentials entered by the human owner without exposure in repository, output, or chat.
- Explicit migration and demo-seed authorization for Phase 8.5C.
- Netlify plan and Functions-region decision; `dub` requires applicable regional configuration support.
- Production Resend configuration, Netlify linkage, domain choice, smoke testing, and final public-demo approval remain separate later gates.
- Prisma commercial dependency-security risk acceptance remains open.

## Decision

The repository and development evidence support a separate `fibreconnect-sa-prod` Supabase project on PostgreSQL 17.x in `eu-west-1`, with Fastify/Prisma as the sole data boundary, all public tables protected by RLS without browser policies, and only the approved demo seed. Phase 8.5A is complete. Infrastructure creation remains prohibited until explicit Phase 8.5B approval.
