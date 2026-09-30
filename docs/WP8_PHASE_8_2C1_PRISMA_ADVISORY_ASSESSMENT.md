# WP8 Phase 8.2C-1 Prisma Toolchain Advisory Assessment

Date: 2026-09-30

Status: PASS

## Scope and Method

This read-only assessment covers the four npm vulnerability records owned by the installed Prisma CLI chain: `prisma`, `@prisma/config`, `deepmerge-ts`, and `mysql2`. No dependency, lockfile, generated client, schema, migration, Netlify setting, or database state was changed.

Commands used included `npm ls`, `npm explain`, `npm audit --json`, `npm audit fix --dry-run --json`, and `npm view`. Repository imports, `netlify.toml`, the Netlify function entry, Prisma configuration, and database client construction were also inspected.

The live registry audit changed after the prior phase: it now reports 8 records (5 high, 3 moderate), including newly published non-Prisma findings. Those unrelated findings are outside this phase and do not alter the four-record Prisma assessment below.

## Installed Versions

| Package | Installed | Classification |
| --- | ---: | --- |
| `prisma` | 7.10.0 | Direct devDependency; CLI/toolchain |
| `@prisma/client` | 7.10.0 | Direct runtime dependency |
| `@prisma/config` | 7.10.0 | Transitive through `prisma` |
| `deepmerge-ts` | 7.1.5 | Transitive through `@prisma/config` |
| `mysql2` | 3.15.3 | Transitive through `prisma` |
| `@prisma/adapter-pg` | 7.10.0 | Direct runtime dependency; PostgreSQL adapter |

`@prisma/client` is not directly affected by any of the four Prisma vulnerability records. Its optional peer relationship with `prisma` does not make the CLI's `@prisma/config`, `deepmerge-ts`, or `mysql2` dependencies part of Prisma Client query execution.

## Dependency Graph

```text
root devDependency prisma@7.10.0
|- @prisma/config@7.10.0
|  `- deepmerge-ts@7.1.5
`- mysql2@3.15.3

root runtime dependency @prisma/client@7.10.0
root runtime dependency @prisma/adapter-pg@7.10.0
`- PostgreSQL runtime path (not mysql2)
```

`prisma@7.10.0` declares exact dependencies on `@prisma/config@7.10.0` and `mysql2@3.15.3`. Directly removing `mysql2` is therefore not an appropriate remediation; the package is owned by the Prisma CLI parent.

## Advisory Table

| npm record | Underlying advisory | Severity | Affected / installed | Feature and FibreConnect use | Fixed version / remediation |
| --- | --- | --- | --- | --- | --- |
| `deepmerge-ts` | `GHSA-ggr8-5vv4-36mx` | High | `<8.0.0`; 7.1.5 | Recursive object-graph merge can exhaust the stack. Prisma config loading uses this package, but FibreConnect config is repository-controlled and contains plain non-cyclic data. | `deepmerge-ts@8.0.0`; no stable Prisma parent currently consumes it |
| `@prisma/config` | Aggregate via `deepmerge-ts` | High | npm range through `8.1.0-dev.4`; 7.10.0 | Loads and merges `prisma.config.ts` for CLI commands. Not imported by request runtime. | npm proposes parent `prisma@6.19.3`, an unsuitable major downgrade |
| `mysql2` | `GHSA-3f6p-5ww8-9rcr`; `GHSA-rgwj-5xj2-c3m3` | High aggregate | `<3.22.0` and `<=3.23.0`; 3.15.3 | Credential downgrade and compressed-protocol inflation require a MySQL connection/server. FibreConnect uses PostgreSQL and `@prisma/adapter-pg`; no MySQL datasource/import/connection exists. | 3.22.0 and 3.23.1 respectively; no stable Prisma 7 parent currently consumes the fully fixed line |
| `prisma` | Aggregate via `@prisma/config` and `mysql2` | High | npm range through `8.1.0-dev.6`; 7.10.0 | Direct CLI parent. Executed for validation, generation, migration, and seed workflows, not HTTP request handling. | npm proposes 6.19.3 with a semver-major downgrade; no suitable stable fixed parent is available |

The four npm records represent three underlying advisory IDs. The parent/aggregate records do not introduce separate vulnerable application features.

## Runtime Reachability

### Application Runtime and Prisma Client

The Fastify database path imports the generated Prisma client and constructs it with `@prisma/adapter-pg`. Application code does not import `prisma`, `prisma/config`, `@prisma/config`, `deepmerge-ts`, or `mysql2`.

- `@prisma/client` query execution: not affected by these four records.
- `deepmerge-ts`: not reachable from ordinary Fastify requests or Prisma Client queries.
- `mysql2`: not reachable because no MySQL adapter, datasource, connection, or server is used.

### Prisma CLI and Database Operations

`prisma validate`, `prisma generate`, migrations, and seed workflows load the Prisma CLI and its repository-controlled `prisma.config.ts`. This makes the `deepmerge-ts` package executable in CLI/config-loading contexts, but no user-controlled or network-derived recursive object graph enters that configuration. Migration and seed execution remain trusted operator activities.

`mysql2` is installed with the CLI package, but ordinary PostgreSQL validate/generate/migrate/seed operations do not create a MySQL connection. Both mysql2 advisories require execution of MySQL protocol functionality against a malicious or compromised MySQL endpoint; that prerequisite is absent.

## Environment Exposure

| Environment | Assessment |
| --- | --- |
| Local development | Prisma CLI and config loader reachable under developer control; mysql2 affected functionality not used |
| GitHub CI | CLI reached by validate/generate and PostgreSQL jobs; repository-controlled config only; no MySQL path |
| Netlify build | Dev dependencies may be installed, but `npm run build` runs Vite only and does not invoke Prisma CLI |
| Netlify production runtime | Netlify function traces `netlify/functions/api.ts` into Fastify, generated client, and `@prisma/adapter-pg`; no CLI/config/mysql2 import exists |
| Production database operations | CLI/config loader reachable only in controlled migration/seed operations; PostgreSQL adapter used, not mysql2 |

`netlify.toml` externalizes only `argon2`. It does not externalize or explicitly include the Prisma CLI. The function entry imports the Fastify app and runtime environment loader; the request database path imports the generated client plus `@prisma/adapter-pg`. Repository and import evidence therefore supports exclusion of the CLI-only advisory chain from the production request bundle.

## MySQL Relevance

The mysql2 advisories are NOT APPLICABLE to FibreConnect's current PostgreSQL request and database-operation architecture. Merely installing `mysql2` beneath the Prisma CLI does not exercise MySQL authentication switching or compressed protocol handling. This conclusion must be revisited if a MySQL datasource, adapter, connection, or Prisma tool feature that opens MySQL connections is introduced.

## Available Prisma Versions

- Installed Prisma CLI: 7.10.0.
- Latest stable Prisma 7 CLI: 7.10.0.
- Registry `prev` tag: 7.10.0.
- Registry `latest` for the `prisma` package: 8.0.0 release candidate at assessment time, not a stable Prisma 7 patch/minor.
- Prisma Client stable line used by this application: 7.10.0.
- Development candidate beyond the npm affected range: 8.1.0-dev.7; not a stable release and not an acceptable production target.

No stable fixed Prisma parent release exists for the four-record chain. Consequently there is no PATCH, MINOR, or production-ready MAJOR upgrade target to recommend today.

Prisma's supported upgrade guidance treats the CLI/client architecture together. For this Prisma 7 application, any eventual stable Prisma 7 update should keep `prisma`, `@prisma/client`, and the PostgreSQL adapter aligned and rerun generation, migrations, PostgreSQL integration, and Netlify validation. Prisma 8 is a separate migration with different CLI/configuration architecture and is not a drop-in advisory fix.

## Downgrade Assessment

The npm proposal to install `prisma@6.19.3` is not appropriate:

- It is a major downgrade from the validated Prisma 7 architecture.
- FibreConnect uses Prisma 7 `prisma.config.ts`, explicit environment loading, driver adapters, and generated-client behavior.
- Prisma 7 changed CLI flags, config handling, generation, migration behavior, ESM expectations, and adapter requirements relative to Prisma 6.
- Downgrading only the CLI would misalign it with `@prisma/client@7.10.0` and the generated client.
- A coordinated downgrade would unnecessarily reopen migrations, generation, PostgreSQL runtime, CI, and Netlify compatibility that are already verified.

Downgrade appropriate: NO.

## Override Assessment

An npm override could technically attempt to force `deepmerge-ts@8` or `mysql2@3.23.1`, but it is not an evidence-backed remediation here:

- `@prisma/config@7.10.0` pins `deepmerge-ts` exactly to 7.1.5; forcing a transitive major version bypasses the parent's tested contract.
- `prisma@7.10.0` pins `mysql2` exactly to 3.15.3; forcing it would create an unsupported internal dependency combination.
- A green audit would not prove Prisma CLI, generation, migration, or seed compatibility.

Overrides appropriate: NO without upstream Prisma support and a separately approved compatibility-validation phase.

## Release Impact

### Portfolio/Public Demo Release

Classification: **ACCEPTABLE WITH DOCUMENTED RISK**.

There is no critical advisory, no affected Prisma Client record, no public request path to the config merge, no MySQL path, and no evidence that the Prisma CLI is bundled into the Netlify request function. Existing controls are real: trusted repository configuration, PostgreSQL-only adapters, operator-controlled migrations, and a CI critical gate.

The critical-only CI gate remains sufficient for this portfolio release when paired with explicit documented risk acceptance and continued advisory monitoring. The newly observed non-Prisma audit drift requires a separate scoped assessment rather than silent inclusion here.

### Future Live Commercial Release

Classification: **REQUIRES REMEDIATION OR FORMAL TIME-BOUND RISK ACCEPTANCE**.

The current four records do not establish runtime exploitability, but a commercial release should not carry indefinite high-severity toolchain waivers. Recheck for a stable fixed Prisma parent before release; if none exists, require an owner, review date, trusted-config controls, PostgreSQL-only constraint, and a selected-high policy that fails CI for runtime-reachable findings while allowing explicitly reviewed dev-only exceptions.

## Recommended Remediation

Do not downgrade Prisma, adopt a Prisma 8 release candidate, add overrides, or remove mysql2 manually. Keep the currently validated Prisma 7.10.0 stack and document a time-bound risk acceptance. Monitor for a stable Prisma parent that removes/fixes both transitive chains. When one exists, upgrade the Prisma CLI/client/adapter set together in a separately approved phase and rerun clean install, generation, schema validation, migration safety, seed, PostgreSQL integration, full validation, Netlify bundling, and audit.

## Recommended Next Phase

**Phase 8.2C-2 - Prisma Risk Acceptance Documentation**

This is the only justified next Prisma action because no stable fixed parent exists and the affected features are outside the production request path.
