# Project 2 Test and Build Evidence

Date: 2026-05-27

This report records the commands executed for RubyGYM Project 2 Security/CI-CD verification. Results are from the local workspace unless noted.

## Environment

| Item | Result |
|---|---|
| Node.js | `v24.15.0` |
| npm | `11.12.1` |
| Docker | `Docker version 29.4.3, build 055a478` |
| Docker Compose | `Docker Compose version v5.1.3` |
| Native `semgrep` | Not installed on PATH |
| Native `trivy` | Not installed on PATH |
| Native `zap-baseline.py` / `zap.sh` | Not installed on PATH |

Security tools were executed through official Docker images where possible. No Semgrep, Trivy, or ZAP result was fabricated.

## Backend

| Command | Result |
|---|---|
| `cd backend && npm ci` | Passed. Installed 427 packages and audited 428 packages. npm printed deprecation warnings for transitive packages. |
| `cd backend && npm test` | Passed. 6 test suites, 25 tests, 0 snapshots. |
| `cd backend && PORT=3100 JWT_SECRET=test-secret npm start ... curl /api/health` | Passed. `/api/health` returned `{"status":"ok","service":"rubygym-api"}`. |
| `cd backend && npm audit --omit=dev` | Passed. `found 0 vulnerabilities`. |

Notes:
- The backend start check does not require a live DB connection because `/api/health` does not query the database.
- One earlier shell wrapper failed because `status` is a read-only zsh variable; the corrected wrapper used `exit_code` and passed.

## Frontend

| Command | Result |
|---|---|
| `cd frontend && npm ci` | Passed. Initial audit summary showed 39 vulnerabilities: 9 low, 11 moderate, 19 high. |
| `cd frontend && npm audit fix` | Partially remediated. Changed 25 packages. Remaining audit debt: 28 vulnerabilities: 9 low, 6 moderate, 13 high. |
| `cd frontend && CI=true npm test -- --watchAll=false` | Passed. 1 test suite, 1 test. React Router v7 future-flag warnings are non-blocking. |
| `cd frontend && npm run build` | Passed. Production build compiled successfully. Final gzip sizes: about 109.79 kB JS, 4.55 kB CSS, 1.77 kB chunk. |
| `cd frontend && npm audit --omit=dev` | Failed due remaining audit findings. Root cause is mostly `react-scripts` transitive dependencies that require risky forced replacement. |

Frontend audit limitation:
- `npm audit fix --force` was not run because it would install a breaking `react-scripts` replacement according to npm output.
- A safer future fix is to migrate from Create React App / `react-scripts` to a maintained build stack such as Vite, then rerun tests/build/audit.

## Docker Compose and Images

| Command | Result |
|---|---|
| `docker compose config` | Passed. Compose file rendered correctly. |
| `docker compose build` | Passed. Built `rubygym-backend:latest` and `rubygym-frontend:latest`. |
| `docker compose up -d --build` | Passed. Started DB, backend, and frontend containers. |
| `curl -sf http://127.0.0.1:3000/api/health` | Passed. Backend returned health JSON. |
| `curl -sI http://127.0.0.1:8080/` | Passed. Frontend returned HTTP 200 and security headers. |

Final frontend container headers observed:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: no-referrer`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`
- `Content-Security-Policy: default-src 'self'; ...`

## Semgrep SAST

Command:

```bash
docker run --rm -v "$PWD:/src" -w /src semgrep/semgrep:latest \
  semgrep scan --metrics=off --config p/ci \
  --exclude backend/node_modules --exclude frontend/node_modules --exclude frontend/build \
  --exclude docs/reports --exclude docs/slides \
  --json --output docs/reports/semgrep-results.json .
```

Result:
- Passed with exit code 0.
- Scanned 118 files.
- Ran 28 rules from the selected community ruleset.
- Found 1 finding.
- Report: `docs/reports/semgrep-results.json`.

Finding:
- `javascript.lang.security.audit.code-string-concat.code-string-concat`
- File: `backend/src/routes/vulnerable-demo.js`
- Line: 41
- Severity: `ERROR`
- Issue: request-controlled data reaches `eval` in the intentional vulnerable demo.

## Trivy Image Scans

Backend command:

```bash
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  -v "$PWD/docs/reports:/reports" -v trivy-cache:/root/.cache/ \
  aquasec/trivy:latest image --format json \
  --output /reports/trivy-rubygym-backend.json rubygym-backend:latest
```

Backend result:
- Passed with exit code 0.
- Report: `docs/reports/trivy-rubygym-backend.json`.
- Total vulnerabilities: 2.
- Severity summary: 0 critical, 0 high, 2 medium, 0 low.
- Findings:
  - `CVE-2026-45149`, package `brace-expansion`, installed `5.0.5`, fixed `5.0.6`.
  - `CVE-2026-42338`, package `ip-address`, installed `10.1.0`, fixed `10.1.1`.

Frontend command:

```bash
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  -v "$PWD/docs/reports:/reports" -v trivy-cache:/root/.cache/ \
  aquasec/trivy:latest image --format json \
  --output /reports/trivy-rubygym-frontend.json rubygym-frontend:latest
```

Frontend result:
- Passed with exit code 0.
- Report: `docs/reports/trivy-rubygym-frontend.json`.
- Total vulnerabilities: 0.

## OWASP ZAP Baseline DAST

Command:

```bash
docker run --rm --network host \
  -v "$PWD/docs/reports:/zap/wrk:rw" ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py -t http://127.0.0.1:8080 \
  -r zap-baseline.html -J zap-baseline.json -w zap-baseline.md
```

Final result:
- Exit code: 2, recorded in `docs/reports/zap-exit-code.txt`.
- ZAP exit code 2 means warnings were found.
- `FAIL-NEW: 0`.
- `WARN-NEW: 2`.
- `PASS: 65`.
- Reports:
  - `docs/reports/zap-baseline.html`
  - `docs/reports/zap-baseline.json`
  - `docs/reports/zap-baseline.md`

Final ZAP warnings:
- `Storable and Cacheable Content` on five static assets.
- `Modern Web Application` on the root route.

Headers added during remediation reduced ZAP warnings from 8 to 2.

## Final Evidence Summary

| Area | Final status |
|---|---|
| Backend install/test/start | Passed |
| Frontend install/test/build | Passed |
| Docker compose config/build/up | Passed |
| Semgrep SAST | Ran through Docker, 1 finding in vulnerable demo |
| Trivy image scan | Ran through Docker, backend 2 medium CVEs, frontend 0 CVEs |
| OWASP ZAP DAST | Ran through Docker, 0 failures, 2 warnings |
| npm audit backend production deps | 0 vulnerabilities |
| npm audit frontend dependencies | 28 remaining, documented as migration debt |
