# Routes

## Public
| Path | Page |
|------|------|
| `/` | Home |
| `/coverage` | Coverage checker |
| `/coverage/results` | Coverage results |
| `/packages` | Package catalogue (filters + sort) |
| `/packages/:slug` | Package detail |
| `/compare` | Comparison |
| `/providers` | Provider list |
| `/providers/:slug` | Provider detail |
| `/networks` | Network list |
| `/networks/:slug` | Network detail |
| `/fibre/:province` | Location (province) |
| `/fibre/:province/:city` | Location (city) |
| `/fibre/:province/:city/:suburb` | Location (suburb) |
| `/business` | Business connectivity |
| `/saved` | Saved packages (guest + auth) |
| `/enquire` | Multi-step enquiry flow (`?package=slug`) |
| `/partners` | Provider partnership |
| `/help` | Help centre |
| `/help/:slug` | Help article |
| `/contact` | Contact |
| `/download` | Download / device availability |
| `/about` | About / case study |
| `/terms` | Terms of Service |
| `/privacy` | Privacy Policy |
| `/cookies` | Cookie Policy |
| `/accessibility` | Accessibility Statement |
| `/disclaimer` | Disclaimer |

## Auth
| Path | Page |
|------|------|
| `/login` | Sign in |
| `/register` | Register |
| `/forgot-password` | Forgot password |
| `/reset-password` | Reset password (`?token=`) |

## Account (protected)
| Path | Page |
|------|------|
| `/account` | Overview |
| `/account/profile` | Profile + communication prefs |
| `/account/addresses` | Saved addresses |
| `/account/saved` | Saved packages |
| `/account/comparisons` | Comparisons |
| `/account/enquiries` | Enquiries + status |
| `/account/notifications` | Notifications + prefs |

## Admin (demo, RBAC in production)
| Path | Page |
|------|------|
| `/admin` | Dashboard |
| `/admin/providers` | Providers CRUD |
| `/admin/networks` | Networks |
| `/admin/packages` | Packages CRUD + duplicate + activate |
| `/admin/coverage` | Coverage areas |
| `/admin/enquiries` | Enquiries management |
| `/admin/customers` | Customers |
| `/admin/promotions` | Promotions |
| `/admin/content` | Content / FAQs |
| `/admin/analytics` | Analytics |
| `/admin/settings` | Settings |

## Error
| Path | Page |
|------|------|
| `/404` + `*` | Page not found |