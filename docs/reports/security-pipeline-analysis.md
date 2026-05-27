# Security Pipeline Analysis

Date: 2026-05-27

## Overview

RubyGYM did not have a `.github/workflows` directory at the start of Goal 2. A Project 2 workflow was added at `.github/workflows/project2-security-ci.yml`.

Workflow triggers:
- `push` to `main` or `master`.
- `pull_request`.
- `workflow_dispatch` for manual runs.

Permissions:
- `contents: read` only.

The workflow avoids unsupported claims. It produces artifacts for scanner output and keeps warnings visible for triage.

## Job Analysis

| Job | Trigger | Purpose | Main commands | Expected output | Security value | Current status | Limitations |
|---|---|---|---|---|---|---|---|
| `backend-test` | Push, PR, manual | Verify backend install and route tests | `npm ci`, `npm test` in `backend` | Jest pass/fail | Prevents auth/RBAC/domain regressions before deployment | Locally passed: 6 suites, 25 tests | Tests mock DB; not full integration coverage |
| `frontend-test-build` | Push, PR, manual | Verify frontend install, test, and production bundle | `npm ci`, `CI=true npm test -- --watchAll=false`, `npm run build` in `frontend` | React test result and build artifact | Catches frontend route/render/build regressions | Locally passed: 1 suite, 1 test, build passed | CRA dependency audit debt remains |
| `docker-build` | After backend/frontend jobs | Validate deployment configuration and build images | `docker compose config`, `docker compose build` | Valid compose file and built images | Catches broken Dockerfiles, Compose syntax, and build-time dependency issues | Locally passed | Does not publish images |
| `semgrep-sast` | Push, PR, manual | Static application security testing | Dockerized `semgrep scan --config p/ci ...` | `docs/reports/semgrep-results.json` artifact | Finds insecure code patterns before runtime | Locally ran, 1 finding in vulnerable demo | Community rules are not exhaustive; generated docs are excluded |
| `trivy-image-scan` | After `docker-build` | Container/image vulnerability scan | Build images, then Dockerized Trivy scans for backend and frontend | `trivy-rubygym-backend.json`, `trivy-rubygym-frontend.json` artifacts | Detects OS and language package CVEs in container images | Locally ran. Backend: 2 medium. Frontend: 0 | Uses Docker image and remote DB; result changes as CVE DB changes |
| `zap-baseline-dast` | After `docker-build` | Dynamic baseline scan of running frontend | `docker compose up -d --build`, curl wait loop, Dockerized `zap-baseline.py` | `zap-baseline.html`, `zap-baseline.json`, `zap-baseline.md`, `zap-exit-code.txt` | Detects missing browser security headers and passive web issues | Locally ran. 0 failures, 2 warnings | Baseline scan is passive/lightweight and unauthenticated |

## Semgrep SAST Details

Local command:

```bash
docker run --rm -v "$PWD:/src" -w /src semgrep/semgrep:latest \
  semgrep scan --metrics=off --config p/ci \
  --exclude backend/node_modules --exclude frontend/node_modules --exclude frontend/build \
  --exclude docs/reports --exclude docs/slides \
  --json --output docs/reports/semgrep-results.json .
```

Actual result:
- Scan completed successfully.
- Scanned 118 files.
- Final finding count: 1.
- Finding is in the intentionally vulnerable demo: request-controlled expression reaches `eval` in `backend/src/routes/vulnerable-demo.js`.

Triage guidance:
- This finding is accepted only because the file is an educational demo and is not mounted in `backend/src/index.js`.
- If the vulnerable route is ever mounted in production, the finding becomes high priority and must block release.
- Use `backend/src/routes/vulnerable-demo-fixed.js` as the secure comparison.

## Trivy Container Scan Details

Local commands:

```bash
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  -v "$PWD/docs/reports:/reports" -v trivy-cache:/root/.cache/ \
  aquasec/trivy:latest image --format json \
  --output /reports/trivy-rubygym-backend.json rubygym-backend:latest

docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  -v "$PWD/docs/reports:/reports" -v trivy-cache:/root/.cache/ \
  aquasec/trivy:latest image --format json \
  --output /reports/trivy-rubygym-frontend.json rubygym-frontend:latest
```

Actual result:
- Backend image: 2 medium vulnerabilities, 0 high, 0 critical.
- Frontend image: 0 vulnerabilities.

Backend CVEs:
- `CVE-2026-45149` in `brace-expansion`, installed `5.0.5`, fixed `5.0.6`.
- `CVE-2026-42338` in `ip-address`, installed `10.1.0`, fixed `10.1.1`.

Triage guidance:
- Update the affected transitive dependency chain when upstream packages expose fixed versions.
- Keep Node and Alpine base images current.
- Treat any future high/critical image finding as a release blocker unless a documented exception exists.

## OWASP ZAP DAST Details

Local command:

```bash
docker run --rm --network host \
  -v "$PWD/docs/reports:/zap/wrk:rw" ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py -t http://127.0.0.1:8080 \
  -r zap-baseline.html -J zap-baseline.json -w zap-baseline.md
```

Actual final result:
- Exit code: 2.
- `FAIL-NEW: 0`.
- `WARN-NEW: 2`.
- `PASS: 65`.

Final warnings:
- `Storable and Cacheable Content` on five static assets.
- `Modern Web Application` on the root route.

Remediation applied before final scan:
- Added frontend nginx headers: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, COEP, COOP, CORP, and CSP.
- Removed the only frontend inline style so CSP no longer needs `style-src 'unsafe-inline'`.
- Applied security headers to `/static/` assets, not only the root route.

Triage guidance:
- ZAP exit code 2 should remain visible but not automatically fail the classroom CI because the final warnings are informational for static React assets.
- Any future `FAIL-NEW` or high-risk alert should block release until triaged.
- Add authenticated ZAP scanning later for member/trainer/admin flows.

## Security Summary Job Concept

The current workflow uploads separate artifacts. A future improvement is to add a summary job that downloads artifacts and builds a single Markdown security summary with:
- Backend/frontend test status.
- Docker build status.
- Semgrep finding count and top findings.
- Trivy high/critical count.
- ZAP fail/warn summary.

This is not required for Goal 2 because the reports in `docs/reports` already provide the summary.

## Known Pipeline Limitations

| Limitation | Impact | Recommended improvement |
|---|---|---|
| No GitHub Actions run was executed inside this local environment | Workflow syntax was parsed locally, but CI runtime was not observed | Push to GitHub and run `workflow_dispatch` |
| ZAP scan is unauthenticated | Does not test protected admin/trainer/member workflows | Add seeded login flow and authenticated ZAP context |
| Semgrep uses community rules | May miss business-logic vulnerabilities | Add custom rules for Express route security and secrets |
| Trivy CVE DB changes over time | Results may differ in later runs | Keep JSON artifacts per submission/run |
| Frontend audit debt from CRA | CI can pass while audit findings remain | Plan migration to Vite or maintained tooling |

## Exact CI Commands to Run Manually

```bash
docker compose config
docker compose build

cd backend
npm ci
npm test

cd ../frontend
npm ci
CI=true npm test -- --watchAll=false
npm run build
```

Security scans:

```bash
docker run --rm -v "$PWD:/src" -w /src semgrep/semgrep:latest semgrep scan --metrics=off --config p/ci --exclude backend/node_modules --exclude frontend/node_modules --exclude frontend/build --exclude docs/reports --exclude docs/slides --json --output docs/reports/semgrep-results.json .

docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v "$PWD/docs/reports:/reports" -v trivy-cache:/root/.cache/ aquasec/trivy:latest image --format json --output /reports/trivy-rubygym-backend.json rubygym-backend:latest
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v "$PWD/docs/reports:/reports" -v trivy-cache:/root/.cache/ aquasec/trivy:latest image --format json --output /reports/trivy-rubygym-frontend.json rubygym-frontend:latest

docker compose up -d --build
docker run --rm --network host -v "$PWD/docs/reports:/zap/wrk:rw" ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t http://127.0.0.1:8080 -r zap-baseline.html -J zap-baseline.json -w zap-baseline.md
```
