# Data Model

Entity relationships for the production PostgreSQL/Prisma implementation. Identifiers are stable strings (slugs/UUIDs), never display labels.

## Entities

### User
- id (PK)
- email (unique)
- full_name
- phone
- role: user | admin | super_admin | support | sales | content_editor | analyst | provider_manager
- marketing_consent (bool)
- created_date, updated_date

**Relations:**
- User → many UserAddress
- User → many SavedPackage
- User → many Comparison
- User → many CoverageSearch
- User → many Enquiry

### UserAddress
- id (PK)
- user_id (FK → User)
- street, suburb, city, province, postal_code
- preferred (bool)
- created_date

### Provider
- id (PK, slug)
- name, slug, logo_text, color
- description
- connectivity: string[] (Fibre, 5G, LTE)
- rating, review_count
- active (bool)
- created_date, updated_date

**Relations:** Provider → many BroadbandPackage

### NetworkOperator
- id (PK, slug)
- name, slug, logo_text, color
- infrastructure (FTTH GPON, 5G FWA, …)
- description
- supported_providers: string[] (provider ids)
- coverage_areas: string[]
- created_date, updated_date

**Relations:**
- NetworkOperator → many BroadbandPackage
- NetworkOperator → many CoverageArea

### BroadbandPackage
- id (PK)
- slug (unique)
- provider_id (FK → Provider)
- network_id (FK → NetworkOperator)
- name
- connectivity_type: Fibre | 5G | LTE
- download_mbps, upload_mbps (int)
- monthly_price, promotional_price (decimal)
- promotion_start, promotion_end (date?)
- installation_fee, router_fee (decimal)
- router_included (bool)
- contract_months (int, 0 = month-to-month)
- uncapped (bool)
- data_allowance_gb (int?)
- fair_usage_policy (text)
- activation_estimate (string)
- residential (bool), business (bool)
- featured, recommended, best_value, most_popular (bool)
- active (bool)
- description, extras, best_use_case
- rating, review_count
- created_at, updated_at

### CoverageArea
- id (PK)
- province, city, suburb (slugs)
- network_id (FK → NetworkOperator)
- status

### PackageAvailability
- id (PK)
- package_id (FK → BroadbandPackage)
- coverage_area_id (FK → CoverageArea)
- available (bool)

### Promotion
- id (PK)
- package_id (FK)
- promo_price, start_date, end_date
- active (bool)

### SavedPackage
- id (PK)
- user_id (FK → User)
- package_id (FK → BroadbandPackage)
- created_date
- unique(user_id, package_id)

### Comparison
- id (PK)
- user_id (FK → User)
- package_ids: string[]
- created_date

### CoverageSearch
- id (PK)
- user_id (FK → User, nullable)
- address (json)
- result_type: fibre | wireless | none
- created_date

### Enquiry
- id (PK, reference)
- user_id (FK → User, nullable)
- package_id (FK → BroadbandPackage)
- address_id (FK → UserAddress, nullable) + address snapshot
- first_name, last_name, email, phone
- contact_method
- property_type, dwelling, unit, access_notes, landlord_ack
- privacy, terms, provider_contact, marketing (bool)
- status: Submitted | Under review | Provider contacted | Awaiting customer | Approved | Installation scheduled | Completed | Cancelled
- assigned_to (staff id, nullable)
- created_date, updated_date

**Relations:**
- Enquiry → one BroadbandPackage
- Enquiry → one UserAddress (snapshot)
- Enquiry → many EnquiryStatusHistory

### EnquiryStatusHistory
- id (PK)
- enquiry_id (FK → Enquiry)
- status
- note
- created_by (staff id)
- created_date

### BusinessLead
- id (PK, reference)
- employees, branches, location, speed, install_date, usage, needs[], contact_name, email, phone, notes
- status, created_date

### PartnerLead
- id (PK, reference)
- company, name, email, role, message
- status, created_date

### NotificationPreference
- id (PK)
- user_id (FK → User)
- email, sms, push, marketing (bool)

### ProviderRating
- id (PK)
- provider_id (FK)
- user_id (FK)
- rating (1–5), review, created_date

### FAQ
- id (PK)
- category, question, answer, order, active

### LocationPage
- id (PK)
- province, city, suburb (slugs)
- content (json), seo (json)
- (Generated dynamically from CoverageArea in production)

### AdminUser
- mapped to User with admin role; RBAC enforced server-side.

### AuditLog
- id (PK)
- actor_id, action, target_type, target_id, metadata, created_date

### AnalyticsEvent
- id (PK)
- event_name, properties (json), user_id (nullable), session_id, created_date
- (Forwarded to GA4/PostHog in production; stored for internal dashboards)

## Relationship summary
```
Provider 1───* BroadbandPackage *───1 NetworkOperator
NetworkOperator 1───* CoverageArea
BroadbandPackage *───* CoverageArea (via PackageAvailability)
User 1───* UserAddress
User 1───* SavedPackage *───1 BroadbandPackage
User 1───* Comparison
User 1───* CoverageSearch
User 1───* Enquiry *───1 BroadbandPackage
Enquiry 1───* EnquiryStatusHistory
``