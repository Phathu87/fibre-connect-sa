# WP8 Phase 8.2B-1 React Router 7 Migration Assessment

Date: 2026-09-29

Status: PASS

Scope: read-only assessment. No dependency, routing, test, source, or configuration change was performed.

## Current Versions

- `react-router-dom`: `6.30.6` (direct dependency, declared as `^6.26.0`)
- `react-router`: `6.30.6` (transitive dependency of `react-router-dom`)
- React: `18.2.0` declared
- React DOM: `18.2.0` declared
- Vite: `8.2.0` declared
- TypeScript: `5.8.2` declared
- CI Node: 22
- Assessment host Node: `22.21.0`

The lockfile resolves one router chain:

```text
fibreconnect-sa
`-- react-router-dom@6.30.6
    `-- react-router@6.30.6
```

## Advisory Details

Fresh `npm audit --json` evidence on 2026-09-29 reports two moderate router records and six advisories overall.

### `GHSA-wrjc-x8rr-h8h6` / `CVE-2026-53669`

- Package: `react-router`
- Severity: moderate
- Affected range: `>=6.0.0 <7.18.0`
- Patched range: `>=7.18.0`
- Installed version: `6.30.6`
- Affected behavior: attacker-controlled paths passed to navigation mechanisms can produce unexpected external navigation in specific backslash/path forms.

### `GHSA-337j-9hxr-rhxg` / `CVE-2026-53666`

- Package: `react-router`
- Severity: moderate
- Affected range: `>=6.4.0 <7.18.0`
- Patched range: `>=7.18.0`
- Installed version: `6.30.6`
- Affected behavior: constructor injection during manual SSR hydration error deserialization in Data or Framework mode.
- Upstream applicability note: Declarative Mode is not affected by this SSR/hydration advisory.

`react-router-dom` is a direct aggregate record because it installs the affected `react-router` version. npm currently proposes `react-router-dom@7.18.4` and marks the change as a SemVer-major upgrade.

## Target Fixed Version

- Minimum version fixing both current router advisories: `7.18.0`.
- Recommended target: `react-router-dom@7.18.4`, which resolves `react-router@7.18.4`.
- `7.18.4` is the current latest version of the `react-router-dom` package according to live npm metadata on 2026-09-29.
- React Router v8 is not the minimum safe remediation and is not recommended for this phase. The DOM compatibility package was retained for v7 migration compatibility, while v8 removes `react-router-dom` and raises its platform baseline.

Primary evidence:

- `https://github.com/remix-run/react-router/security/advisories/GHSA-wrjc-x8rr-h8h6`
- `https://github.com/remix-run/react-router/security/advisories/GHSA-337j-9hxr-rhxg`
- `https://reactrouter.com/changelog`
- Live npm package and audit metadata captured during this assessment

## Router Architecture

Classification: **Declarative BrowserRouter/Routes SPA**.

- `src/main.jsx` uses React DOM `createRoot`; it does not hydrate server-rendered markup.
- `src/App.jsx` wraps the application in `BrowserRouter` and declares component routes with `Routes` and `Route`.
- Nested layout and authorization boundaries render child routes through `Outlet`.
- Netlify rewrites non-API paths to `/index.html`, consistent with client-side SPA routing.
- No `createBrowserRouter`, `RouterProvider`, loaders, actions, route error elements, route-module lazy loading, data-router fetchers, framework route modules, server router, static router, RSC router, SSR entry, or hydration API is present.

The router architecture does not need redesign for the security upgrade.

## React Router APIs Used

| API | Actual use | v7 migration impact |
| --- | --- | --- |
| `BrowserRouter` | Top-level SPA router | **BEHAVIOUR CHANGE TO TEST**: v7 transition behavior becomes the default |
| `Routes` / `Route` | Static component route tree | **NO CHANGE EXPECTED** |
| `Navigate` | Static auth/role redirects to `/login` and `/` with `replace` | **BEHAVIOUR CHANGE TO TEST** for protected-route timing/history |
| `Link` | Static and internally constructed application links | **NO CHANGE EXPECTED**, with security regression cases required |
| `NavLink` | Main, account, and admin active navigation | **NO CHANGE EXPECTED**, active-state behavior should be tested |
| `Outlet` | Main, account, admin, and protection boundaries | **NO CHANGE EXPECTED** |
| `useNavigate` | Four active internal destinations; one unused Navbar import | **NO CHANGE EXPECTED**, destination/security tests required |
| `useLocation` | Analytics, mobile active state, 404 display, scroll handling | **NO CHANGE EXPECTED** |
| `useNavigationType` | Avoids forced scroll on POP navigation | **BEHAVIOUR CHANGE TO TEST** for browser back/forward |
| `useParams` | Package, provider, network, help, and location parameters | **NO CHANGE EXPECTED** |
| `useSearchParams` | Package filters, enquiry package selection, reset token | **NO CHANGE EXPECTED**, query persistence/encoding should be tested |

Not used: `useRoutes`, `createBrowserRouter`, `RouterProvider`, `MemoryRouter`, loaders, actions, route error elements, lazy routes, blockers, redirects from loaders/actions, or data-router APIs.

All imports currently come from `react-router-dom`. Those re-exports remain available in React Router v7, so an import migration is not required for Phase 8.2B-2. Moving imports to `react-router`/`react-router/dom` would be v8 preparation and is outside the minimum security fix.

## Route Inventory

### Authentication routes

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`

### Public routes under the main layout

- `/`
- `/coverage`
- `/coverage/results`
- `/packages`
- `/packages/:slug`
- `/compare`
- `/providers`
- `/providers/:slug`
- `/networks`
- `/networks/:slug`
- `/fibre/:province`
- `/fibre/:province/:city`
- `/fibre/:province/:city/:suburb`
- `/business`
- `/saved`
- `/enquire`
- `/partners`
- `/help`
- `/help/:slug`
- `/contact`
- `/download`
- `/about`
- `/terms`
- `/privacy`
- `/cookies`
- `/accessibility`
- `/disclaimer`

### Protected account routes

Anonymous users are redirected to `/login`.

- `/account`
- `/account/profile`
- `/account/addresses`
- `/account/saved`
- `/account/comparisons`
- `/account/enquiries`
- `/account/notifications`
- `/account/privacy`

### Protected admin routes

Anonymous users are redirected to `/login`; authenticated users without `ADMIN` or `SUPER_ADMIN` are redirected to `/`.

- `/admin`
- `/admin/providers`
- `/admin/networks`
- `/admin/packages`
- `/admin/coverage`
- `/admin/enquiries`
- `/admin/customers`
- `/admin/promotions`
- `/admin/content`
- `/admin/analytics`
- `/admin/audit`
- `/admin/settings`

### Fallback routes

- `/404`
- `*` renders the not-found page

No nested splat route performs relative navigation. The wildcard fallback uses absolute internal links.

## Programmatic Navigation Analysis

| Source | Destination | Classification | Security assessment |
| --- | --- | --- | --- |
| `AddressSearchBar` | `/coverage/results` | Static internal | Not user-controlled |
| `Business` | `/account/enquiries` | Static internal | Not user-controlled |
| `Business` | `/` | Static internal | Not user-controlled |
| `PackageDetail` | `/enquire?package=${pkg.slug}` | Derived internal | Slug comes from the selected catalogue object; not raw query input, but encoding/regression coverage is appropriate |

`Navbar` imports `useNavigate` and creates `navigate`, but does not call it. This is existing dead usage and is not a migration requirement.

Dynamic `<Link>` destinations use route-shaped values derived from catalogue/help/location records or fixed local arrays. No direct assignment of a raw query parameter to `Link.to`, `Navigate.to`, or `navigate()` was found.

## Redirect/Open-Redirect Analysis

FibreConnect does accept `?returnTo=` on login and registration. This is security-sensitive but distinct from the reported React Router navigation call path:

- `safeReturnTo()` parses the value against `window.location.origin`.
- It rejects cross-origin values, protocol-relative paths, and any path containing a backslash.
- It removes authentication-shaped query parameters.
- Login and registration then use `window.location.href`, not React Router `navigate()`.
- Auth cross-links pass only the sanitized value through an encoded query parameter.

Other redirects are static `window.location` assignments for logout, login handoff, password-reset completion, and an alternate not-found component.

Conclusion:

- Untrusted navigation destination reaching React Router: **not found**.
- Query-controlled redirect exists: **yes, `returnTo`, but it is explicitly same-origin/backslash sanitized and uses browser navigation rather than React Router navigation**.
- Immediate open-redirect exploit through the audited `Link`/`useNavigate` path: **not demonstrated**.
- Regression tests for malicious `returnTo` forms and crafted router destinations are still required because the control is security-sensitive.

## Search-Parameter Handling

- `/packages`: reads provider, network, type, minimum speed, and maximum price into filter state; writes filter state back to the URL. These values never become navigation destinations.
- `/enquire`: reads `package` and performs a catalogue lookup. It does not navigate to the parameter value.
- `/reset-password`: reads `token` and sends it to the authentication service. It does not navigate to the token value.
- Login/register: `returnTo` is sanitized as described above before browser navigation or embedding in an internal auth link.

No `redirect`, `next`, callback URL, or equivalent raw destination parameter was found beyond the controlled `returnTo` flow.

## SSR/Hydration Relevance

The SSR hydration advisory is **not applicable to the current FibreConnect architecture**:

- The app calls `ReactDOM.createRoot`, not `hydrateRoot`.
- No server-rendered React HTML or React Router SSR entry exists.
- No Data/Framework router or `deserializeErrors()` path exists.
- Netlify hosts a static Vite SPA plus a separate Fastify function API.

This conclusion matches the upstream advisory's explicit exclusion for Declarative Mode.

## Required Migration Changes

Required in Phase 8.2B-2:

1. Change the direct `react-router-dom` dependency to `7.18.4` and allow npm to resolve `react-router@7.18.4`.
2. Review the package/lockfile diff for only the router chain and directly caused metadata changes.
3. Run a clean install, full validation, fresh audit, and critical gate.
4. Add focused routing/security regression coverage before declaring the upgrade complete.
5. Exercise protected redirects, parameter routes, query-string flows, fallback behavior, and POP navigation in a real browser.

No current evidence requires route syntax changes, a data-router conversion, loader/action migration, SSR work, framework adoption, or import rewrites.

### v6 future flags

- `v7_startTransition`: relevant because v7 makes transition-wrapped router state updates the default. FibreConnect uses React 18 and no route-level Suspense, so no source incompatibility is visible, but navigation/scroll/auth timing must be tested.
- `v7_relativeSplatPath`: low practical relevance. FibreConnect has only a terminal `*` fallback and uses absolute links there; no relative navigation inside a splat route was found.
- Data-router future flags (`v7_fetcherPersist`, `v7_normalizeFormMethod`, `v7_partialHydration`, and `v7_skipActionErrorRevalidation`): not applicable because FibreConnect does not use `RouterProvider`, fetchers, actions, or hydration.

A separate intermediate package upgrade is unnecessary. Enabling v6 flags solely to stage the migration is optional, but it would add another source change without materially reducing risk for this declarative route tree. Direct upgrade to 7.18.4 with focused regression testing is preferred.

## Existing Routing Tests

There are no frontend routing or browser-navigation tests.

Current tests cover Fastify API behavior, authentication primitives and authorization policy, environment parsing, coverage logic, and PostgreSQL integration. The server-side missing-API-route test does not exercise the React Router fallback.

Coverage currently absent:

- Public page navigation
- Package, provider, network, help, and location parameter routes
- Coverage and enquiry query-string flows
- Login/register `returnTo` behavior
- Anonymous account redirects
- Role-restricted admin redirects
- Auth loading state before protected-route decisions
- `/404` and wildcard fallback
- Browser back/forward and `useNavigationType()` scroll behavior
- Active `NavLink` and mobile navigation state
- Hash scrolling

## Missing Regression Tests

Minimum automated/browser scenarios for the upgrade:

1. Render representative public static and parameterized routes and verify expected page content.
2. Verify unknown URLs render the not-found page while the Netlify SPA fallback still serves the application shell.
3. Verify anonymous `/account/*` and `/admin/*` routes redirect to `/login` with replacement semantics.
4. Verify authenticated non-admin users are rejected from `/admin/*`, while authorized roles reach admin children.
5. Verify `returnTo` accepts valid same-origin paths and rejects absolute, protocol-relative, encoded/backslash, and malformed destinations.
6. Verify package/filter/reset query parameters affect data only and never become destinations.
7. Verify package-detail enquiry navigation encodes and preserves the selected internal slug.
8. Verify browser back/forward retains expected location, active navigation, and POP scroll behavior.
9. Verify hash navigation and direct deep-link loading under the Netlify SPA rewrite.

## Compatibility Constraints

Live npm metadata for `react-router-dom@7.18.4` reports:

- Node: `>=20.0.0`
- React: `>=18`
- React DOM: `>=18`

FibreConnect satisfies these requirements with CI Node 22 and declared React/React DOM 18.2.0. Vite 8.2.0 and TypeScript 5.8.2 do not present a documented v7 blocker for this declarative JavaScript application.

The assessment host runs Node 22.21.0. This satisfies React Router 7.18.4. The stricter Node 22.22, React 19.2.7, and Vite 7 baselines apply to React Router v8, which is not the recommended security target.

## Recommended Upgrade Strategy

1. Upgrade directly from `react-router-dom@6.30.6` to exact target `7.18.4`; do not introduce an intermediate router release.
2. Keep the declarative `BrowserRouter`/`Routes` architecture and current `react-router-dom` imports during this security migration.
3. Add focused regression tests around route rendering, protected redirects, safe `returnTo`, parameter/query handling, 404 behavior, and browser history.
4. Run `npm ci`, full validation, a production build, and fresh npm audits.
5. Perform desktop and mobile browser smoke coverage for representative public/account/admin/deep-link paths.
6. Keep v8 modernization, import consolidation, framework/data-router adoption, and future v8 flags outside this remediation.

## Estimated Implementation Size

**MEDIUM**.

The dependency bump and likely source compatibility are small. The overall phase is medium because FibreConnect has a broad public/account/admin route tree and currently has no frontend routing tests.

## Separate Phase 8.2B-3

**YES - recommended.**

Phase 8.2B-2 should perform the controlled dependency upgrade, minimal compatibility changes if proven necessary, focused automated security/routing tests, full validation, and audit verification. Phase 8.2B-3 should then provide an independent rendered browser regression pass across desktop/mobile, deep links, authentication states, role states, query parameters, back/forward, and Netlify-style fallback behavior.

This separation keeps package migration evidence distinct from broad release regression evidence without postponing essential automated tests from 8.2B-2.

## Release Impact

- Current portfolio/public demo: no demonstrated exploit path, but the package remains in an affected range.
- Future commercial release: upgrade to the fixed v7 line remains required.
- After a validated 7.18.4 migration, npm should remove both moderate router records, reducing the current advisory total from 6 to 4 if registry metadata is otherwise unchanged.

## Integrity Verification

- `package.json`: unchanged
- `package-lock.json`: unchanged
- Routing source: unchanged
- Application source/configuration: unchanged
- Full validation was not rerun because this assessment did not alter executable repository state.
- Permitted change: this assessment document only

## Phase Decision

- Acceptance status: PASS
- Recommended target: `react-router-dom@7.18.4` / `react-router@7.18.4`
- Recommended implementation size: MEDIUM
- Separate Phase 8.2B-3 regression validation: YES
- Recommended next phase: Phase 8.2B-2 - React Router Security Upgrade
- Safe to proceed after explicit approval: YES
