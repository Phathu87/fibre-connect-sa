# WP8 Phase 8.3A-1 Netlify Build and Runtime Determinism

Date: 2026-10-01

Status: PASS

Scope: resolve only Prisma clean-build generation and Node 22 repository pinning. No application feature, dependency version, migration, database, secret, Netlify account setting, or deployment was changed.

## Root Causes

1. `npm run build` previously ran only `vite build`. The generated Prisma client lives in ignored `src/generated/prisma`, so a clean checkout could reach function bundling without the backend import target.
2. CI used Node 22, but neither package metadata nor repository-controlled Netlify configuration selected that validated runtime.

## Build Lifecycle Before

```text
npm run build
`- vite build
```

Prisma generation depended on a developer or a separate validation command having run previously.

## Build Lifecycle After

```text
npm run build
|- npm run db:generate
|  `- prisma generate
`- vite build
```

The build does not run `prisma migrate deploy`, `prisma migrate dev`, `db push`, seed, or any other database mutation.

## Prisma Generation Mechanism

- Schema: `prisma/schema.prisma`
- Generator: `prisma-client`
- Output: `src/generated/prisma`
- Source control: output remains ignored in `.gitignore`
- Runtime import: `server/db/client.ts` imports `../../src/generated/prisma/client.js`
- Script: `db:generate` remains `prisma generate`
- Build command: `npm run db:generate && vite build`

Prisma generation completed without `DATABASE_URL` or `DIRECT_URL` being supplied to the command. `prisma.config.ts` retains its existing local fallback URL, and generation did not attempt a database connection.

## Node Pinning Mechanism

- Local validation: Node `v22.21.0`
- `package.json`: `engines.node = 22.x`
- GitHub Actions: `actions/setup-node` with `node-version: 22` (unchanged)
- `netlify.toml`: `[build.environment] NODE_VERSION = "22"`
- Netlify Functions: use the build Node runtime by default

No `.nvmrc` or `.node-version` was added because package metadata plus the explicit Netlify setting cover repository consumers and the deployment platform without redundant pins.

## Clean-Build Test

Before validation, the verified repository-local paths `dist`, `src/generated/prisma`, and `node_modules` were removed. Source, `.env`, migrations, and `package-lock.json` were preserved.

- Initial sandboxed `npm ci`: failed with the known Windows `EPERM`/`EACCES` cache and file-handle condition.
- Recovery: verified the repository root, removed only `node_modules` outside the restricted sandbox, and used the repository-local npm cache.
- Clean `npm ci`: PASS; 788 packages installed, 789 audited.
- Generated client before build: absent.
- `dist` before build: absent.
- Manual `npm run db:generate` before build: not run.
- `npm run build`: PASS.
- Generated client after build: present.
- `dist/index.html` after build: present.
- Production Vite build: 1,755 modules transformed; existing chunk-size warning remains deferred.

## Function and Backend Resolution

- Server TypeScript check: PASS.
- The generated Prisma client import resolves after the repository build.
- An esbuild dependency-trace bundle of `netlify/functions/api.ts` completed with `argon2` externalized as configured.
- Direct execution of the actual TypeScript function handler under production-mode placeholder configuration returned `200` for `/api/health` with `{ status: "ok", service: "fibreconnect-api", environment: "production" }` and an `x-request-id` response header.
- A platform-native `netlify build` was attempted with a transient cached Netlify CLI. It stopped before build because no Netlify project ID/link exists and requested `netlify init`, `netlify deploy`, or `netlify link`. Those account/link actions were prohibited by this phase, so deployed/platform-native bundling remains NOT VALIDATED.

## Full Validation

`npm run validate`: PASS after removal of temporary smoke bundles.

- Prisma schema validation: PASS
- Prisma generation: PASS
- ESLint: PASS
- Frontend TypeScript: PASS
- Server TypeScript: PASS
- Tests: 6 files / 44 tests PASS
- Production build: PASS

The first validation attempt stopped because temporary manual esbuild outputs under `.netlify-smoke` were correctly included by ESLint. Those disposable files were removed; no application defect or source change was involved.

## Secrets Review

The completed frontend `dist` was scanned for:

- `DATABASE_URL`
- `DIRECT_URL`
- `BOT_PROTECTION_SECRET`
- PostgreSQL URL schemes
- the Supabase pooler hostname pattern
- actual local environment values of at least eight characters, without printing those values

No server/database secret was found. The only local value match was the non-secret `NODE_ENV` text value, which is expected in frontend tooling output and is not a credential.

## Files Changed

- `package.json`: Node engine and deterministic build command
- `package-lock.json`: root package Node engine metadata only
- `netlify.toml`: repository-controlled Netlify Node 22 selection
- `docs/WP8_PHASE_8_3_NETLIFY_CONFIGURATION_AUDIT.md`: blocker status update
- `docs/WP8_PHASE_8_3A1_NETLIFY_BUILD_RUNTIME.md`: phase evidence

## Resolved Blockers

- Prisma clean-build generation: **RESOLVED**
- Node 22 runtime pinning: **RESOLVED**

## Remaining Deployment Blockers

- Transactional email production foundation
- Preview/branch database isolation
- Final production origins
- Netlify account-level secrets and scopes
- Linked-project Netlify build/deployment validation

## Recommended Next Phase

**Phase 8.3A-2 - Transactional Email Production Foundation**

Do not deploy or configure Netlify. Wait for explicit approval.
