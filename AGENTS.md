# AGENTS.md

## Project Context

This is the FibreConnect SA application repository. Treat it as user-owned application code, keep changes focused on the user's request, and preserve existing project conventions.

Start with `README.md` for local setup, environment variables, and publish workflow.

## Key Files

- `src/`: frontend application source.
- `src/services/`: replaceable data and integration boundaries.
- `vite.config.js`: standard Vite configuration.
- `.env.local`: local-only environment values; never commit secrets.

## Working Notes

- Use `npm run dev` for local frontend development.
- Treat the nested `mweb-fiber-app/` directory as the original reference project; do not modify it unless explicitly requested.
- Keep demo data and demo authentication clearly labelled until production services replace them.
- Run the relevant checks from `package.json` before finishing code changes.
