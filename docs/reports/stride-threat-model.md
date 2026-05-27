# RubyGYM STRIDE Threat Model

Date: 2026-05-27

## Scope

This threat model covers RubyGYM authentication, RBAC, member personal data, trainer schedules, training goals, subscriptions, monthly evaluations, events, database, Docker deployment, CI/CD pipeline, secrets, and environment variables.

STRIDE categories:
- Spoofing
- Tampering
- Repudiation
- Information Disclosure
- Denial of Service
- Elevation of Privilege

Priority scale:
- High: must fix before production or public deployment.
- Medium: important hardening item.
- Low: useful improvement or accepted classroom limitation.

## System Assets

| Asset | Description |
|---|---|
| Users and roles | Admin, trainer, and member identities. |
| JWTs | Bearer tokens used for API authentication. |
| Member personal data | Name, email, phone, trainer assignment, referral details. |
| Trainer schedules | Training sessions, member assignments, operating-hour constraints. |
| Training goals | Member fitness goals, target weight/BMI/date, notes. |
| Subscriptions | Plan type, start/end date, loyalty/referral bonus status. |
| Monthly evaluations | Trainer/member evaluation data, BMI/weight notes. |
| Events | Public gym events created by admin. |
| Database | MySQL data store and seed data. |
| Docker deployment | MySQL, backend, frontend containers and nginx. |
| CI/CD pipeline | GitHub Actions workflow and generated security artifacts. |
| Secrets and env vars | DB password, JWT secret, API URL, CORS origins. |

## STRIDE Matrix

| Area | STRIDE | Threat | Impact | Existing mitigation | Recommended improvement | Priority |
|---|---|---|---|---|---|---|
| Authentication and JWT | Spoofing | Attacker forges or steals JWT | Unauthorized API access | JWT verification in `authenticate`; tokens expire in 24h | Require strong `JWT_SECRET`, rotate secrets, use HTTPS, consider shorter expiry and refresh flow | High |
| Authentication and JWT | Information Disclosure | Raw login/auth errors reveal internals | Helps attackers enumerate system behavior | Invalid credentials return generic 401 | Add centralized error handler for all auth failures and audit logs | Medium |
| RBAC | Elevation of Privilege | Member or trainer calls admin-only route | Unauthorized creation/deletion of trainers, members, events | `authorize('ADMIN')` and ownership checks on routes | Add route-level authorization tests for every protected endpoint | High |
| RBAC | Tampering | Trainer modifies another trainer/member data | Data corruption or privacy breach | Ownership checks in trainer, member, schedule, goal, subscription, evaluation routes | Add negative tests for each cross-tenant access case | High |
| Member personal data | Information Disclosure | Member profile, phone, email, referral data exposed to wrong user | Privacy violation | `canAccessMember` limits member profile access | Minimize returned fields, add audit logging for admin/trainer access | High |
| Member personal data | Repudiation | User denies changing profile or referral-related data | Dispute cannot be resolved | Basic API response messages | Add write audit table with actor, action, target, timestamp | Medium |
| Trainer schedule management | Tampering | User changes session date/time/member list illegally | Overbooked trainer or invalid session | Business rules validate duration, operating hours, overlap, and ownership | Add DB transactions around create/update plus database constraints where possible | High |
| Trainer schedule management | Denial of Service | Large schedule/member payloads consume API/DB resources | API slowdown | JSON parser default limits and validation logic | Set explicit request body limits and rate limits for write endpoints | Medium |
| Training goals | Tampering | Member changes another member goal | Incorrect goals/evaluations | `canViewMemberGoal` and `canUpdateMemberGoal` restrict access | Add schema validation for numeric ranges and target dates | Medium |
| Training goals | Information Disclosure | Goal notes reveal health information | Privacy impact | Goal routes require authenticated and authorized access | Avoid exposing notes to users without direct need; add audit logging | Medium |
| Subscription data | Tampering | Member creates subscription for another member | Billing/account integrity issue | Member create route checks own member ID; admin can manage all | Add stricter plan enum validation and DB constraints | High |
| Subscription data | Repudiation | User disputes subscription changes | Cannot prove who changed plan/date | API returns basic success messages | Add subscription change audit history | Medium |
| Monthly evaluations | Information Disclosure | Evaluation data exposed across trainer/member boundary | Health/privacy impact | `canAccessEvaluation` checks role and ownership | Add field minimization and audit logs for reads/writes | High |
| Monthly evaluations | Tampering | Trainer evaluates member not assigned to them | Incorrect health progress data | `validateTrainerOwnClient` enforces ownership | Add DB-level foreign key/constraint strategy for trainer-member relation | High |
| Events | Tampering | Non-admin creates/updates/deletes events | Public content integrity issue | Event write routes require `authorize('ADMIN')` | Validate event date/image URL and sanitize display content | Medium |
| Events | Information Disclosure | Public event endpoints leak too much creator data | Low privacy risk | Only creator name is joined | Keep public event payload minimal | Low |
| Database | Tampering | SQL injection modifies or reads data | Data breach or data corruption | Main routes use parameterized `pool.execute` | Keep Semgrep in CI and add code review rule against string-built SQL | High |
| Database | Denial of Service | Unbounded queries or connection exhaustion | Backend unavailable | MySQL pool connection limit is 10 | Add pagination, indexes, query timeouts, and rate limits | Medium |
| Docker deployment | Information Disclosure | Demo DB/JWT secrets in Compose reused in production | Credential compromise | Compose is local demo configuration | Use `.env`/secret store and require production secret override | High |
| Docker deployment | Elevation of Privilege | Containers run with unnecessary privileges | Larger blast radius after compromise | Alpine images and limited exposed ports | Add non-root users, read-only filesystem where feasible, and drop capabilities | Medium |
| Docker deployment | Information Disclosure | Missing browser security headers expose frontend to clickjacking/content sniffing risks | Browser-side hardening gap | nginx now sends CSP, XFO, XCTO, Referrer-Policy, Permissions-Policy, COEP, COOP, CORP | Keep ZAP in CI to detect header regressions | Medium |
| CI/CD pipeline | Tampering | Malicious PR changes workflow or disables scans | Bad code reaches submission/deployment | Workflow checked into repository | Protect main branch and require review for workflow changes | High |
| CI/CD pipeline | Repudiation | Cannot prove which scan result belongs to which commit | Weak submission evidence | Reports are generated and uploaded as artifacts in workflow | Include commit SHA and date in generated summary artifact | Medium |
| CI/CD pipeline | Denial of Service | Scans are slow or fail due external DB/image pulls | CI delay or flaky pipeline | Dockerized scans are explicit and artifact-based | Cache Trivy DB and pin action/image versions for repeatability | Medium |
| Secrets and env vars | Information Disclosure | Secrets committed or printed in logs | Credential compromise | Demo vulnerable route is not mounted; secret-like values documented as fake/demo | Add secret scanning, rotate any real exposed secret, keep `.env` out of git | High |
| Vulnerable demo | Elevation of Privilege | `eval` endpoint gets mounted publicly | Remote code execution | Vulnerable router is not mounted; fixed route added | Gate demo behind local-only flag if ever mounted | High |

## Highest Priority Threats

1. Production secret management: replace all demo secrets with real environment-injected secrets.
2. Keep the vulnerable demo unmounted in production.
3. Preserve RBAC and ownership checks for member/trainer/admin boundaries.
4. Migrate away from frontend `react-scripts` audit debt.
5. Add centralized error handling and audit logging.

## Existing Mitigations Summary

- Passwords are hashed with bcrypt.
- JWTs are verified for authenticated API routes.
- RBAC and ownership checks exist across major domain routes.
- SQL queries in main routes use parameter binding.
- Frontend nginx now sends security headers.
- Docker builds work and can be scanned by Trivy.
- Semgrep detects the intentional `eval` vulnerability.
- ZAP baseline has no final failures.

## Recommended Roadmap

| Phase | Work |
|---|---|
| Before public deployment | Replace demo secrets, set `CORS_ORIGINS`, keep vulnerable demo disabled, run CI scans. |
| Short term | Add rate limiting, centralized error handling, and request validation schemas. |
| Medium term | Add audit logging and authenticated DAST coverage. |
| Longer term | Migrate frontend build tooling and add custom Semgrep rules for project-specific risks. |

## Conclusion

RubyGYM has solid baseline controls for a classroom project: JWT authentication, RBAC, parameterized SQL, Dockerized deployment, and CI/CD security scans. The highest residual risks are demo secrets, frontend dependency audit debt, broad dev defaults, and the intentional vulnerable demo if it is ever mounted outside a controlled teaching context.
