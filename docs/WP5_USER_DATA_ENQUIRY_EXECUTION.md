# WP5 User Data and Enquiry Execution

Date: 2026-09-23

Status: COMPLETE

## Architecture

Account state now crosses the existing frontend service boundary into Fastify and PostgreSQL. Authenticated users persist addresses, saved packages, the current comparison, notification preferences and enquiry history through `/api/me/*`. Guest saved and comparison collections remain local browser conveniences and are not represented as server-owned records.

Public enquiry submission accepts only canonical application fields. Package pricing and provider identity are resolved server-side from the active catalogue. An authenticated session associates the enquiry with its owner; anonymous submission remains supported without trusting client identity claims.

## Enquiry Controls

- Zod schemas reject unknown fields and require explicit privacy, terms and provider-contact consent.
- Consent events are stored as server timestamps. Optional marketing consent is timestamped separately.
- A normalized SHA-256 key rejects the same email, package and installation address within ten minutes.
- The route is limited to five submissions per client per ten minutes.
- Every accepted enquiry receives a random `FC-` reference and initial `SUBMITTED` history event.
- Authorized admin status/note changes append history and write an audit record with the actor, target and request ID.

## Ownership and Authorization

All account reads derive the owner from the authenticated session. Address preference and deletion include `userId` in repository predicates, so another user's identifier is returned as not found. Saved-package uniqueness is enforced by the existing compound database constraint. Comparisons accept at most four unique active package IDs.

Admin enquiry reads require `enquiry.read.assigned`; mutations additionally require CSRF and `enquiry.manage`. The UI no longer offers invented employee assignments. Assignment remains visible when a valid server-side assignee exists and can be exposed as an operator workflow when a real staff directory endpoint is delivered.

## Verification

- Prisma schema validation and client generation pass.
- Frontend and server type checks pass.
- ESLint passes with zero errors.
- Unit tests pass.
- Production Vite build passes.
- Seven live Supabase integration tests pass.
- The WP5 integration journey verifies address persistence, cross-account deletion denial, saved packages, comparisons, notification preferences, authenticated enquiry ownership, duplicate rejection, customer visibility, admin visibility, status history, consent timestamps and an audit record.

## Remaining Release Boundaries

Production transactional email and external bot-protection credentials remain configuration blockers documented by WP4. Enquiry assignment is deliberately not backed by fabricated staff data; a staff-directory capability belongs to a later admin work package.
