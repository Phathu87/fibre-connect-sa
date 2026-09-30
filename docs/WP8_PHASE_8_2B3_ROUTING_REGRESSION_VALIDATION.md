# WP8 Phase 8.2B-3 Rendered Routing Regression Validation

Date: 2026-09-30

Status: PARTIAL

## Objective

Validate the React Router 7.18.4 migration in the rendered FibreConnect SPA without changing dependencies, application behavior, Netlify configuration, Supabase schema, or production data.

## Environment

- Frontend: Vite 8.2.0 at `http://127.0.0.1:5173`
- API: Fastify at `http://127.0.0.1:3000`, reached through the Vite `/api` proxy
- Data: configured development PostgreSQL/Supabase database with deterministic seeded catalogue and coverage data
- Browser mechanisms: Chrome extension automation and Codex in-app Chromium automation
- Desktop target: 1440 x 900; Chrome reported 1425 CSS px of document client width after scrollbar allocation
- Mobile target: 390 x 844
- Baseline commit: `d49e126593b195ba00c95190728fee6cc423e8a3`

No secret value was printed or recorded.

The API initially could not reach the configured development database from the restricted process. Restarting `npm run start:server` with approved network access produced the normal `127.0.0.1:3000` listener and restored data-backed flows. The earlier 502 console entries were therefore environment-startup evidence, not router regressions.

## Rendered Results

| Scenario | Desktop | Mobile | Result |
| --- | --- | --- | --- |
| Home | Rendered with primary navigation and no horizontal overflow | Not completed at exact target | PARTIAL |
| Packages | Catalogue shell and seeded package content rendered | Not completed at exact target | PARTIAL |
| Package deep link | `/packages/demo-afrihost-50-50` rendered and resolved seeded params; direct load passed | Not completed at exact target | PARTIAL |
| Coverage | `/coverage` rendered | Not completed at exact target | PARTIAL |
| Coverage results | Fourways form submission navigated to `/coverage/results` and rendered Vumatel plus seeded package | Not completed at exact target | PARTIAL |
| Login | `/login` rendered | Not completed at exact target | PARTIAL |
| Account guard | Anonymous `/account/enquiries?status=open` redirected to `/login` | Not completed at exact target | PARTIAL |
| Internal `returnTo` | Login at `/login?returnTo=%2Faccount%2Fenquiries` returned to the intended account child route | Not completed at exact target | PARTIAL |
| Admin denial | Authenticated USER requesting `/admin` was redirected to `/` | Not completed at exact target | PARTIAL |
| Admin authorised | No existing privileged development fixture was available; no permanent privileged credential was created | Not validated | NOT VALIDATED |
| 404 | `/__routing-regression-not-found__` rendered the intended Page not found view | Not completed at exact target | PARTIAL |
| Back/forward | Browser controller disconnected during the scheduled history pass | Not completed | NOT VALIDATED |

## Routing and Security Evidence

### Direct links and refresh

- Homepage direct navigation: PASS.
- Package list direct navigation: PASS.
- Seeded parameterised package direct navigation: PASS.
- Package detail route params resolved to `Demo Afrihost Fibre 50/50`.
- Protected account child direct navigation and refresh: PASS at `/account/enquiries`.
- Account root direct navigation and refresh: FAIL because of the unrelated `notificationService.list` runtime defect described below.

### Programmatic navigation

The real coverage form was populated with deterministic development data for Fourways. Submission used the application's existing `navigate('/coverage/results')` flow and rendered the seeded coverage result and package. Result: PASS.

### Query strings

- `/enquire?package=demo-afrihost-50-50` preserved the package query and rendered `Apply for this package` with the correct package.
- An anonymous protected URL containing `?status=open` was contained by the guard and redirected to `/login` according to the current policy.

### Authentication and `returnTo`

A temporary development USER account was created through the normal registration flow. It was used to verify a real login and internal return destination, then removed from the development database. Post-cleanup verification reported zero matching users.

- Valid internal `returnTo`: PASS; login returned to `/account/enquiries`.
- Absolute external URL: PASS; successful login remained on the local origin and resolved to `/`.
- Protocol-relative URL: PASS; rendered login sanitization produced `/register` without propagating the destination.
- Forward-slash/backslash escape: PASS; rendered login sanitization produced `/register` without propagating the destination.
- Double-backslash escape: PASS; rendered login sanitization produced `/register` without propagating the destination.
- No unsafe external site was opened.

### Admin routing

- USER denial: PASS; `/admin` redirected to `/`.
- Authorised admin and admin child: NOT VALIDATED because no existing privileged development fixture was available. A privileged account was not created solely for this phase.

### Links, history, and hash

- Public navigation links were visibly rendered and exposed correct internal destinations.
- A complete click-through plus Back/Forward sequence was not captured because the Chrome controller disconnected and the replacement browser session later reset during viewport configuration. This is a tooling limitation, not a passing result.
- Hash navigation: NOT APPLICABLE. No FibreConnect hash/anchor navigation flow was identified for this validation scope.

## Responsive Validation

### Desktop

The home, packages, parameterised package, coverage, login, 404, and query-string routes were rendered at the desktop target. Each inspected route reported `scrollWidth <= clientWidth`. No routing-caused horizontal overflow was found.

### Mobile

The in-app browser showed the responsive menu variant at an intermediate 866 x 452 viewport, confirming breakpoint activation, but the required exact 390 x 844 matrix was not completed. Browser automation repeatedly disconnected or reset while applying the exact viewport. Mobile acceptance is therefore NOT VALIDATED, not inferred from CSS or desktop behavior.

## Console Findings

No React Router 7 exception, route-matching exception, navigation promise failure, or router deprecation warning was observed in the completed representative flows.

Relevant non-router findings:

1. Initial Vite proxy 502 errors occurred only while the API was unavailable inside the restricted process. They stopped after the API was restarted with approved development-database access.
2. Authenticated `/account` originally crashed with `TypeError: notificationService.list is not a function` at `src/pages/account/Account.jsx`. Phase 8.2B-3A repaired this pre-existing application/service-contract defect by aligning the overview with the implemented persisted preference contract. Rendered `/account` and `/account/notifications` verification now passes.
3. A browser-extension message-channel error appeared once and was not emitted by application routing code.

## Regressions and Fixes

React Router 7 migration-caused regressions discovered: none in the scenarios completed.

Application fixes made during this validation phase: none. The separately authorised Phase 8.2B-3A repair subsequently resolved the account-root blocker without changing routing.

Dependency changes: none. The Phase 8.2B-2 audit evidence remains current: 4 high advisories in the deferred Prisma toolchain, 0 critical, 0 moderate, and no React Router advisory.

Automated rendered tests added: none. No browser framework was already configured, and a new framework was not added for this validation-only phase.

`npm run validate`: not rerun because no source, test, dependency, or configuration file changed.

## Completion Decision

Phase 8.2B-3 remains PARTIAL because the required exact mobile viewport, full Back/Forward sequence, and authorised admin routes were not validated. The unrelated account-root blocker is resolved as of Phase 8.2B-3A.

- Phase status: PARTIAL
- React Router package remediation: complete at dependency and code-test level
- React Router rendered remediation: INCOMPLETE
- Dependency audit document fully-validated marker: not changed
- Local commit: none, because all acceptance criteria did not pass
- Push: none
- Safe to begin Phase 8.2C: NO

## Required Closure Work

1. Restore stable browser automation and run the exact 390 x 844 mobile matrix.
2. Capture a complete internal Link/NavLink click and browser Back/Forward sequence.
3. Validate `/admin` and one admin child route only with an existing approved development admin fixture.
4. Repeat representative console and overflow checks after those items.

## Deferred

- Phase 8.2C - Prisma Toolchain Advisory Resolution
- Existing Vite chunk-size warning
- Netlify release phases and deployed SPA fallback proof

Recommended next action: close the Phase 8.2B-3 gaps above before proceeding to Phase 8.2C.
