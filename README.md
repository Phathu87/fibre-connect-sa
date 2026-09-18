# FibreConnect SA

**Compare fibre, LTE and 5G packages available in your area.**

FibreConnect SA is a broadband discovery, comparison and lead-generation platform for South African households and businesses. Users check which connectivity is available at their address, compare packages across providers and networks, and submit enquiries — all within a fast, mobile-first, accessible experience.

> **Project origin:** FibreConnect SA evolved from an earlier developer-assessment prototype based on a broadband product-discovery brief, and was independently redesigned and expanded into a complete broadband comparison platform. It is not affiliated with, sponsored by, or endorsed by any provider. All provider, pricing and coverage data shown is **sample/demo data** for demonstration — it is not sourced from a live provider feed.

---

## Current state

This repository contains the active FibreConnect SA React application, Fastify API and Prisma/PostgreSQL data layer. WP1-WP4 are complete: the production foundation, database-backed catalogue, deterministic coverage engine, authentication and server-enforced RBAC are implemented. Live commercial coverage, transactional email and production deployment configuration remain external release blockers.

### What works today (end-to-end)

- **Discovery journey:** address → coverage → available packages → compare → package detail → enquiry → confirmation
- **Coverage checker** with address form, recent searches, "use current location", and grouped results by network operator
- **Network filter** on the coverage results page — chip filters (All networks + each underlying network with package counts) that group the displayed packages accordingly
- **Household speed calculator** on the homepage that recommends a speed tier and links through to the packages listing page pre-filtered to that speed (`/packages?minSpeed=...`)
- **Packages listing** with advanced filtering (provider, network, connectivity type, speed, price, uncapped, router, promo, contract, residential/business), sorting (recommended, price, speed, best value, popularity, newest), pagination, search, and active-filter chips
- **Side-by-side comparison** of 2–4 packages with **yearly cost calculation** and best-value / fastest highlights (responsive: table on desktop, swipeable cards on mobile)
- **Package detail** with first-month cost estimate, features, related packages, and enquiry entry
- **Provider & network directories** with detail pages, coverage areas, and related packages
- **SEO-ready location landing pages** (`/fibre/:province/:city/:suburb`)
- **Business connectivity** flow
- **Saved packages** and **compare tray** (persistent across the app via local state)
- **Multi-step enquiry** flow with reference number and confirmation
- **User account:** profile, addresses, saved packages, comparisons, enquiries, notifications
- **Admin dashboard:** providers, networks, packages, coverage, enquiries, customers, promotions, content, analytics, settings
- **Dark mode** (light / dark / system), **PWA manifest**, accessibility fundamentals (WCAG 2.2 AA targets)
- **Analytics abstraction** with a consent-gated event model
- **Fastify / Prisma service and repository layer** backed by the development Supabase PostgreSQL project
- **Secure account lifecycle** with Argon2id passwords, opaque sessions, CSRF protection, email verification/reset architecture and server-enforced RBAC
- **Legal & trust pages** (Terms, Privacy, Cookies, Accessibility, Disclaimer), help centre, contact, partners, download

---

## Tech stack

- **React + Tailwind CSS + Vite** (ESM)
- **shadcn/ui** components, **lucide-react** icons
- **react-router-dom** for routing, **@tanstack/react-query** for query state
- Design tokens in `src/index.css` mapped to Tailwind classes in `tailwind.config.js`
- Replaceable service adapters for authentication, analytics, and application data

---

## Architecture

The app uses a **service / repository abstraction layer** between the UI and the data source. Core catalogue, coverage and authentication journeys call validated Fastify endpoints backed by Prisma and PostgreSQL. Remaining local demo collections are explicitly transitional and are scheduled for WP5 persistence.

```
UI (pages / components)
        │
        ▼
Services  (src/services/*.js)   ← browser API boundary
        │
        ▼
Fastify routes → repositories → Prisma → PostgreSQL
```

Key services:
- `packageService` — list/filter/sort/paginate packages, detail, related
- `providerService` — providers, by slug
- `networkService` — networks, by slug, and their packages
- `coverageService` — address → coverage status + available networks/packages
- `userDataService` — saved packages, compare list, search/enquiry history (local persistence)
- `analyticsService` — consent-gated `track()` + `events.*` helpers (GA4/GTM/PostHog ready)
- `storageService` — low-level local-storage wrapper
- `authService` — server-authenticated session and account API adapter

---

## Project structure

```
src/
  pages/            # Route components (Home, Coverage, Packages, Compare, account/*, admin/*, …)
  components/
    layout/         # Navbar, Footer, MobileBar, CompareTray, Layout
    home/           # Hero sections, SpeedCalculator, ConnectivityMatrix, FAQ, etc.
    packages/       # FilterPanel
    coverage/       # NetworkPackageGroup (network-filtered package grouping)
    account/        # AccountLayout + account sections
    admin/          # AdminLayout + admin sections
    ui/             # shadcn/ui primitives + custom Badge/Logo/Connectivity/ProviderLogo
  services/         # Service / repository layer (data access abstraction)
  data/             # mockData.js (demo catalogue + selectors)
  hooks/            # useCollections (saved/compare), usePageView, use-mobile
  lib/              # AuthContext, ThemeContext, query-client, utilities
mweb-fiber-app/      # Original MWEB assessment project, retained as reference
```

---

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build
```

The app runs as a standard Vite application. There is no published live URL yet.

---

## Routes

Public: `/`, `/coverage`, `/coverage/results`, `/packages`, `/packages/:slug`, `/compare`, `/providers`, `/providers/:slug`, `/networks`, `/networks/:slug`, `/fibre/:province/:city/:suburb`, `/business`, `/saved`, `/enquire`, `/partners`, `/help`, `/help/:slug`, `/contact`, `/download`, `/about`, `/terms`, `/privacy`, `/cookies`, `/accessibility`, `/disclaimer`

Account (protected): `/account`, `/account/profile`, `/account/addresses`, `/account/saved`, `/account/comparisons`, `/account/enquiries`, `/account/notifications`

Admin: `/admin`, `/admin/providers`, `/admin/networks`, `/admin/packages`, `/admin/coverage`, `/admin/enquiries`, `/admin/customers`, `/admin/promotions`, `/admin/content`, `/admin/analytics`, `/admin/settings`

Auth: `/login`, `/register`, `/forgot-password`, `/reset-password`

Full route map: [ROUTES.md](./ROUTES.md)

---

## Documentation

| File | Purpose |
|------|---------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Frontend architecture and layering |
| [API_CONTRACTS.md](./API_CONTRACTS.md) | Future backend API endpoints |
| [DATA_MODEL.md](./DATA_MODEL.md) | Entity relationships for PostgreSQL/Prisma |
| [APP_STORE_READINESS.md](./APP_STORE_READINESS.md) | App-store preparation status |
| [ANALYTICS_EVENTS.md](./ANALYTICS_EVENTS.md) | Analytics event model |
| [ROUTES.md](./ROUTES.md) | Complete route map |
| [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) | Future environment variables |
| [MIGRATION_NOTES.md](./MIGRATION_NOTES.md) | Migration rule and steps |

---

## Known limitations & migration notes

- **Authentication** uses a browser-local demo session and requires a secure server-side implementation before production.
- **Coverage checking** relies on mock data and requires future integration with real provider/network APIs.
- **All package, pricing, coverage and provider information is sample/demo data** — not from a live feed. See the in-app [Disclaimer](./src/pages/Disclaimer.jsx).
- The data layer is intentionally isolated behind services so Codex can replace `src/services/*` bodies with real API calls without changing the UI.

---

## Recent work (this phase)

- Added a **network-operator filter** to the coverage results page (`NetworkPackageGroup`) that groups available packages by underlying network with chip selectors and counts.
- Added a **household speed calculator** to the homepage that recommends a speed tier and deep-links to the packages page pre-filtered by `minSpeed`.
- Wired the speed calculator's result CTA to the packages listing so users land on the right plans automatically (`/packages?minSpeed=...` → filtered + chip shown).
- Added **yearly cost calculation** and best-value / fastest highlights to the comparison page.
- Resolved a recurring Vite stale-module-cache issue with `@/services/networkService` (rewrote the module to force re-resolution).
- Cleaned up unused imports and React-hooks lint errors (Navbar, Layout, AddressSearchBar).

---

## License

Proprietary — sample/demo project. Provider names and data are illustrative only.
