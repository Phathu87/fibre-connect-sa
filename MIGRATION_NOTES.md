# Migration Notes

## Migration rule
> The UI should not need to be rebuilt when the backend changes. Codex replaces adapters/services, not screens.

## Step-by-step

### 1. Database & API
Implement PostgreSQL + Prisma per `DATA_MODEL.md` and the REST API per `API_CONTRACTS.md`.

### 2. Replace data services
Each service in `src/services/` currently reads from `src/data/mockData.js` or localStorage. Replace the implementation with `fetch` calls to the new API, keeping the same return shapes.

| Service | Current source | Replace with |
|---------|----------------|--------------|
| `packageService` | mockData.js | `GET /api/packages` etc. |
| `coverageService` | mockData.js (mock resolution) | `POST /api/coverage/check` |
| `providerService` | mockData.js | `GET /api/providers` etc. |
| `networkService` | mockData.js | `GET /api/networks` etc. |
| `savedService` | localStorage | `GET/POST/DELETE /api/me/saved-packages` |
| `compareService` | localStorage | `GET/POST /api/me/comparisons` (keep local fallback for guests) |
| `enquiryService` | localStorage | `POST /api/enquiries`, `GET /api/me/enquiries` |
| `userService` | localStorage | `GET/PATCH /api/me`, addresses endpoints |
| `notificationService` | localStorage | `GET /api/me/notifications`, prefs endpoint |

### 3. Replace auth
Replace `src/services/authService.js` and `src/lib/AuthContext.jsx` with the production auth provider. Auth pages (`Login`, `Register`, `ForgotPassword`, `ResetPassword`) may need their SDK calls swapped but the flows stay multi-step.

### 4. Connect analytics
Replace `src/services/analyticsService.js` internals with GA4/GTM/PostHog SDK calls. The `events.*` API stays the same.

### 5. Remove mock data
Once services call the API, delete `src/data/mockData.js` and any remaining direct imports of it (services are the only consumers).

### 6. Replace storage abstraction
`src/services/storageService.js` can remain as a thin wrapper or be replaced. Guest-mode saved/compare can keep localStorage; authenticated mode uses the API.

### 7. SEO
Replace `PUBLIC_APP_URL` placeholders. Implement server-rendered or statically generated location pages from `CoverageArea` data for large-scale SEO.

## What stays unchanged
- All pages and components in `src/pages/` and `src/components/`
- The service contracts (method names + return shapes)
- Routing, layout, theme, accessibility
- The enquiry flow steps and consent logic

## Breaking-change avoidance
If the API needs a different shape than the service currently returns, add a mapping layer inside the service rather than changing components.