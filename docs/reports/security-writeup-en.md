# RubyGYM Project 2 Security Write-Up

Date: 2026-05-27

## 1. Project Overview

RubyGYM is a gym management web application. The system supports login and registration, role-based access control, member management, trainer management, subscriptions, training schedules, training goals, monthly evaluations, and public events.

The application has three main runtime parts:
- Backend: Node.js and Express API.
- Database: MySQL.
- Frontend: React application served by nginx.

## 2. Security Objectives

The Project 2 security objectives are:
- Verify build and test commands for backend and frontend.
- Add or document CI/CD security pipeline jobs.
- Run Semgrep SAST and document findings honestly.
- Run Trivy container/image scanning and document findings honestly.
- Run OWASP ZAP DAST and document findings honestly.
- Analyze the intentional vulnerable demo.
- Provide a secure fixed version or a clear fix plan.
- Build a STRIDE threat model.
- Produce English security documentation and presentation material.

## 3. Architecture Summary

The frontend calls the backend API through Axios. The backend validates JWT bearer tokens on protected routes and uses MySQL through `mysql2/promise`. Docker Compose starts MySQL, backend, and frontend containers for local deployment.

Important URLs in the local Docker stack:
- Backend health: `http://127.0.0.1:3000/api/health`
- Frontend: `http://127.0.0.1:8080/`

## 4. Authentication and Authorization

Authentication is implemented with JWT:
- Login checks user email and password hash.
- Passwords are verified with `bcryptjs`.
- JWT includes user ID, email, and role.
- Protected routes use the `authenticate` middleware.

Authorization is role-based:
- Admin can manage trainers, members, events, and broad data.
- Trainers can manage or view their assigned clients and schedules.
- Members can view and update their own profile, goals, and subscriptions.

Security notes:
- JWT secret must be a strong environment secret in production.
- Demo Compose values must not be reused for production.
- More negative authorization tests should be added for every protected route.

## 5. Input Validation and SQL Safety

The main application routes generally use parameterized SQL through `pool.execute(sql, params)`. This is the correct baseline defense against SQL injection.

Business validation exists for important workflows:
- Schedule duration cannot exceed two hours.
- Sessions must be inside operating hours.
- Trainer/member ownership is checked.
- Members cannot access another member's protected data.
- Trainers cannot modify another trainer's resources.

Remaining hardening items:
- Add request schema validation for all write routes.
- Add centralized error handling instead of returning raw `err.message`.
- Add rate limiting for login and write-heavy endpoints.
- Add pagination and query limits for list endpoints.

## 6. CI/CD Security Pipeline

The repository did not have a workflow initially. A GitHub Actions workflow was added:

`/.github/workflows/project2-security-ci.yml`

Jobs:
- Backend install and test.
- Frontend install, test, and build.
- Docker Compose validation and build.
- Semgrep SAST.
- Trivy image scan.
- OWASP ZAP baseline DAST.

The workflow uploads scanner reports as artifacts. ZAP warning exit code 2 is recorded and allowed, while execution errors above 2 fail the job.

## 7. Semgrep SAST

Semgrep was not installed as a native local binary. It was run through Docker:

```bash
docker run --rm -v "$PWD:/src" -w /src semgrep/semgrep:latest \
  semgrep scan --metrics=off --config p/ci \
  --exclude backend/node_modules --exclude frontend/node_modules --exclude frontend/build \
  --exclude docs/reports --exclude docs/slides \
  --json --output docs/reports/semgrep-results.json .
```

Actual result:
- Scan completed successfully.
- Findings: 1.
- The finding is in `backend/src/routes/vulnerable-demo.js` where request-controlled input flows into `eval`.

Interpretation:
- This is a real finding.
- It is acceptable only because the file is intentionally vulnerable and not mounted in the active Express app.
- If mounted in production, it must block release.

## 8. Trivy Container Scanning

Trivy was not installed as a native local binary. It was run through Docker against the built images.

Actual backend result:
- Report: `docs/reports/trivy-rubygym-backend.json`
- Total vulnerabilities: 2.
- Severity: 2 medium, 0 high, 0 critical.
- CVEs: `CVE-2026-45149` in `brace-expansion`, `CVE-2026-42338` in `ip-address`.

Actual frontend result:
- Report: `docs/reports/trivy-rubygym-frontend.json`
- Total vulnerabilities: 0.

Interpretation:
- Backend image does not currently have high/critical CVEs from Trivy.
- Medium findings should be fixed by updating affected transitive packages when safe.
- Future high/critical image findings should block release unless explicitly accepted.

## 9. OWASP ZAP DAST

ZAP was not installed as a native local binary. It was run through the official Docker image against the running frontend:

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
- `Storable and Cacheable Content` on static assets.
- `Modern Web Application` on the root route.

Security hardening applied:
- Added nginx security headers.
- Removed the frontend inline style so the CSP can avoid `style-src 'unsafe-inline'`.
- Applied headers to static assets as well as the root route.

## 10. Vulnerable Demo Before/After

The vulnerable demo file is `backend/src/routes/vulnerable-demo.js`. It includes examples of:
- SQL injection.
- Hardcoded secrets.
- Reflected XSS.
- Path traversal.
- Insecure token randomness.
- `eval`-based code execution.

The fixed comparison file is `backend/src/routes/vulnerable-demo-fixed.js`. It demonstrates:
- Parameterized SQL.
- JSON response instead of raw HTML reflection.
- Restricted file path resolution.
- `crypto.randomBytes()` for token generation.
- Simple arithmetic parsing instead of `eval`.
- No hardcoded secrets.

The vulnerable route must stay unmounted in production. It is useful for education and SAST demonstration only.

## 11. STRIDE Summary

High-priority STRIDE risks:
- Spoofing: stolen or forged JWTs if secrets are weak.
- Tampering: cross-role changes to member/trainer/subscription/evaluation data.
- Information Disclosure: member personal data and health evaluation data exposure.
- Denial of Service: unbounded requests or expensive queries.
- Elevation of Privilege: vulnerable demo mounted publicly or broken RBAC checks.

Existing mitigations:
- JWT verification.
- RBAC and ownership checks.
- Parameterized SQL.
- Dockerized scanning.
- Frontend security headers.

Recommended improvements:
- Real production secret management.
- Centralized error handling.
- Request validation schemas.
- Audit logging.
- Rate limiting.
- Authenticated DAST tests.

## 12. Security Hardening Improvements Applied

Applied changes:
- Added `.github/workflows/project2-security-ci.yml`.
- Added `backend/src/routes/vulnerable-demo-fixed.js`.
- Added configurable backend CORS origins using `CORS_ORIGIN` or `CORS_ORIGINS`.
- Updated frontend Docker build stage to Node 24 Alpine.
- Added nginx browser security headers.
- Removed frontend inline style usage and replaced it with CSS classes.
- Ran `npm audit fix` in frontend without `--force`, reducing audit findings from 39 to 28.

Generated evidence:
- `docs/reports/semgrep-results.json`
- `docs/reports/trivy-rubygym-backend.json`
- `docs/reports/trivy-rubygym-frontend.json`
- `docs/reports/zap-baseline.html`
- `docs/reports/zap-baseline.json`
- `docs/reports/zap-baseline.md`
- `docs/reports/zap-exit-code.txt`

## 13. Limitations

- Native Semgrep, Trivy, and ZAP binaries were not installed locally; Docker images were used instead.
- ZAP baseline scan is unauthenticated and passive. It does not cover admin/trainer/member logged-in flows.
- Frontend still has 28 npm audit findings because `react-scripts` transitive fixes require breaking migration.
- Demo secrets remain in Docker Compose for classroom local setup and must not be used in production.
- Main route error handling still often returns raw `err.message`.
- No GitHub-hosted Actions run was executed from this local environment; workflow YAML was parsed locally and commands were run manually.

## 14. Future Improvements

Recommended next work:
- Push the workflow to GitHub and run `workflow_dispatch`.
- Add audit logging for authentication, subscription, schedule, evaluation, and admin changes.
- Add express rate limiting.
- Add validation middleware such as Joi, Zod, or express-validator.
- Replace Create React App with Vite or another maintained frontend build stack.
- Add authenticated ZAP automation for protected routes.
- Add custom Semgrep rules for RubyGYM route authorization patterns.
- Use Docker secrets or a managed secret store for production.

## 15. Conclusion

RubyGYM now has complete Project 2 security/CI-CD submission material. The build and test path passes, Docker deployment works, Semgrep/Trivy/ZAP were run with real outputs, the vulnerable demo is analyzed and isolated, a fixed comparison route exists, and STRIDE/presentation/Q&A documents are available. The remaining security risks are documented honestly and should be treated as future hardening work before any real production deployment.
