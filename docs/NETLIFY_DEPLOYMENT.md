# Netlify Deployment

Date: 2026-09-23

## Source

The original MWEB repository identified `https://mweb-fiber-app.netlify.app/` as its public demo. GitHub also recorded a historical `mweb-fiber-app-2a72` production deployment name. Both corresponding Netlify addresses returned Netlify `Site not found` during the FibreConnect migration, and the old source contains no `netlify.toml`, site ID or local `.netlify` link metadata.

The active source repository is `https://github.com/Phathu87/fibre-connect-sa.git`. FibreConnect must be connected to a Netlify site from that repository rather than relying on the removed historical deployment.

## Repository Configuration

`netlify.toml` defines:

- `npm run build` with `dist` as the published frontend;
- `netlify/functions` as the serverless function directory;
- `/api/*` routing to the Fastify function bridge;
- an SPA fallback to `index.html`;
- baseline static security headers and immutable caching for hashed assets.

The function bridge reuses the existing Fastify composition through `app.inject()`. The browser continues to call same-origin `/api`, so production does not need a separate public API origin.

## Required Netlify Variables

- `NODE_ENV=production`
- `DATABASE_URL`
- `PUBLIC_APP_URL` set to the final Netlify/custom canonical URL
- `CORS_ORIGINS` set to the exact canonical URL
- `TRUST_PROXY=true`
- `SESSION_COOKIE_NAME=fc_session`
- `SESSION_TTL_HOURS=168` or the approved production duration
- `BOT_PROTECTION_SECRET` after the Turnstile client integration is enabled

`DIRECT_URL` is required only for migration jobs and must not be exposed to the frontend.

## Account-Level Work

Connect the active GitHub repository to the user-owned Netlify account, set the variables above, select or create the final FibreConnect site name, and trigger a production deploy. This requires Netlify account access and production secrets. It is not validated merely by committing this configuration.
