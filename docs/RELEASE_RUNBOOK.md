# Release Runbook

## Preconditions

- GitHub CI is green on the exact release commit.
- The release commit is reviewed and `main` is protected from unvalidated direct changes.
- Database migrations have been rehearsed against a disposable PostgreSQL database.
- Netlify production variables match `docs/NETLIFY_DEPLOYMENT.md` and contain no placeholders.
- Supabase backup/PITR status and a restorable checkpoint are confirmed before migrations.
- Transactional email, Turnstile, canonical domain and live provider integrations are either validated or recorded as release blockers.
- Sample catalogue and coverage remain visibly labelled until commercial feeds are approved.

## Deploy

1. Tag the approved commit using `vMAJOR.MINOR.PATCH`.
2. Apply checked-in Prisma migrations using the migration connection, never `db push`.
3. Trigger the Netlify production deploy from the exact tag/commit.
4. Verify `/api/health`, `/api/ready`, homepage, coverage, catalogue, authentication and enquiry submission.
5. Confirm request IDs, error rates and database connection health for at least the initial observation window.
6. Record the deploy URL, commit, migration ledger state and operator in the release record.

## Rollback

Application rollback uses Netlify's previous immutable deploy only when it is compatible with the current database schema. Database migrations are forward-only by default. If a migration is incompatible, stop writes or place the service in maintenance mode, restore the approved database checkpoint, then redeploy the matching application commit.

Never run destructive Prisma reset commands against production. Preserve logs, request IDs and the failed release commit for incident review.

## Backup and Recovery

- Confirm automated Supabase backups and PITR availability under the selected paid plan.
- Test restore into an isolated project before claiming recovery readiness.
- Record recovery point objective and recovery time objective only after a timed restore exercise.
- Keep database credentials, Netlify tokens and provider credentials in their platform secret stores; rotate them after suspected exposure.

## Hotfix

Create a narrowly scoped `hotfix/*` branch from the production tag, add a regression test, run the same CI gates, obtain review, deploy, and merge the fix back to `main`. Emergency speed does not waive migration compatibility, secret scanning or rollback evidence.
