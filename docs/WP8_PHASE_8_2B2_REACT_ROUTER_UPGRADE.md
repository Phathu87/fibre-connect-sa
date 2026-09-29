# WP8 Phase 8.2B-2 React Router Security Upgrade

Date: 2026-09-29

Status: PASS

## Objective

Upgrade FibreConnect to the verified fixed React Router 7 target while preserving the declarative Vite SPA architecture and adding focused code-level routing and redirect-security regression coverage.

## Compatibility Baseline

| Component | Version | React Router 7.18.4 requirement | Result |
| --- | --- | --- | --- |
| Node | 22.21.0 locally; 22 in CI | >=20.0.0 | Compatible |
| React | 18.2.0 declared | >=18 | Compatible |
| React DOM | 18.2.0 declared | >=18 | Compatible |
| Vite | 8.2.0 declared | No v7 declarative-mode conflict identified | Compatible |
| TypeScript | 5.8.2 declared | No v7 JavaScript-project conflict identified | Compatible |

Immediate post-upgrade frontend and server TypeScript checks passed without API compatibility errors.

## Dependency Upgrade

| Package | Before | After | Relationship |
| --- | --- | --- | --- |
| `react-router-dom` | 6.30.6, declared `^6.26.0` | 7.18.4, declared exact | Direct |
| `react-router` | 6.30.6 | 7.18.4 | Transitive |

The v6-only `@remix-run/router@1.23.4` lockfile node disappeared. React Router 7 added its expected `cookie` and `set-cookie-parser` dependency metadata. No unrelated package version changed, and `react-router` was not added as a direct dependency.

## Routing and Source Changes

- Architecture remains declarative `BrowserRouter` / `Routes`.
- All existing public, auth, account, admin, parameterized, and fallback URLs remain unchanged.
- Existing imports from `react-router-dom` remain valid under v7.
- No migration to `createBrowserRouter`, `RouterProvider`, data routers, loaders, actions, framework mode, SSR, hydration, or RSC occurred.
- No compatibility edit to routing behavior was required.
- `AuthenticatedApp` was exported from `src/App.jsx` so the real application route tree could be exercised directly by focused tests. Runtime rendering and behavior are unchanged.
- Existing `safeReturnTo()` sanitization was preserved without modification.

## Tests Added

Created `tests/routing.test.jsx` using the existing Vitest and React DOM stack. No additional test framework or dependency was added.

The 17 focused tests cover:

- Public home route
- Package listing route
- Parameterized package detail route
- Coverage route
- Login route
- Wildcard/not-found route
- Query parameter preservation on an internal enquiry route
- Anonymous account guard redirect target and replace semantics
- Authenticated account access
- Non-admin admin-route rejection target and replace semantics
- Authorized admin access
- Valid same-origin `returnTo`
- External `returnTo` rejection
- Protocol-relative and backslash escape rejection
- Removal of authentication-shaped query parameters from a safe return path

The route tests server-render the existing `AuthenticatedApp` route tree through `MemoryRouter`. Browser back/forward, scroll, hash behavior, responsive navigation, direct hosted deep links, and deployed Netlify fallback behavior remain reserved for Phase 8.2B-3.

## Validation

### Clean install

- Command: `npm ci --cache .npm-cache`
- Result: PASS
- Packages installed: 788
- Packages audited: 789
- The repository-local cache worked around the known inaccessible Windows AppData npm cache and was removed afterward.

### TypeScript

- Immediate post-upgrade frontend TypeScript: PASS
- Immediate post-upgrade server TypeScript: PASS
- TypeScript within final full validation: PASS

### Focused suite

- Command: `npx vitest run tests/routing.test.jsx`
- Result: PASS
- Test files: 1
- Tests: 17

### Full validation

- Command: `npm run validate`
- Result: PASS
- Prisma schema validation: PASS
- Prisma client generation: PASS
- ESLint: PASS
- Frontend/server TypeScript: PASS
- Test files: 5 passed
- Tests: 40 passed (23 existing plus 17 new)
- Production build: PASS

Build output:

- JavaScript bundle: 860.93 kB, 213.95 kB gzip
- Existing Vite warning for chunks larger than 500 kB remains deferred; no optimization was attempted.

## Security Audit

| Severity | Before | After | Change |
| --- | ---: | ---: | ---: |
| Critical | 0 | 0 | 0 |
| High | 4 | 4 | 0 |
| Moderate | 2 | 0 | -2 |
| Low | 0 | 0 | 0 |
| Total | 6 | 4 | -2 |

Post-upgrade audit records:

- `@prisma/config`
- `deepmerge-ts`
- `mysql2`
- `prisma`

React Router audit records remaining: **NO**.

Resolved records/advisories:

- `react-router`
- `react-router-dom`
- `GHSA-wrjc-x8rr-h8h6`
- `GHSA-337j-9hxr-rhxg`

Critical gate:

- Command: `npm audit --audit-level=critical`
- Result: PASS
- Exit code: 0

## Diff Integrity

- `package.json`: exact `react-router-dom` change only
- `package-lock.json`: matching v6-to-v7 router graph change only
- Routing source: one testability export; route structure, URLs, and behavior unchanged
- Tests: one focused routing/security file added
- Phase evidence: this document plus the Phase 8.2 audit update
- Unrelated dependency upgrades: none
- Unrelated source/configuration changes: none

## Remaining Routing Risks

Automated code-level coverage passes, but it does not replace a rendered browser pass. Phase 8.2B-3 must verify:

- Desktop and mobile navigation rendering
- Direct deep links through Netlify-style SPA fallback
- Real login/account/admin redirect flows
- Browser back/forward and POP scroll behavior
- Hash-anchor scrolling
- Active `NavLink` states
- Query-string preservation through interactive navigation
- 404 behavior in a rendered browser
- Console errors and runtime warnings

## Deferred Work

- Phase 8.2B-3: rendered routing regression validation
- Phase 8.2C: compatible Prisma toolchain advisory resolution
- Existing Vite chunk-size warning: performance work outside this phase

## Phase Decision

- Acceptance status: PASS
- React Router security upgrade complete: YES
- Both React Router audit records resolved: YES
- Declarative architecture preserved: YES
- Public URLs preserved: YES
- Safe to proceed to Phase 8.2B-3 after explicit approval: YES
- Recommended next phase: Phase 8.2B-3 - Rendered Routing Regression Validation
