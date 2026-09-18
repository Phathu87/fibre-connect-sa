# API Contracts

Future backend endpoints. The frontend service layer already matches these shapes. All endpoints return JSON. Errors use a consistent envelope.

## Conventions

**Base URL:** `API_BASE_URL` (e.g. `https://api.fibreconnect.co.za/api`)

**Auth:** Bearer token in `Authorization` header for protected endpoints.

**Pagination:** `?page=1&pageSize=12` → `{ items, total, page, pageSize, hasMore }`

**Error response:**
```json
{ "error": { "code": "not_found", "message": "Package not found", "status": 404 } }
```

**Roles:** `user`, `admin`, `super_admin`, `support`, `sales`, `content_editor`, `analyst`, `provider_manager`.

---

## Public

### GET /packages
Query: `connectivityType`, `providerId`, `networkId`, `minSpeed`, `maxPrice`, `uncapped`, `routerIncluded`, `promotional`, `contractMonths`, `classification`, `search`, `sort`, `page`, `pageSize`
Response: `{ items: Package[], total, page, pageSize, hasMore }`

### GET /packages/:slug
Response: `Package` (with `provider` and `network` populated)

### GET /packages/:slug/related
Response: `Package[]`

### GET /providers
Response: `Provider[]`

### GET /providers/:slug
Response: `Provider` (with `networks[]`)

### GET /providers/:slug/packages
Response: `Package[]`

### GET /networks
Response: `Network[]`

### GET /networks/:slug
Response: `Network` (with `providers[]`)

### GET /networks/:slug/packages
Response: `Package[]`

### POST /coverage/check
Request: `{ street, suburb, city, province, postalCode }`
Response: `{ status: 'fibre-available'|'wireless-available'|'no-coverage', address, suburb?, fibreNetworks: Network[], wirelessOptions: string[], packages: Package[], message }`

### GET /coverage/locations
Response: `{ suburbs, cities, provinces }`

### GET /locations/:province/:city?/:suburb?
Response: `{ label, networks: Network[], packages: Package[], priceRange, speeds, childLocations }`

---

## Auth

### POST /auth/register
Request: `{ email, password }` → `{ message }` (verification required)

### POST /auth/verify-otp
Request: `{ email, otpCode }` → `{ access_token, user }`

### POST /auth/login
Request: `{ email, password }` → `{ access_token, user }`

### POST /auth/forgot-password
Request: `{ email }` → `{ message }` (generic success)

### POST /auth/reset-password
Request: `{ resetToken, newPassword }` → `{ message }`

### POST /auth/logout
→ `{ message }`

---

## User (auth required)

### GET /me
Response: `User`

### PATCH /me
Request: `{ firstName?, lastName?, phone?, marketingConsent? }` → `User`

### GET /me/addresses
### POST /me/addresses
### DELETE /me/addresses/:id
### PATCH /me/addresses/:id  (set preferred)

### GET /me/saved-packages
### POST /me/saved-packages  `{ packageId }`
### DELETE /me/saved-packages/:id

### GET /me/comparisons
### POST /me/comparisons  `{ packageIds: string[] }`

### GET /me/coverage-history
### GET /me/notifications
### PATCH /me/notification-preferences

---

## Enquiries

### POST /enquiries
Request:
```json
{
  "packageId": "string",
  "address": { "street", "suburb", "city", "province", "postalCode" },
  "firstName": "string", "lastName": "string", "email": "string", "phone": "string",
  "contactMethod": "Email|Phone|WhatsApp",
  "propertyType": "Residential|Business", "dwelling": "House|Apartment|...",
  "unit": "string?", "accessNotes": "string?", "landlordAck": true,
  "privacy": true, "terms": true, "providerContact": true, "marketing": false
}
```
Response: `{ id, reference, status: "Submitted", statusHistory, createdAt }`
Validation: privacy, terms, providerContact must be `true`. Duplicate prevention by (email + packageId + address) within cooldown window.

### GET /enquiries/:id
Response: `Enquiry` with `statusHistory[]`

### GET /me/enquiries
Response: `Enquiry[]`

---

## Business leads

### POST /business-leads
Request: `{ employees, branches, location, speed, installDate, usage, needs: string[], contactName, email, phone, notes }`
Response: `{ id, reference, status, createdAt }`

---

## Partner leads

### POST /partner-leads
Request: `{ company, name, email, role, message }`
Response: `{ id, reference, createdAt }`

---

## Admin (auth + role required)

### GET /admin/packages  (query + pagination)
### POST /admin/packages
### PATCH /admin/packages/:id
### POST /admin/packages/:id/duplicate
### PATCH /admin/packages/:id/status  `{ active: boolean }`

### GET /admin/providers
### POST /admin/providers
### PATCH /admin/providers/:id

### GET /admin/networks
### POST /admin/networks
### PATCH /admin/networks/:id

### GET /admin/enquiries  (query, filter by status/assignee)
### PATCH /admin/enquiries/:id/status  `{ status, note }`
### PATCH /admin/enquiries/:id/assign  `{ assignedTo }`
### POST /admin/enquiries/:id/notes  `{ note }`

### GET /admin/customers
### GET /admin/analytics/overview
### GET /admin/analytics/funnel
### GET /admin/content/faqs
### PATCH /admin/content/faqs/:id

### GET /admin/settings  (non-secret config only)
### PATCH /admin/settings

---

## Rate limiting
Public write endpoints (coverage/check, enquiries, business-leads, partner-leads) are rate-limited server-side. Returns `429` with `Retry-After`.

## Security (server-side enforcement)
- Input validation on all endpoints
- Authorization + RBAC on every admin/protected endpoint
- CSRF protection where relevant
- Audit trail for admin actions
- Anti-spam / bot protection on public forms
- Duplicate enquiry prevention