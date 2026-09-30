# WP8 Phase 8.2C-2 Prisma Risk Acceptance

Date accepted: 2026-09-30

Status: ACCEPTED WITH DOCUMENTED RISK FOR PORTFOLIO/PUBLIC DEMO RELEASE

Technical owner: Phathu / FibreConnect project owner

Review deadline: 2026-12-31, or earlier when any review or invalidation trigger below occurs

## Risk Title

Prisma Toolchain High-Severity Transitive Advisories

## Scope

This acceptance covers the following installed Prisma CLI/toolchain packages and npm vulnerability records:

| Package | Installed version | Advisory basis |
| --- | ---: | --- |
| `prisma` | 7.10.0 | High aggregate through `@prisma/config` and `mysql2` |
| `@prisma/config` | 7.10.0 | High aggregate through vulnerable `deepmerge-ts` |
| `deepmerge-ts` | 7.1.5 | `GHSA-ggr8-5vv4-36mx`; fixed in 8.0.0 |
| `mysql2` | 3.15.3 | `GHSA-3f6p-5ww8-9rcr` and `GHSA-rgwj-5xj2-c3m3`; fully fixed in 3.23.1 |

The parent and aggregate records do not represent additional vulnerable application features. `@prisma/client@7.10.0` is a separate runtime dependency and is not directly affected by this advisory chain.

## Release Scope

This risk acceptance applies only to the **FibreConnect SA Portfolio/Public Demo Release**.

It does not automatically approve a **Live Commercial Release**.

## Technical Rationale

- The Prisma CLI chain is not part of normal production request handling.
- `@prisma/client` is not directly affected by the identified advisory chain.
- `deepmerge-ts` exposure is limited to loading trusted, repository-controlled Prisma configuration during CLI operations.
- `mysql2` is unused because FibreConnect uses PostgreSQL exclusively and has no MySQL datasource, adapter, import, endpoint, or connection.
- Netlify production runtime uses the generated Prisma Client and `@prisma/adapter-pg`, rather than the Prisma CLI.
- No critical advisory currently exists in the assessed Prisma chain.
- No demonstrated public request path reaches the vulnerable configuration-merge or MySQL protocol features.
- No stable fixed Prisma parent release is currently suitable; downgrading to Prisma 6 or forcing unsupported transitive overrides would increase compatibility and operational risk.

## Mitigating Controls

- Prisma configuration is repository controlled; no user-controlled Prisma configuration is accepted.
- The application and Supabase database architecture are PostgreSQL only.
- GitHub CI applies a critical dependency advisory gate.
- Dependency findings and reachability are documented in the Phase 8.2 audit and Phase 8.2C-1 assessment.
- Migration and seed operations are controlled operator workflows.
- No forced npm overrides or Prisma downgrades are used.
- Production database access remains behind the Fastify server and generated Prisma Client/PostgreSQL adapter boundary.

## Residual Risk

- The vulnerable transitive packages remain installed in the development and tooling dependency graph.
- Supply-chain and tooling exposure is reduced by current reachability and controls, but is not zero.
- A compromised dependency or trusted workstation/CI environment could affect Prisma CLI operations.
- Future dependency, build, bundling, database, or configuration changes may alter reachability.
- A compatible stable Prisma release that resolves the advisory chain must be adopted when available.

## Release Classification

### Portfolio/Public Demo

**ACCEPTED WITH DOCUMENTED RISK** through 2026-12-31, subject to the earlier review and invalidation triggers below.

### Live Commercial Release

**NOT PERMANENTLY ACCEPTED.** The commercial dependency-security gate remains open. Commercial release requires either a compatible fixed Prisma release or a renewed, explicit, time-bounded acceptance based on current evidence.

## Review Triggers

Review this acceptance at the earliest of:

- before any live commercial release;
- when a stable Prisma release resolving these advisories becomes available;
- after any Prisma CLI, client, or adapter upgrade;
- after material Prisma configuration, migration, build, or deployment changes;
- after any new critical advisory or high-severity runtime-reachable advisory affects this chain;
- 2026-12-31.

## Invalidation Conditions

This acceptance becomes invalid immediately if:

- the Prisma CLI becomes part of production request runtime;
- MySQL support, a MySQL datasource, or a MySQL connection is introduced;
- user-controlled Prisma configuration is introduced;
- Prisma Client becomes directly affected by the advisory chain;
- advisory severity, exploitability, or affected ranges materially change;
- Netlify bundling begins including or executing Prisma CLI paths; or
- new evidence demonstrates public or untrusted-input reachability.

## Required Future Remediation

When a compatible stable fixed Prisma release is available:

1. Upgrade `prisma` and `@prisma/client` together.
2. Upgrade `@prisma/adapter-pg` if required for compatibility.
3. Regenerate the Prisma client and validate the schema and migration workflow.
4. Rerun migration, seed, PostgreSQL integration, and application tests.
5. Rerun the full dependency audit and CI critical gate.
6. Revalidate Netlify build bundling and production runtime behavior.

No remediation action is authorized by this document.

## Repository-Wide Advisory Drift

Phase 8.2C-1 observed 8 repository-wide records: 5 high and 3 moderate. The four Prisma records assessed here remain present. Newly published non-Prisma findings are not accepted or resolved by this document and are **deferred for a separate future dependency-audit refresh if they affect the portfolio release decision**.

## Acceptance Statement

**This is a technical risk acceptance for portfolio/public-demo release only. It is not an independent security certification.**
