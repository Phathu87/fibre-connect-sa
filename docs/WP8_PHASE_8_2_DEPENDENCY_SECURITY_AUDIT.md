# WP8 Phase 8.2 Dependency Security Audit

Date: 2026-09-28

Status: PASS

Scope: read-only dependency security analysis. No dependency remediation was performed.

## Baseline and Method

- Audited application baseline: `f398bcfb4e611d266f420487955552a279e682f3`
- Audit-time HEAD: `f3aeedc358bf8d5314e0e91b7ff9787a9c12c815`
- Difference from the application baseline: Phase 8.1 documentation only
- Commands executed: `npm audit --json`, `npm audit fix --dry-run --json`, `npm explain`, `npm ls`, and the CI-equivalent `npm audit --audit-level=critical`
- Existing `docs/DEPENDENCY_SECURITY_AUDIT.md` was compared with the current tree. Its historical 17-advisory result is stale; its 2026-09-18 update matches the current total but did not contain the complete current reachability and release-impact analysis below.

## Phase 8.2 Pre-remediation Advisory Counts

| Severity | Count |
| --- | ---: |
| Critical | 0 |
| High | 4 |
| Moderate | 2 |
| Low | 2 |
| Total | 8 |

The eight npm vulnerability records represent three parent dependency chains and six underlying GitHub advisory identifiers. Aggregate parent records inherit severity from their vulnerable children and are listed separately because npm reports them separately.

## Phase 8.2A Remediation Update

Phase 8.2A removed the unused direct `react-quill-new@3.8.3` dependency through npm. Its vulnerable `quill@2.0.3` chain disappeared naturally. The post-removal audit result is:

| Severity | Before | After |
| --- | ---: | ---: |
| Critical | 0 | 0 |
| High | 4 | 4 |
| Moderate | 2 | 2 |
| Low | 2 | 0 |
| Total | 8 | 6 |

- Removed lockfile nodes: `react-quill-new@3.8.3`, `quill@2.0.3`, `quill-delta@5.1.0`, `parchment@3.0.0`, `eventemitter3@5.0.4`, `fast-diff@1.3.0`, `lodash-es@4.18.1`, `lodash.clonedeep@4.5.0`, and `lodash.isequal@4.5.0`.
- `eventemitter3@4.0.7` remains correctly because it is independently required by Recharts.
- `npm ci`: PASS, 789 packages installed and 790 audited.
- `npm run validate`: PASS, including 4 test files / 23 tests and the production build.
- Critical gate: PASS, `npm audit --audit-level=critical` exit code 0.
- No unrelated package version changed.

The Quill rows below are retained as historical pre-remediation evidence and are no longer present in the current audit.

## Phase 8.2B-2 Remediation Update

Phase 8.2B-2 upgraded the direct `react-router-dom` dependency from 6.30.6 to 7.18.4, which resolved `react-router@7.18.4` transitively. The post-upgrade audit result is:

| Severity | Before 8.2B-2 | After 8.2B-2 |
| --- | ---: | ---: |
| Critical | 0 | 0 |
| High | 4 | 4 |
| Moderate | 2 | 0 |
| Low | 0 | 0 |
| Total | 6 | 4 |

- `GHSA-wrjc-x8rr-h8h6`: no longer reported.
- `GHSA-337j-9hxr-rhxg`: no longer reported.
- `npm ci`: PASS, 788 packages installed and 789 audited.
- `npm run validate`: PASS, including 5 test files / 40 tests and the production build.
- Focused routing/security suite: PASS, 17 tests.
- Critical gate: PASS, `npm audit --audit-level=critical` exit code 0.
- Existing declarative `BrowserRouter` / `Routes` architecture and public URLs were preserved.
- No unrelated dependency version changed.

The React Router rows below are retained as historical pre-remediation evidence and are no longer present in the current audit.

## Phase 8.2C-1 Prisma Advisory Assessment Update

The installed Prisma chain remains `prisma@7.10.0 -> @prisma/config@7.10.0 -> deepmerge-ts@7.1.5` plus `prisma@7.10.0 -> mysql2@3.15.3`. `prisma` is a direct devDependency; the other three are transitive CLI dependencies. `@prisma/client@7.10.0` and `@prisma/adapter-pg@7.10.0` are separate runtime dependencies and are not directly affected by these four npm records.

Prisma 7.10.0 is the latest stable Prisma 7 release. No stable fixed Prisma parent currently exists. npm still proposes `prisma@6.19.3`, which is an inappropriate major downgrade from the validated Prisma 7 config, adapter, generated-client, migration, and ESM architecture. Forcing `deepmerge-ts@8` or `mysql2@3.23.1` through npm overrides would bypass Prisma's exact tested dependency pins and is not recommended.

Reachability is limited to trusted tooling:

- `deepmerge-ts` is executable while the CLI loads repository-controlled `prisma.config.ts`; it is not imported by Fastify, Prisma Client queries, or the Netlify function request path.
- Both mysql2 issues require an actual MySQL protocol connection. FibreConnect uses PostgreSQL/Supabase through `@prisma/adapter-pg` and has no MySQL datasource, adapter, import, or connection.
- The Netlify function traces the Fastify app, generated client, and PostgreSQL adapter. The Prisma CLI is not imported, externalized, or explicitly included in the production function.

Disposition: portfolio/public demo release is **ACCEPTABLE WITH DOCUMENTED RISK**; a future live commercial release **REQUIRES REMEDIATION OR FORMAL TIME-BOUND RISK ACCEPTANCE**. The recommended next phase is Phase 8.2C-2 - Prisma Risk Acceptance Documentation.

Audit-count drift discovered during this read-only assessment: the live registry now reports 8 total records (5 high, 3 moderate), not the prior 4. The four Prisma records remain present; the additional newly published non-Prisma findings are out of scope for 8.2C-1 and require separate triage. No fix was applied.

## Advisory Inventory (Phase 8.2 Pre-remediation)

| Package | Severity | Direct/Transitive | Prod/Dev | Reachability | Fix | Breaking? | Portfolio Blocker? | Commercial Blocker? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `deepmerge-ts@7.1.5` | High | Transitive via `prisma -> @prisma/config` | CLI/build/migration tooling (`devOptional` in lockfile) | Prisma configuration merging is executed by CLI commands, but configuration is repository-controlled; no public recursive object graph reaches it | Parent change required; npm points to `prisma@6.19.3` | Yes; forced Prisma major downgrade | No | No demonstrated runtime blocker; remediate through a compatible upstream Prisma release |
| `@prisma/config@7.10.0` | High | Transitive via `prisma` | CLI/build/migration tooling (`devOptional`) | Installed for Prisma CLI; not imported by Fastify or Netlify runtime | Same parent change as `deepmerge-ts` | Yes; forced Prisma major downgrade | No | No demonstrated runtime blocker; track and remediate before relying on untrusted Prisma configuration |
| `mysql2@3.15.3` | High aggregate | Transitive via `prisma` | CLI tooling (`devOptional`) | Not applicable to the configured PostgreSQL runtime; no MySQL import, datasource, or connection exists | Parent change required; npm points to `prisma@6.19.3` | Yes; forced Prisma major downgrade | No | No for the current PostgreSQL architecture |
| `prisma@7.10.0` | High aggregate | Direct dev dependency; optional peer of `@prisma/client` | CLI/build/migration, not request handling | CLI executes generation/migrations; its vulnerable config input is repository-controlled and its MySQL path is unused | npm suggests `6.19.3` only with `--force` | Yes; major downgrade from 7.10.0 | No | No immediate blocker; compatible upstream remediation remains required technical debt |
| `react-router@6.30.6` | Moderate | Transitive via `react-router-dom` | Production dependency | Client routing executes in production. Observed `Link` and `navigate` destinations are constants or internally formed paths; no untrusted backslash destination was found. The app is a Vite SPA and does not use SSR hydration or `deserializeErrors()` | Upgrade parent to `react-router-dom@7.18.4` | Yes; major router migration | No | Yes before a live commercial release unless focused validation proves the open-redirect path remains structurally impossible |
| `react-router-dom@6.30.6` | Moderate aggregate | Direct | Production dependency | Actively used for SPA routing; inherits the two React Router advisories, with the current affected features constrained as above | npm suggests `7.18.4` only with `--force` | Yes; major router migration | No | Yes; controlled upgrade and routing regression validation required |
| `quill@2.0.3` | Low | Transitive via `react-quill-new` | Declared production tree | No import or editor usage was found, and the vulnerable HTML export feature is not executed | npm suggests parent `react-quill-new@3.7.0`; removal is safer because the parent is unused | Yes according to npm; proposed parent downgrade is outside the declared range | No | No current path; remove unused parent before commercial release |
| `react-quill-new@3.8.3` | Low aggregate | Direct | Declared production dependency | Installed but not imported by application, server, or Netlify code | npm suggests downgrade to `3.7.0`; minimum project-specific action is removal after confirmation | Yes according to npm; downgrade/removal requires controlled change | No | No immediate blocker; unnecessary vulnerable dependency should not remain for commercial release |

## Underlying Advisories

### `GHSA-ggr8-5vv4-36mx` - DeepmergeTS stack exhaustion

- Affected package/range: `deepmerge-ts <8.0.0`
- Installed: `7.1.5`
- Chain: root dev `prisma@7.10.0` -> `@prisma/config@7.10.0` -> `deepmerge-ts@7.1.5`
- Affected function: merging recursive object graphs can exhaust the stack.
- FibreConnect path: Prisma CLI configuration parsing during validation, generation, migration, or seed workflows. Inputs are repository/operator controlled, not public request data.
- Classification: **BUILD/DEVELOPMENT ONLY** for the deployed request runtime.
- Remediation: **TRANSITIVE - PARENT UPGRADE REQUIRED**. npm offers only a forced downgrade to Prisma 6.19.3; no non-breaking fix was proposed.
- Complexity: MEDIUM, pending a compatible Prisma release and database workflow validation.

### `GHSA-3f6p-5ww8-9rcr` - MySQL clear-password downgrade

- Affected package/range: `mysql2 <3.22.0`
- Installed: `3.15.3`
- Chain: root dev `prisma@7.10.0` -> `mysql2@3.15.3`
- Affected function: a malicious MySQL server can trigger authentication downgrade and plaintext credential disclosure.
- FibreConnect path: none. The Prisma datasource is `postgresql`, runtime database access uses `@prisma/adapter-pg`, and no MySQL connection or import exists.
- Classification: **RUNTIME INSTALLED BUT AFFECTED FEATURE NOT USED**; operationally CLI-only in this application.
- Remediation: **NOT APPLICABLE TO CURRENT RUNTIME PATH**, while retaining the parent-upgrade tracking item.
- Complexity: MEDIUM as part of a future compatible Prisma parent update; do not downgrade Prisma.

### `GHSA-rgwj-5xj2-c3m3` - MySQL compressed-protocol decompression DoS

- Affected package/range: `mysql2 <=3.23.0`
- Installed: `3.15.3`
- Chain: root dev `prisma@7.10.0` -> `mysql2@3.15.3`
- Affected function: unbounded inflate while handling compressed MySQL protocol data.
- FibreConnect path: none; FibreConnect connects only to PostgreSQL.
- Classification: **RUNTIME INSTALLED BUT AFFECTED FEATURE NOT USED**.
- Remediation: **NOT APPLICABLE TO CURRENT RUNTIME PATH**, with removal/update dependent on Prisma's transitive tree.
- Complexity: MEDIUM as part of a future Prisma parent update.

### `GHSA-wrjc-x8rr-h8h6` - React Router backslash open redirect

- Affected package/range: `react-router >=6.0.0 <7.18.0`
- Installed: `6.30.6`
- Chain: direct `react-router-dom@6.30.6` -> `react-router@6.30.6`
- Affected function: `<Link>` and `useNavigate()` destinations containing crafted backslash forms.
- FibreConnect path: routing is active in production, but inspected destinations are fixed application paths or internally constructed slugs. No public input is passed directly as a navigation destination.
- Classification: **RUNTIME INSTALLED BUT AFFECTED FEATURE NOT USED** based on the current code; the package itself is runtime reachable.
- Remediation: **CONTROLLED MAJOR UPGRADE REQUIRED** to React Router DOM 7.18.4 or later according to npm.
- Complexity: MEDIUM because route behavior, protected routes, query handling, navigation, and browser history require regression testing.

### `GHSA-337j-9hxr-rhxg` - React Router SSR hydration constructor injection

- Affected package/range: `react-router >=6.4.0 <7.18.0`
- Installed: `6.30.6`
- Chain: direct `react-router-dom@6.30.6` -> `react-router@6.30.6`
- Affected function: `deserializeErrors()` during React Router SSR hydration.
- FibreConnect path: none found. The frontend uses `BrowserRouter` in a Vite SPA and has no React Router SSR hydration or `createStaticRouter` path.
- Classification: **RUNTIME INSTALLED BUT AFFECTED FEATURE NOT USED**.
- Remediation: **CONTROLLED MAJOR UPGRADE REQUIRED** as part of the same router upgrade.
- Complexity: MEDIUM.

### `GHSA-v3m3-f69x-jf25` - Quill HTML export XSS

- Affected package/range: `quill =2.0.3`
- Installed: `2.0.3`
- Chain: direct `react-quill-new@3.8.3` -> `quill@2.0.3`
- Affected function: exporting crafted editor content to HTML.
- FibreConnect path: none found. `react-quill-new`, Quill, and the Quill HTML export API are not imported or called.
- Classification: **RUNTIME INSTALLED BUT AFFECTED FEATURE NOT USED**.
- Remediation: npm proposes a forced downgrade to `react-quill-new@3.7.0`. For this repository, **NOT APPLICABLE TO CURRENT RUNTIME PATH** and controlled removal of the unused direct dependency is the minimum safe cleanup.
- Complexity: SMALL, followed by lockfile install and full validation.

## Reachability Summary

### Runtime reachable

- `react-router-dom` / `react-router` execute in the production SPA. The currently vulnerable destination and SSR features were not found to receive untrusted input or execute, respectively.

### Runtime installed but affected feature not used

- `mysql2`: no MySQL datasource or connection; PostgreSQL only.
- `quill` / `react-quill-new`: no imports or editor/export execution.
- React Router backslash redirect: no user-controlled navigation destination found.
- React Router SSR hydration: no SSR hydration path exists.

### Build/development only

- `prisma`, `@prisma/config`, and `deepmerge-ts`: Prisma CLI generation, validation, migration, and seed tooling. They are not imported by the Fastify/Netlify request runtime.

### Uncertain

- No current advisory remains unclassified. Reachability must be reassessed if routing begins accepting external redirect destinations, SSR is introduced, MySQL is adopted, editor functionality is enabled, or Prisma configuration becomes untrusted.

## npm Remediation Proposal

`npm audit fix --dry-run --json` proposed zero additions, changes, or removals without force. npm reports that resolving all current records requires breaking actions:

- Prisma chain: force-install `prisma@6.19.3`, a major downgrade from 7.10.0.
- Router chain: force-install `react-router-dom@7.18.4`, a major upgrade from 6.30.6.
- Quill chain: force-install `react-quill-new@3.7.0`, a downgrade from 3.8.3 and outside the declared range.

None of these changes should be applied automatically. In particular, the Prisma downgrade would move away from the currently validated Prisma 7 architecture.

## Release Impact

### Portfolio/Public Demo Release

- Immediate dependency blocker: **NO**.
- No critical advisory exists.
- No high-severity advisory has a demonstrated public production request path.
- The React Router and unused editor findings have been remediated and verified by clean install, automated validation, and fresh audit evidence.
- Release should retain the current CI critical gate. The rendered React Router regression phase is complete.

### Future Live Commercial Release

- Immediate high-severity runtime blocker: **NO based on the current PostgreSQL and request architecture**.
- React Router package-level blocker: **RESOLVED** by the validated 7.18.4 migration and focused automated regression tests.
- The unused editor dependency was removed in Phase 8.2A.
- Rendered browser regression validation is complete: desktop, exact mobile, history, redirect safety, normal-user denial, and authorised-administrator routing all passed.
- The Prisma CLI chain should be remediated through a compatible upstream parent release, not npm's forced downgrade. Until then, Prisma configuration and migration execution must remain trusted operator-controlled activities.

## Minimum Safe Remediation Set

1. Track a compatible Prisma release whose dependency tree fixes `deepmerge-ts` and `mysql2`; upgrade Prisma CLI and client together and rerun generation, migrations, PostgreSQL integration, and runtime tests. Do not apply the proposed 7.10.0 -> 6.19.3 downgrade. Complexity: **MEDIUM**.

Completed in Phase 8.2A: removal of unused `react-quill-new` and its transitive vulnerable Quill chain.

Completed in Phase 8.2B-2: upgrade to `react-router-dom@7.18.4` / `react-router@7.18.4`, removal of both moderate router records, and focused automated routing/security coverage.

## Proposed Remediation Phases

- **Phase 8.2A - Remove Unused Editor Dependency (SMALL): COMPLETED.** `react-quill-new` and its Quill chain were removed; clean install, validation, build, and audit passed.
- **Phase 8.2B-2 - React Router Security Upgrade (MEDIUM): COMPLETED.** The v7 dependency migration and focused automated tests passed.
- **Phase 8.2B-3 - Rendered Routing Regression Validation: COMPLETED.** Public, protected, mobile, history, redirect-security, and authorised-administrator scenarios passed under React Router 7.18.4.
- **Phase 8.2C - Prisma Toolchain Advisory Resolution (MEDIUM):** when a compatible fixed Prisma line is available, update CLI/client together and validate PostgreSQL generation, migration, seed, integration, and Netlify runtime behavior.

## CI Critical Gate Verification

- Workflow command: `npm audit --audit-level=critical`
- Current result: exit code 0 with 0 critical advisories.
- The command still reports lower-severity findings while failing only when npm reports a critical advisory, which matches the configured critical-only release gate.
- CI configuration was not modified.

## Integrity Verification

- `package.json`: only `react-router-dom` changed from the v6 range to exact `7.18.4` during Phase 8.2B-2.
- `package-lock.json`: only the matching router dependency graph changed.
- Application routing architecture and URLs: unchanged.
- Minimal source change: exported the existing `AuthenticatedApp` component for focused route testing.
- Tests: added the scoped routing/security suite.
- Full validation and fresh audit completed successfully after the changes.

## Phase Decision

- Acceptance status: PASS
- Portfolio/public demo dependency release blocker: NO
- Future live commercial dependency work required: YES
- React Router remediation status: COMPLETE
- Assessed Prisma records: 4 high aggregate records in the Prisma CLI chain; **ACCEPTED WITH DOCUMENTED RISK FOR PORTFOLIO RELEASE** under `docs/WP8_PHASE_8_2C2_PRISMA_RISK_ACCEPTANCE.md`
- Commercial Prisma disposition: **REMEDIATION REQUIRED BEFORE/AT COMMERCIAL RELEASE GATE**, unless a renewed explicit time-bounded acceptance is approved from current evidence
- Current repository-wide audit: 8 total, 5 high, 3 moderate, 0 critical; newly published non-Prisma records require separate triage
- Repository-wide advisory drift: newly published non-Prisma findings are **deferred for a separate future dependency-audit refresh if they affect the portfolio release decision**; they are not treated as resolved by the Prisma acceptance
- Portfolio/public-demo Phase 8.2 dependency-security status: COMPLETE
- Commercial dependency-security gate: OPEN
- Recommended next phase: Phase 8.3 - Netlify Configuration Audit
- Safe to proceed after explicit approval: YES
