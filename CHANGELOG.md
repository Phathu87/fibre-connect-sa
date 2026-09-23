# Changelog

All notable production migration changes are recorded here. The project follows semantic versioning once the first production release is tagged.

## Unreleased

### Added

- Fastify, Prisma and PostgreSQL production foundation.
- Database-backed catalogue, coverage, authentication/RBAC, account data and enquiry operations.
- Privacy export, password-confirmed account erasure, enquiry anonymization and admin audit visibility.
- Netlify SPA/serverless API configuration and GitHub Actions validation pipeline.

### Security

- Argon2id passwords, opaque hashed sessions, CSRF, exact-origin CORS, Helmet, route rate limits, optional Turnstile verification and structured-log redaction.

### Known Release Blockers

- Live provider coverage/commercial catalogue feeds.
- Production transactional email and Turnstile credentials/client activation.
- Netlify account connection, final canonical domain and production environment configuration.
- Controlled major-version dependency remediation and production backup/restore exercise.
