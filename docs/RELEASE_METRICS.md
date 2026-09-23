# Release Metrics

| Category | Metric | Source | Initial alert/gate |
| --- | --- | --- | --- |
| Technical | API 5xx rate | Structured request logs | Investigate sustained increase above 1% |
| Technical | p95 API latency | Hosting/log aggregation | Investigate sustained increase above 1.5 seconds |
| Technical | `/api/ready` availability | External uptime monitor | Page after two consecutive failures |
| Technical | Database pool saturation | Supabase metrics | Alert before connection exhaustion |
| Security | Authentication rate-limit events | Structured logs | Investigate abnormal source/volume pattern |
| Security | Bot verification failures | Turnstile + API logs | Investigate sustained anomaly |
| Security | Privileged audit events | `AuditLog` | Review role/status changes and unusual volume |
| Operational | Enquiry processing backlog | Enquiry status/age query | Define threshold with sales operations |
| Operational | Provider integration failures | Provider adapter telemetry | Alert when live adapter is enabled |
| Product | Coverage-to-package conversion | Consent-gated analytics | Baseline after real traffic exists |
| Product | Package-to-enquiry conversion | Consent-gated analytics | Baseline after real traffic exists |
| Product | Enquiry completion time | Enquiry timestamps | Baseline after operational SLA is approved |

Thresholds without production traffic are provisional. Do not convert demo activity into product-health claims.
