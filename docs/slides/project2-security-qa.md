# Project 2 Security Presentation Q&A

## 1. What was the main goal of Project 2?

The goal was to verify RubyGYM from a security and CI/CD perspective. That included test/build evidence, CI/CD workflow analysis, Semgrep SAST, Trivy image scanning, OWASP ZAP DAST, vulnerable demo analysis, a fixed comparison route, STRIDE threat modeling, and English presentation material.

## 2. Did the project already have CI/CD?

No. There was no `.github/workflows` directory at the start of Goal 2. I added `.github/workflows/project2-security-ci.yml` with jobs for backend tests, frontend tests/build, Docker validation/build, Semgrep, Trivy, and ZAP.

## 3. Did backend tests pass?

Yes. Backend Jest passed 6 test suites and 25 tests.

## 4. Did frontend tests and build pass?

Yes. The frontend React test passed and the production build compiled successfully.

## 5. Did Docker Compose work?

Yes. `docker compose config` passed, `docker compose build` passed, and `docker compose up -d --build` started DB, backend, and frontend. Backend health and frontend HTTP 200 checks passed.

## 6. Were Semgrep, Trivy, and ZAP actually run?

Yes. Native binaries were not installed on PATH, so each scanner was run through Docker images. The reports are saved in `docs/reports`.

## 7. What did Semgrep find?

Semgrep found 1 issue: request-controlled input reaches `eval` in `backend/src/routes/vulnerable-demo.js`. This is a real finding in the intentionally vulnerable educational demo.

## 8. Why is the Semgrep finding acceptable for this submission?

It is acceptable only because the vulnerable demo router is not mounted in `backend/src/index.js`. The finding is still documented. If the route were mounted publicly, it would be a release-blocking vulnerability.

## 9. What did Trivy find?

Trivy found 2 medium vulnerabilities in the backend image and 0 vulnerabilities in the frontend image. The backend CVEs are `CVE-2026-45149` in `brace-expansion` and `CVE-2026-42338` in `ip-address`.

## 10. Were there high or critical Trivy findings?

No. The final Trivy backend result had 0 high and 0 critical findings. The frontend image had 0 findings.

## 11. What did OWASP ZAP find?

The final ZAP baseline scan had 0 failures, 2 warnings, and 65 passed checks. The final warnings were `Storable and Cacheable Content` and `Modern Web Application`.

## 12. Why did ZAP exit with code 2?

ZAP baseline exits with code 2 when warnings are found. In the final scan, there were no failures, only warnings. The exit code was saved in `docs/reports/zap-exit-code.txt`.

## 13. What ZAP issues were fixed?

Missing security headers were fixed by updating nginx. The app now sends X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, CSP, COEP, COOP, and CORP. Static assets also receive those headers.

## 14. Why is `Storable and Cacheable Content` still present?

The warning is on static assets such as favicon, manifest, robots, and hashed CSS. Static React assets are usually cacheable by design. It should be reviewed, but it is not the same severity as a missing authentication or injection flaw.

## 15. What vulnerabilities exist in `vulnerable-demo.js`?

It demonstrates SQL injection, hardcoded secrets, reflected XSS, path traversal, insecure randomness, and `eval`-based code execution.

## 16. Did you delete the vulnerable demo?

No. The vulnerable demo was kept for educational before/after analysis. A fixed comparison file was added at `backend/src/routes/vulnerable-demo-fixed.js`.

## 17. How does the fixed demo improve security?

It uses parameterized SQL, JSON output instead of raw HTML reflection, restricted path handling, `crypto.randomBytes()` for tokens, and a simple arithmetic parser instead of `eval`.

## 18. Is the vulnerable route exposed in production?

No. It is not mounted in `backend/src/index.js`. It should remain unmounted for production and CI/CD deployments.

## 19. What are the most important STRIDE risks?

The most important risks are stolen JWTs, RBAC bypass, member data exposure, schedule/subscription tampering, DoS through unbounded requests, production secret leakage, and accidental exposure of the vulnerable demo.

## 20. What security controls already exist?

RubyGYM already uses bcrypt password hashing, JWT authentication, RBAC and ownership checks, parameterized SQL in main routes, Docker Compose health dependencies, and frontend security headers.

## 21. What security limitations remain?

Remaining limitations include frontend `react-scripts` audit debt, demo secrets in Compose, broad development CORS fallback, raw backend error messages, no rate limiting, limited request schema validation, and unauthenticated ZAP coverage only.

## 22. Why not run `npm audit fix --force`?

Because npm reported that forced fixes would make breaking dependency changes, including a bad `react-scripts` replacement path. For this submission, a non-forcing `npm audit fix` was applied and the remaining debt was documented.

## 23. What should be done about frontend audit debt?

The safest fix is to migrate away from Create React App / `react-scripts` to maintained tooling such as Vite, then rerun tests, build, npm audit, Trivy, and ZAP.

## 24. What should be done before production deployment?

Replace demo secrets, configure production CORS allowlist, keep the vulnerable demo disabled, add rate limiting, add centralized error handling, add audit logs, fix frontend audit debt, and run the GitHub Actions workflow.

## 25. What files prove the security work?

Main evidence files are `project2-test-build-evidence.md`, `security-pipeline-analysis.md`, `project2-audit.md`, `vulnerable-demo-analysis.md`, `stride-threat-model.md`, `security-writeup-en.md`, and scanner artifacts under `docs/reports`.

## 26. What should I say if asked whether the system is production-ready?

Say that the project has a strong classroom security baseline and real scan evidence, but it is not production-ready until demo secrets, frontend audit debt, centralized error handling, validation, rate limiting, and production secret management are completed.

## 27. What should I emphasize in the presentation?

Emphasize that no results were faked, all available scans were run, vulnerabilities were documented honestly, the vulnerable demo is isolated, ZAP findings were reduced with real header fixes, and remaining limitations are clearly stated.
