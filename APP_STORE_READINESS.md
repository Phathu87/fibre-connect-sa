# App Store Readiness

> **App-store preparation complete at frontend/product level. Production backend, platform packaging, signing, compliance and store submission remain Codex/release-stage work.**

The current application is in the **frontend/product-readiness phase only**. A complete UI does not make the app store-ready.

## What is done (frontend level)
- PWA web app manifest (`public/manifest.json`) — name, short name, icons, theme, standalone display
- Responsive layouts from 320px to 1920px
- Installable web app preparation (manifest + theme-color)
- Offline fallback architecture prepared
- App version / platform detection abstraction points prepared

## What remains (Codex / release stage)

### Production backend & infrastructure
- Production PostgreSQL database
- Secure backend API
- Production authentication + RBAC
- Secrets management
- Privacy controls
- Production analytics
- Real coverage integrations
- Provider/product integrations
- Email / push notification infrastructure (if used)
- Rate limiting, security, audit logs, monitoring

### Native packaging & signing
- Capacitor (or equivalent) for Android/iOS packaging
- PWA packaging where appropriate
- Microsoft PWA/MSIX packaging for Windows
- Huawei-compatible Android packaging
- Android keystore
- Apple certificates & provisioning profiles
- App signing

### Developer / store accounts
- Apple Developer account
- Google Play Console account
- Huawei developer account
- Microsoft Store partner account

### Store assets & compliance
- Production domains
- Platform-specific icons (adaptive icons, app store icons)
- Screenshots (per platform/size)
- Store descriptions
- Privacy declarations & permission disclosures
- Platform compliance testing
- App Store Review (Apple)
- Play Store policy review (Google)
- Huawei review
- Microsoft certification

## Important
- PWA preparation alone does **not** guarantee acceptance by Google Play, Apple App Store, Huawei AppGallery or Microsoft Store.
- Do not display store badges linking to applications that do not yet exist. The `/download` page uses "Platform build in preparation" status until real store apps exist.
- Do not claim "app-store ready" merely because the UI is complete.
