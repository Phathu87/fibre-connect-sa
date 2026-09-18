# Environment Variables

Future production environment variables. **Never commit real secrets.** These are placeholders only — values are managed in the production environment, not in the frontend.

## App and server
| Variable | Purpose |
|----------|---------|
| `PUBLIC_APP_URL` | Public canonical URL (SEO, sitemap, OG) |
| `API_BASE_URL` | Backend API base URL |
| `HOST` | API bind address; use `127.0.0.1` locally |
| `PORT` | API listen port |
| `LOG_LEVEL` | Structured server log level |
| `CORS_ORIGINS` | Comma-separated browser origins allowed to call the API |
| `TRUST_PROXY` | Enable only behind a known trusted reverse proxy |

## Database
| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |

## Auth
| Variable | Purpose |
|----------|---------|
| `AUTH_SECRET` | JWT/session signing secret |
| `AUTH_PROVIDER` | Auth provider config (e.g. custom, Auth0, Clerk) |

## Coverage & geolocation
| Variable | Purpose |
|----------|---------|
| `MAPS_API_KEY` | Maps/embed key |
| `GEOCODING_API_KEY` | Address geocoding |
| `COVERAGE_PROVIDER_API_URL` | Coverage provider endpoint |
| `COVERAGE_PROVIDER_API_KEY` | Coverage provider auth |

## Email & notifications
| Variable | Purpose |
|----------|---------|
| `EMAIL_PROVIDER_API_KEY` | Transactional email |
| `SMS_PROVIDER_API_KEY` | SMS (optional) |
| `PUSH_PROVIDER_KEY` | Push notifications (optional) |

## Analytics & monitoring
| Variable | Purpose |
|----------|---------|
| `ANALYTICS_ID` | GA4 measurement ID |
| `GTM_ID` | Google Tag Manager (optional) |
| `POSTHOG_KEY` | PostHog project key (optional) |
| `SENTRY_DSN` | Error tracking |

## Security
| Variable | Purpose |
|----------|---------|
| `RATE_LIMIT_*` | Rate limit config |
| `CSRF_SECRET` | CSRF protection |

## Notes
- The frontend never reads these directly except `PUBLIC_APP_URL` (for canonical/OG) and `API_BASE_URL` (via the API adapter).
- All other variables are server-side only.
- Server startup validates required variables and reports field names without echoing secret values.
- `.env.example` contains non-secret examples only. Real values belong in local or deployment secret storage.
- Replace `PUBLIC_APP_URL` placeholders in `index.html`, `public/robots.txt` and `public/manifest.json` during deployment.
