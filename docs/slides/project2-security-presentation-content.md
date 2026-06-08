# Project 2 Security Presentation Content

## Slide 1 - RubyGYM Project 2

Title: RubyGYM Security and CI/CD Verification

Key points:
- Gym management system with backend, frontend, MySQL, and Docker deployment.
- Project 2 focus: CI/CD, SAST, image scanning, DAST, vulnerable demo, STRIDE.
- All security results shown are from actual local commands or documented limitations.

## Slide 2 - Project Overview

Key points:
- Backend: Node.js and Express.
- Frontend: React served by nginx.
- Database: MySQL.
- Features: login/register, RBAC, members, trainers, subscriptions, schedules, goals, evaluations, events.

## Slide 3 - Security Goals

Key points:
- Verify test/build path.
- Add CI/CD pipeline jobs.
- Run Semgrep SAST.
- Run Trivy image scanning.
- Run OWASP ZAP DAST.
- Analyze vulnerable demo and provide fixed version.
- Build STRIDE model and security write-up.

## Slide 4 - CI/CD Pipeline Overview

Actual result:
- No `.github/workflows` directory existed initially.
- Added `.github/workflows/project2-security-ci.yml`.

Pipeline jobs:
- Backend install and test.
- Frontend install, test, and build.
- Docker Compose validation and build.
- Semgrep SAST.
- Trivy image scan.
- OWASP ZAP baseline DAST.

## Slide 5 - Build/Test Job

Commands run:
- `cd backend && npm ci && npm test`
- `cd frontend && npm ci && CI=true npm test -- --watchAll=false && npm run build`

Actual results:
- Backend: 6 test suites, 25 tests passed.
- Frontend: 1 test suite, 1 test passed.
- Frontend production build compiled successfully.
- Backend health check returned OK.

## Slide 6 - Docker Verification

Commands run:
- `docker compose config`
- `docker compose build`
- `docker compose up -d --build`

Actual results:
- Compose validation passed.
- Backend and frontend images built.
- Backend health endpoint worked.
- Frontend returned HTTP 200.

## Slide 7 - Semgrep SAST

Command run through Docker:
- `semgrep scan --metrics=off --config p/ci ...`

Actual result:
- Scan completed successfully.
- Scanned 118 files.
- Findings: 1.

Finding:
- `eval` receives request-controlled input in `backend/src/routes/vulnerable-demo.js`.

Interpretation:
- Real finding.
- Expected because this is the intentional vulnerable demo.
- Safe only because the route is not mounted in the active API.

## Slide 8 - Trivy Image Scan

Commands run through Docker:
- Scan `rubygym-backend:latest`.
- Scan `rubygym-frontend:latest`.

Actual results:
- Backend image: 2 medium CVEs, 0 high, 0 critical.
- Frontend image: 0 CVEs.

Backend CVEs:
- `CVE-2026-45149` in `brace-expansion`.
- `CVE-2026-42338` in `ip-address`.

## Slide 9 - OWASP ZAP DAST

Command run through Docker:
- `zap-baseline.py -t http://127.0.0.1:8080 ...`

Initial result:
- ZAP found missing security headers.

Fixes applied:
- Added nginx security headers.
- Added headers to `/static/` assets.
- Removed frontend inline style so CSP can avoid `unsafe-inline`.

Final result:
- `FAIL-NEW: 0`
- `WARN-NEW: 2`
- `PASS: 65`

## Slide 10 - Vulnerable Demo

File:
- `backend/src/routes/vulnerable-demo.js`

Purpose:
- Educational before version for Project 2.

Vulnerabilities:
- SQL injection.
- Hardcoded secrets.
- Reflected XSS.
- Path traversal.
- Insecure randomness.
- `eval` code execution.

Important safety point:
- The vulnerable router is not mounted in `backend/src/index.js`.

## Slide 11 - Before/After Remediation

Fixed comparison file:
- `backend/src/routes/vulnerable-demo-fixed.js`

Before:
- String-built SQL.
- Raw HTML reflection.
- Raw path concatenation.
- `Math.random()` token.
- `eval()` calculator.
- Hardcoded fake secrets.

After:
- Parameterized SQL.
- JSON response.
- Restricted file path handling.
- `crypto.randomBytes()` token.
- Safe arithmetic parser.
- No hardcoded secrets.

## Slide 12 - STRIDE Threat Model Summary

High-priority risks:
- Spoofing: stolen or forged JWTs.
- Tampering: unauthorized member/trainer/subscription changes.
- Information Disclosure: member and evaluation data.
- Denial of Service: expensive requests or unbounded payloads.
- Elevation of Privilege: RBAC bypass or vulnerable demo exposure.

Existing mitigations:
- JWT verification.
- RBAC and ownership checks.
- Parameterized SQL.
- Dockerized security scans.
- Frontend security headers.

## Slide 13 - Security Improvements Applied

Applied changes:
- Added GitHub Actions security workflow.
- Added fixed vulnerable demo route.
- Made backend CORS configurable by environment.
- Updated frontend Docker build stage to Node 24.
- Added nginx browser security headers.
- Removed frontend inline style.
- Ran `npm audit fix` without forcing breaking changes.

## Slide 14 - Actual Results vs Limitations

Actual results:
- Backend tests pass.
- Frontend tests/build pass.
- Docker Compose builds and runs.
- Semgrep, Trivy, and ZAP all ran through Docker.

Limitations:
- Native scanner binaries were not installed; Docker scanner images were used.
- ZAP baseline is unauthenticated.
- Frontend still has 28 npm audit findings from `react-scripts` transitive dependencies.
- Demo secrets remain in Compose for classroom local use only.

## Slide 15 - Future Work

Recommended next steps:
- Run the GitHub Actions workflow in GitHub.
- Migrate frontend from CRA / `react-scripts` to maintained tooling.
- Add request validation middleware.
- Add centralized backend error handling.
- Add rate limiting.
- Add audit logging.
- Add authenticated ZAP scans for admin/trainer/member workflows.

## Slide 16 - Conclusion

Conclusion:
- Project 2 acceptance criteria are complete.
- CI/CD security workflow exists.
- Test/build/Docker evidence is documented.
- Semgrep, Trivy, and ZAP were run with real artifacts.
- Vulnerable demo is analyzed and safely isolated.
- Fixed comparison, STRIDE, write-up, slides, and Q&A are complete.
