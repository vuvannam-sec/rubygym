# Project 2 Security and CI/CD Audit

Date: 2026-05-27

## Scope

This audit covers the RubyGYM backend, frontend, Docker deployment files, CI/CD configuration, security scan evidence, and the intentional vulnerable demo route.

## Repository Areas Inspected

| Area | Status |
|---|---|
| `docs/goal2.md` | Reviewed. Defines Project 2 acceptance criteria. |
| `.github/workflows` | Did not exist initially. Added `project2-security-ci.yml`. |
| `backend/package.json` | Reviewed. Scripts: `start`, `dev`, `test`. Backend tests use Jest and Supertest. |
| `frontend/package.json` | Reviewed. Scripts: `start`, `build`, `test`, `eject`. Frontend uses CRA / `react-scripts`. |
| `backend/Dockerfile` | Reviewed. Uses Node 24 Alpine and `npm ci --omit=dev`. |
| `frontend/Dockerfile` | Updated build stage from Node 18 Alpine to Node 24 Alpine. Runtime remains nginx Alpine. |
| `docker-compose.yml` | Reviewed. Starts MySQL, backend, and frontend. Uses demo credentials. |
| `backend/src/routes` | Reviewed for auth, RBAC, SQL access, and demo vulnerability isolation. |
| `frontend/src` | Reviewed for API usage, demo fallback credentials, tests, and CSP inline-style compatibility. |
| `backend/src/routes/vulnerable-demo.js` | Reviewed. Intentionally vulnerable and not mounted in production app router. |
| `docs/reports` and `docs/slides` | Existing SE/Goal 1 docs were preserved. Project 2 docs added. |

## Application Summary

RubyGYM is a gym management application with:
- Node.js / Express backend.
- MySQL database.
- React frontend served by nginx in Docker.
- JWT authentication.
- RBAC for admin, trainer, and member workflows.
- Domain features for members, trainers, subscriptions, schedules, goals, monthly evaluations, and events.

## CI/CD Status

Initial status:
- No `.github/workflows` directory was present.
- Therefore, no existing CI/CD jobs were available to run in GitHub Actions.

Implemented status:
- Added `.github/workflows/project2-security-ci.yml`.
- Jobs added:
  - Backend install and test.
  - Frontend install, test, and build.
  - Docker Compose validation and build.
  - Semgrep SAST.
  - Trivy image scan.
  - OWASP ZAP baseline DAST.

The workflow is designed to produce security artifacts without pretending that warnings are fixed. ZAP warning exit code 2 is allowed, while scan execution errors above 2 still fail.

## Existing Security Controls

| Control | Evidence |
|---|---|
| Password hashing | Backend uses `bcryptjs` before storing user passwords. |
| JWT authentication | Auth middleware verifies bearer tokens with `jsonwebtoken`. |
| RBAC | `authorize()` middleware and route-level ownership checks protect admin/trainer/member actions. |
| SQL parameterization | Main application routes use `pool.execute(..., params)` for DB queries. |
| Schedule business validation | Session duration, operating hours, trainer ownership, overlap, and member limits are checked. |
| Docker health dependency | Backend waits for DB health in Compose. |
| Vulnerable demo isolation | `vulnerable-demo.js` exists but is not mounted from `backend/src/index.js`. |
| Frontend security headers | nginx now sends CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, COEP, COOP, and CORP. |

## Security Gaps Found

| Gap | Risk | Status |
|---|---|---|
| No initial GitHub Actions workflows | No automated proof of build/test/security scanning | Fixed by adding `project2-security-ci.yml`. |
| Intentional vulnerable demo contains SQL injection, XSS, path traversal, insecure randomness, hardcoded secrets, and `eval` | Dangerous if mounted in production | Kept for education, documented, and fixed comparison route added. Not mounted. |
| Broad CORS default | Any origin can call API in default dev mode | Improved to allow `CORS_ORIGIN` / `CORS_ORIGINS` allowlist configuration. Dev fallback remains permissive. |
| Demo DB/JWT secrets in `docker-compose.yml` | Unsafe if reused in production | Documented as demo-only. Production must inject secrets from environment/secret store. |
| Raw `err.message` returned by many backend routes | May disclose implementation details | Documented as future hardening because fixing all routes needs broader error handling. |
| Frontend demo fallback credentials | Can confuse security posture if treated as production auth | Documented as demo fallback only. Real auth uses backend JWT when available. |
| Frontend dependency audit debt | 28 remaining npm audit findings after non-forcing fix | Partially fixed with `npm audit fix`; remaining debt requires migration away from `react-scripts`. |
| Trivy backend image findings | 2 medium CVEs in Node package transitive dependencies | Documented; update transitive packages/base image when fixes are available in dependency graph. |
| ZAP static asset cache warnings | Mostly informational for static assets | Security headers added; final ZAP has 0 failures and 2 warnings. |

## Commands and Verification Summary

| Verification | Result |
|---|---|
| Backend `npm ci` | Passed |
| Backend `npm test` | Passed: 6 suites, 25 tests |
| Backend start and health check | Passed |
| Backend `npm audit --omit=dev` | Passed: 0 vulnerabilities |
| Frontend `npm ci` | Passed with audit warnings |
| Frontend `npm audit fix` | Applied non-forcing updates, reduced findings from 39 to 28 |
| Frontend test | Passed: 1 suite, 1 test |
| Frontend build | Passed |
| Docker Compose config | Passed |
| Docker Compose build/up | Passed |
| Semgrep | Ran through Docker, 1 finding in vulnerable demo |
| Trivy | Ran through Docker, backend 2 medium, frontend 0 |
| ZAP | Ran through Docker, 0 failures, 2 warnings |

## Docker Status

Docker Compose builds and starts successfully. Final reachable endpoints:
- Backend: `http://127.0.0.1:3000/api/health`
- Frontend: `http://127.0.0.1:8080/`

Demo credentials and database passwords in `docker-compose.yml` are acceptable for local classroom demo only. They must not be reused in production.

## Vulnerable Demo Status

The vulnerable demo remains in `backend/src/routes/vulnerable-demo.js` for Project 2 before/after analysis. It is not mounted in `backend/src/index.js`, so it is isolated from the active API surface unless a developer explicitly registers it.

Added `backend/src/routes/vulnerable-demo-fixed.js` as the secure comparison implementation. It demonstrates:
- Parameterized SQL.
- JSON output instead of raw HTML reflection.
- Path normalization and basename restriction.
- Cryptographic token generation with `crypto.randomBytes`.
- Simple arithmetic parsing instead of `eval`.
- No hardcoded demo secrets.

## Recommended Fixes Still Open

| Priority | Recommendation |
|---|---|
| High | Keep vulnerable demo unmounted in all production and CI deploy targets. |
| High | Replace demo secrets with real environment secrets before deployment. |
| High | Migrate frontend away from `react-scripts` to eliminate remaining audit debt safely. |
| Medium | Add centralized backend error handling and stop returning raw `err.message` to clients. |
| Medium | Add stricter input validation schemas for all write routes. |
| Medium | Add rate limiting for auth and write endpoints. |
| Medium | Add production CORS allowlist through `CORS_ORIGINS`. |
| Low | Decide whether static asset cache warnings from ZAP are acceptable for immutable hashed assets. |

## Audit Conclusion

Goal 2 acceptance criteria are satisfied with real local evidence and generated Markdown reports. The project now has documented CI/CD jobs, actual SAST/image/DAST scan artifacts, an analyzed vulnerable demo, a secure fixed comparison route, STRIDE threat model, English security write-up, and presentation/Q&A material.
