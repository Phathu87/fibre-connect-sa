# WP8 Phase 8.2B-3B Mobile and Browser-History Validation

Date: 2026-09-30

Status: PASS

## Scope

Close the exact 390 x 844 mobile and browser Back/Forward gaps from Phase 8.2B-3. Authorised administrator routing was not performed and remains reserved for Phase 8.2B-3C.

## Environment

- Baseline: `c5deec8d17a71c084e1099aa398176d493dc60a5`
- Frontend: `http://127.0.0.1:5173`
- API: `http://127.0.0.1:3000`
- API health: `GET /api/health` returned `status: ok`
- Browser/tool: Chrome with extension browser automation and explicit viewport override
- Browser viewport: `window.innerWidth=390`, `window.innerHeight=844`
- Document client width: 375 CSS pixels after vertical-scrollbar allocation
- Backend/database: Fastify and the configured development Supabase PostgreSQL catalogue were available

No secret value was exposed. No administrator fixture was created or used.

## Mobile Route Matrix

| Scenario | 390 x 844 | Result |
| --- | --- | --- |
| Home | Correct heading and mobile header rendered | PASS |
| Mobile navigation | Open, close, route selection, and auto-close passed | PASS |
| Packages | `Broadband packages` and seeded listing rendered | PASS |
| Package deep link | `/packages/demo-afrihost-50-50` rendered matching package | PASS |
| Package refresh | Refresh retained URL and matching rendered content | PASS |
| Coverage | Coverage entry form rendered | PASS |
| Coverage results | Fourways submission rendered Vumatel and seeded package | PASS |
| Login | `Welcome back` rendered | PASS |
| Account guard | Anonymous account child rendered login at `/login` | PASS |
| `returnTo` | Safe internal destination preserved; external destination removed | PASS |
| 404 | Intended `404 Page not found` fallback rendered | PASS |
| Horizontal overflow | None on every representative route | PASS |

## Responsive Navigation

- Menu button was present at the exact mobile viewport.
- Open changed `aria-expanded` from `false` to `true` and exposed mobile route links.
- Toggle close restored `aria-expanded=false`.
- Selecting Packages navigated to `/packages` and closed the menu.
- Controls remained available through semantic button and link interaction.
- No redesign or source change was required.

## Horizontal Overflow

The browser evaluated `document.documentElement.scrollWidth > document.documentElement.clientWidth` for each representative route. Every result was `false`:

- `/`
- `/packages`
- `/packages/demo-afrihost-50-50`
- `/coverage`
- `/coverage/results`
- `/login`
- protected account redirect destination
- safe and unsafe `returnTo` login pages
- `/packages?minSpeed=200`
- unknown-route fallback

## Browser History

| Sequence | Rendered evidence | Result |
| --- | --- | --- |
| Home -> Packages -> Detail | Each route rendered its matching heading | PASS |
| Back -> Packages | URL `/packages`; `Broadband packages` rendered | PASS |
| Back -> Home | URL `/`; home heading rendered | PASS |
| Forward -> Packages | URL `/packages`; packages heading rendered | PASS |
| Forward -> Detail | Detail URL; matching package heading rendered | PASS |
| Coverage -> Results -> Back | Results rendered seeded coverage; Back rendered entry form | PASS |
| Query-state -> Back | `/packages?minSpeed=200` rendered `200Mbps+`; Back rendered home | PASS |

The rendered content, not only the URL, was checked after every history operation.

## Coverage History

The existing Fourways recent-address control populated the form. `Check coverage` used the application's programmatic navigation to `/coverage/results`, where one recorded operator and one demo package rendered. Back returned to `/coverage` with the form in its existing initial state. No coverage state architecture was changed.

## Query History

The homepage speed finder generated `/packages?minSpeed=200`. The packages page rendered the `200Mbps+` chip, proving the query was applied. Browser Back returned to the rendered homepage.

## Authentication and Redirect Safety

- Account guard: anonymous `/account/enquiries?status=open` redirected to and rendered `/login` under the current policy.
- Safe `returnTo`: `/packages/demo-afrihost-50-50?from=mobile` remained encoded on the rendered Create one link.
- External containment: `https://evil.example/steal` was rejected; the rendered Create one link was `/register` without `returnTo`.
- No external origin was opened.

## Console

- React Router errors: none.
- Routing warnings: none.
- Fatal application errors affecting validation: none.
- Non-routing environment messages: one Vite HMR websocket reconnect failure from restarting the local development runtime and one browser-extension message-channel closure.

## Regressions and Fixes

- React Router 7 regression discovered: none.
- Unrelated application defect discovered: none affecting this phase.
- Source/test/configuration fix: none.
- Documentation updated: this report and the cumulative Phase 8.2B-3 evidence.

## Validation Decision

- Rendered scenarios: PASS
- Exact viewport: PASS
- `npm run validate`: NOT REQUIRED because only Markdown evidence changed
- Phase status: PASS
- Remaining Phase 8.2B-3 gap: authorised administrator root and child routing
- Recommended next phase: Phase 8.2B-3C - Authorised Administrator Routing Validation
- Safe to proceed to 8.2B-3C: YES
- Safe to proceed directly to 8.2C: NO
