# Dependency Security Audit

Date: 2026-09-17

Source: live `npm audit --json` and `npm explain` output. No dependency changes were made during this audit.

## Current Result

| Severity | Count |
| --- | ---: |
| Critical | 0 |
| High | 8 |
| Moderate | 6 |
| Low | 3 |
| Total | 17 |

The audit reports package findings, not eight independent remotely exploitable production paths. The application uses PostgreSQL through `@prisma/adapter-pg`; it does not use MySQL. ESLint, Tailwind, PostCSS, Autoprefixer, Prisma CLI and their configuration parsers execute in development, build or migration environments rather than in public HTTP request handling.

## High-Severity Findings

| Package | Dependency path | Advisory | Runtime exposure and exploitability | Remediation | Decision |
| --- | --- | --- | --- | --- | --- |
| `brace-expansion@1.1.16` | root dev `eslint` -> `minimatch` -> `brace-expansion` | `GHSA-mh99-v99m-4gvg`, `GHSA-rgw5-rvv9-x895`: unbounded expansion can cause OOM | Development-only lint path. FibreConnect does not pass public patterns to ESLint/minimatch. | Non-breaking lockfile refresh to `1.1.18` is available. | **FIX DURING CURRENT MIGRATION** |
| `browserslist@4.28.1` | root dev `autoprefixer` -> `browserslist` | `GHSA-c83g-rgw3-j3cx`, `GHSA-73wf-gq98-2v4g`: memory growth and unsafe custom stats handling | Development/build-only. The build uses repository-controlled browser queries and no untrusted custom stats file. | Non-breaking refresh to `4.28.9` is available. | **FIX DURING CURRENT MIGRATION** |
| `js-yaml@4.3.0` | root dev `eslint` -> `@eslint/eslintrc` -> `js-yaml` | `GHSA-5p4m-2wfm-xmqj`, `GHSA-2883-xcg3-v3hh`: crafted YAML can cause excessive CPU use | Development-only lint configuration path. No user-controlled YAML is parsed by the application. | Non-breaking refresh to `4.3.2` is available. | **FIX DURING CURRENT MIGRATION** |
| `nanoid@3.3.16` | root dev `postcss` -> `nanoid` | `GHSA-2v37-7h3g-55p8`: custom generator can loop when size is zero | Build-tool path. FibreConnect does not invoke Nano ID custom generators or expose them to requests. | Non-breaking refresh to `3.3.18` is available. | **FIX DURING CURRENT MIGRATION** |
| `deepmerge-ts@7.1.5` | root dev `prisma` -> `@prisma/config` -> `deepmerge-ts` | `GHSA-ggr8-5vv4-36mx`: recursive object graphs can exhaust the stack | Prisma CLI/configuration path. Prisma configuration is repository-controlled; no public object graph reaches this package. | Audit proposes Prisma `6.19.3`, a major downgrade from Prisma 7.10.0. Await a compatible Prisma release or validated override. | **ACCEPT TEMPORARILY WITH DOCUMENTED RISK** |
| `@prisma/config@7.10.0` | root dev `prisma` -> `@prisma/config` | Inherits the `deepmerge-ts` finding | Development/migration tooling only. Not imported by the running Fastify application. | Same incompatible major-downgrade recommendation as above. | **ACCEPT TEMPORARILY WITH DOCUMENTED RISK** |
| `mysql2@3.15.3` | root dev `prisma` -> `mysql2` | `GHSA-3f6p-5ww8-9rcr` credential downgrade; `GHSA-rgwj-5xj2-c3m3` decompression DoS | Not applicable to the selected PostgreSQL runtime. FibreConnect does not configure or connect to MySQL. The package is bundled transitively by Prisma CLI. | Audit proposes a major Prisma downgrade. Remove through a compatible Prisma release when available. | **FALSE/NOT APPLICABLE AFTER ANALYSIS** |
| `prisma@7.10.0` | direct dev dependency; aggregates `@prisma/config` and `mysql2` | Aggregate high severity from the two transitive chains above | CLI is used for generation and migrations, not public request processing. Repository-controlled config limits the `deepmerge-ts` path; MySQL code is unused. | Do not apply the suggested forced downgrade to `6.19.3`. Track an upstream compatible fix and validate migration behavior before changing Prisma versions. | **ACCEPT TEMPORARILY WITH DOCUMENTED RISK** |

## Non-Breaking Remediation Candidate

`npm audit fix --dry-run --json` reports a non-forced lockfile refresh for several findings, including `brace-expansion`, `browserslist`, `js-yaml`, `nanoid`, React Router, DOMPurify and related build dependencies. This was intentionally not applied during the blocked database execution gate. It should be performed as a controlled dependency change followed by `npm run validate` and browser regression checks.

## Release Decision

- Critical realistically exploitable production findings: **0 identified**.
- High findings with a demonstrated public runtime path: **0 identified**.
- High findings still requiring remediation or upstream resolution: **7**.
- High finding classified not applicable to the PostgreSQL application runtime: **1** (`mysql2`).
- Dependency security work remains an open release item; the current result does not justify forced major version changes or a Prisma downgrade.

This classification must be revisited after dependency updates and before production release. A fresh registry audit is required because advisory data changes over time.

## 2026-09-18 Update

After WP4, `npm audit fix` was applied without `--force` and followed by validation. The result fell from 17 advisories to 8: 2 low, 2 moderate and 4 high. Remaining findings require breaking changes: a Prisma major downgrade, a React Router major upgrade, or an editor package downgrade. None was forced into the verified application. The Argon2 dependency is runtime-tested successfully.
