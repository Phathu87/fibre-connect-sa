# Architecture

FibreConnect SA is built around a strict separation between the UI and any data source, so the backend can be replaced without rebuilding screens.

## Layering

```
UI (pages / components)
  → feature hooks (useCompare, useSaved, usePageView)
    → service layer (packageService, coverageService, providerService, authService, enquiryService, analyticsService)
      → repository / API adapter (currently mock data + localStorage)
        → Fastify REST API → services/repositories → PostgreSQL via Prisma
```

### Service layer (`src/services/`)
Each service exposes clearly defined data contracts. Components import services, never the data source directly.

- `packageService` — list, filter, sort, paginate, getBySlug, related, featured
- `coverageService` — check(address), history, locations
- `providerService` / `networkService` — list, getBySlug, packages
- `savedService` / `compareService` / `enquiryService` / `userService` / `notificationService` — user data (localStorage-backed)
- `searchHistoryService` / `coverageHistoryService` — local history
- `authService` — local demo session adapter with a replaceable production boundary
- `analyticsService` — event tracking abstraction (GA4/GTM/PostHog-ready)
- `storageService` — wraps localStorage (replaceable)

### Data (`src/data/mockData.js`)
Sample providers, networks, packages, suburbs, FAQs. This is the only module Codex replaces with real API calls — services already abstract access to it.

### Server (`server/`)
- `app.ts` composes the Fastify application, security headers, CORS, request IDs, health/readiness and standard error responses.
- `config/env.ts` validates runtime configuration without exposing values in validation errors.
- `db/client.ts` owns the Prisma/PostgreSQL client lifecycle.
- Feature routes, services and repositories are added as independently testable work packages.

### Database (`prisma/`)
- `schema.prisma` defines stable UUID-backed production models and relational constraints.
- `migrations/` contains reviewable PostgreSQL migration SQL.
- `seed.ts` creates only explicitly labelled demo configuration until catalogue seed data is migrated in WP2.

### Hooks (`src/hooks/`)
- `useCollections` — cross-component sync for saved/compare via custom events
- `usePageView` — page view analytics
- `use-mobile` — viewport detection

### Theme & auth
- `ThemeContext` — light/dark/system, persisted
- `AuthContext` (platform) — wrapped by `authService` so components stay decoupled

## State management
Local component state + service calls. No global store. Saved/compare state syncs via window events so the navbar, compare tray and pages stay consistent.

## Routing
`src/App.jsx` — Layout route wraps public pages; account routes are protected; admin uses its own layout. Route-level code splitting is prepared via dynamic imports where useful.

## Mobile-first
Bottom navigation bar, mobile filter drawers, stacked comparison cards, sticky mobile CTAs, safe-area awareness. Designed from 320px up.

## Accessibility
Semantic headings, labelled inputs, visible focus, ARIA on interactive controls, accessible dialogs/drawers, reduced-motion support, touch target sizing.
