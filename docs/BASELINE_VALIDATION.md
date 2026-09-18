# Baseline Validation

Date: 2026-09-17

This document records the initial exported frontend state and the current stabilised baseline. It does not claim that production infrastructure exists.

## Repository And Environment

| Check | Result |
| --- | --- |
| Application | React 18, Vite 8, JavaScript/JSX with TypeScript `checkJs` |
| Package manager | npm with `package-lock.json` |
| Root Git checkout | NOT AVAILABLE; the workspace root has no `.git` directory |
| Original reference app | Preserved under `mweb-fiber-app/` and not modified |
| Database | PostgreSQL/Prisma schema and migration implemented; runtime execution NOT VALIDATED |
| Backend API | NOT IMPLEMENTED |
| Production deployment | NOT VALIDATED |
| Automated tests | No test runner or test suite configured at baseline |

## Initial Command Evidence

| Command | Initial result | Important evidence |
| --- | --- | --- |
| `npm ci` | PASS after elevated filesystem execution | Installed dependencies successfully; the first sandboxed attempt hit Windows cache/file permission errors |
| `npm run lint` | FAIL | 40 unused-import errors in the exported frontend |
| `npm run typecheck` | FAIL | Component prop inference, UI wrapper typing, filter/enquiry state and service typing errors |
| `npm run build` | FAIL | Missing `NetworkPackageGroup` module |
| Tests | NOT AVAILABLE | No test script or test files existed |
| Dependency advisory refresh | NOT VALIDATED initially | Registry DNS was unavailable during the first audit attempt |

## Stabilised WP0 Evidence

| Command | Result | Evidence |
| --- | --- | --- |
| `npm run lint` | PASS | Exit code 0 on 2026-09-17 |
| `npm run typecheck` | PASS | Exit code 0 on 2026-09-17 with `checkJs` enabled |
| `npm run build` | PASS WITH WARNINGS | Exit code 0; 1,742 modules transformed; stale browser data and a 517.04 kB minified chunk warning |
| Installed dependency audit | PASS FOR LOCAL LOCK STATE | npm reported 0 known vulnerabilities while operating from the installed/offline package state |

## Baseline Limitations

- Passing frontend checks do not validate a production database, authentication system, provider integrations, notifications, deployment, monitoring, backups or native builds.
- The current authentication and application data stores are browser-local demonstrations.
- No clean-checkout CI run is available because the workspace root is not a Git checkout.

## Current Foundation Blocker

The PostgreSQL schema and initial migration artifact now exist, but this host has no PostgreSQL service, `psql` executable or Docker runtime. Migration and seed execution remain `NOT VALIDATED` until a reachable development `DATABASE_URL` is supplied or a database is provisioned.
