# WP8 Phase 8.2B-3 Rendered Routing Regression Validation

Date: 2026-09-30

Status: PASS

## Objective

Validate the React Router 7.18.4 migration in the rendered FibreConnect SPA without changing dependencies, application behavior, Netlify configuration, Supabase schema, or production data.

## Environment

- Frontend: Vite 8.2.0 at `http://127.0.0.1:5173`
- API: Fastify at `http://127.0.0.1:3000`, reached through the Vite `/api` proxy
- API health: `GET /api/health` returned `status: ok`
- Data: configured development PostgreSQL/Supabase database with deterministic seeded catalogue and coverage data
- Browser: Chrome extension automation
- Desktop target: 1440 x 900
- Mobile target: exact 390 x 844 browser viewport
- Current baseline commit: `c5deec8d17a71c084e1099aa398176d493dc60a5`

No secret value was printed or recorded.

## Rendered Results

| Scenario | Desktop | Mobile 390 x 844 | Result |
| --- | --- | --- | --- |
| Home | Rendered | Rendered; primary mobile navigation usable | PASS |
| Packages | Catalogue and seeded content rendered | Rendered through responsive navigation | PASS |
| Package deep link | Seeded parameterised route rendered | Direct route and refresh rendered `Demo Afrihost Fibre 50/50` | PASS |
| Coverage | Rendered | Rendered | PASS |
| Coverage results | Fourways produced seeded Vumatel result | Programmatic navigation produced the same result | PASS |
| Login | Rendered | Rendered | PASS |
| Account guard | Anonymous account child redirected to login | `/account/enquiries?status=open` rendered login at `/login` | PASS |
| Internal `returnTo` | Valid same-origin destination preserved | Safe package destination propagated to registration link | PASS |
| External `returnTo` | External destination contained | External destination omitted from registration link | PASS |
| Admin denial | Authenticated USER redirected to `/` | Reconfirmed for `/admin` and `/admin/enquiries` | PASS |
| Admin authorised | Controlled development `ADMIN` fixture rendered `/admin` | Child deep link, refresh, navigation, and history passed | PASS |
| 404 | Intended fallback rendered | Intended `404 Page not found` fallback rendered | PASS |
| Back/forward | Previously incomplete | Full Home, Packages, Detail Back/Forward sequence passed | PASS |

## Routing and Security Evidence

### Direct links and refresh

- Homepage, packages listing, coverage, login, and unknown-route direct navigation: PASS.
- Seeded package route `/packages/demo-afrihost-50-50`: PASS.
- Refresh on the seeded package route retained the route and rendered package: PASS.
- The Phase 8.2B-3A account service repair remains verified; `/account` and `/account/notifications` pass.

### Programmatic navigation and history

The coverage form used the existing Fourways development fixture. Submission navigated to `/coverage/results` and rendered the recorded Vumatel operator and Demo Afrihost Fibre 50/50 package. Browser Back returned to `/coverage`, which rendered the coverage entry form in its initial state. This matches the existing route/state design.

The primary history sequence passed with rendered headings at every step:

1. `/` rendered `Find the right internet package for your address`.
2. Mobile navigation selected `/packages`, which rendered `Broadband packages` and closed the menu.
3. Package selection opened `/packages/demo-afrihost-50-50`, which rendered the matching package heading.
4. Back returned to packages, then Back returned home.
5. Forward returned to packages, then Forward returned to the package detail.

### Query strings

The home speed finder generated a real `/packages?minSpeed=200` link. Selecting it rendered packages with the `200Mbps+` active filter. Browser Back returned to the rendered homepage. Result: PASS.

### Authentication and `returnTo`

- Anonymous direct navigation to `/account/enquiries?status=open` rendered login and resolved to `/login` under the current protected-route policy.
- Safe internal destination `/packages/demo-afrihost-50-50?from=mobile` was retained by the login page and propagated as an encoded `returnTo` on the registration link.
- Absolute external destination `https://evil.example/steal` remained contained: the rendered registration link was `/register` with no external `returnTo`.
- No external site was opened.

### Admin routing

- A unique temporary development user was registered through the normal application flow and promoted directly through the configured development database, matching the established integration-test fixture pattern.
- Persisted role `ADMIN` was verified before normal login. `SUPER_ADMIN` was not used.
- `/admin` rendered the dashboard and admin layout without redirect or exception.
- `/admin/enquiries` rendered through internal navigation, direct deep link, refresh, Back, and Forward.
- ADMIN backend authorization passed: `/api/admin/enquiries` and `/api/admin/security-check` returned 200.
- The same controlled identity was demoted to `USER`; both admin root and child redirected to `/`, and the authenticated security check returned 403 `FORBIDDEN`.
- The targeted fixture was then deleted. Its two sessions were cascade-deleted, and database verification returned zero remaining users and zero sessions for the fixture.

## Responsive Validation

Chrome reported `window.innerWidth === 390` and `window.innerHeight === 844`. The 375 CSS-pixel document client width reflected scrollbar allocation, while the requested browser viewport remained exactly 390 x 844.

The responsive menu opened (`aria-expanded=true`), closed through its toggle (`aria-expanded=false`), exposed the intended mobile links, navigated to packages, and closed after route selection. Mouse/focus interaction remained usable.

Each representative mobile route reported `scrollWidth <= clientWidth`: home, packages, package detail, coverage, coverage results, login/account guard, safe and unsafe login-return pages, query-filtered packages, and 404. No horizontal overflow was found.

## Console Findings

No React Router exception, route-matching exception, navigation promise failure, router warning, or fatal application error was observed during the mobile/history flows.

The only recorded errors were non-routing environment messages:

1. A Vite development HMR websocket reconnect failure recorded when the local runtime was restarted.
2. A browser-extension message-channel closure on the unknown-route page.

Neither affected rendered navigation or application routing.

## Regressions and Fixes

- React Router 7 migration regressions discovered: none.
- Application/source/test/configuration fixes in 8.2B-3B: none.
- Dependency changes: none.
- `npm run validate`: not rerun because only evidence documentation changed.

## Completion Decision

Phase 8.2B-3 is PASS. Desktop, exact mobile, browser history, redirect security, account repair, normal-user denial, and authorised administrator routing are all complete.

- Exact 390 x 844 mobile matrix: PASS
- Back/Forward history: PASS
- Query-string history: PASS
- Authorised administrator routing: PASS
- React Router remediation status: COMPLETE
- Push: none
- Safe to begin Phase 8.2C-1 after explicit approval: YES

## Deferred

- Phase 8.2C-1 - Prisma Toolchain Advisory Assessment
- Existing Vite chunk-size warning
- Netlify release phases and deployed SPA fallback proof
