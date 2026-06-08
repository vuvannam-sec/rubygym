# Goal 2 — Complete RubyGYM Project 2 Security and CI/CD Submission

## 1. Purpose

Complete RubyGYM for Project 2 Security/CI-CD final submission.

This goal focuses on:
- CI/CD pipeline verification
- Security testing evidence
- Semgrep SAST
- Trivy container/image scanning
- OWASP ZAP DAST
- Vulnerable demo analysis
- Secure fixed version for comparison
- STRIDE threat model
- English security write-up
- Project 2 presentation content in Markdown

Do not create `.pptx`. Only create Markdown slide content if needed.

---

## 2. Critical Rules

### 2.1 Do not fake security results

Run security tools if available.

If Semgrep, Trivy, or OWASP ZAP cannot run in the current environment:
- state that clearly
- explain why
- provide exact commands to run locally or in CI
- analyze existing workflow configuration
- do not invent exact finding counts, CVEs, or alerts

### 2.2 Keep vulnerable demo educational

Inspect:

- `backend/src/routes/vulnerable-demo.js`

Use approach A:

- Keep the vulnerable version for educational before/after analysis.
- Create a safe fixed version if useful.
- Do not silently delete the vulnerable demo without documentation.
- Ensure dangerous demo routes are clearly separated from production behavior or documented as demo-only.

Preferred output:

- `backend/src/routes/vulnerable-demo-fixed.js`
- `docs/reports/vulnerable-demo-analysis.md`

### 2.3 Do not break Goal 1 features

Security changes must not break:
- login/register
- RBAC
- member management
- trainer management
- subscriptions
- schedules
- training goals
- monthly evaluations
- events

---

## 3. Required Inspection

Inspect:

- `.github/workflows`
- `backend/package.json`
- `frontend/package.json`
- `Dockerfile`
- `docker-compose.yml`
- backend routes
- frontend build configuration
- existing docs/reports
- `backend/src/routes/vulnerable-demo.js`

Create/update:

- `docs/reports/project2-audit.md`

Include:
- current CI/CD workflow structure
- existing security tools
- existing test/build commands
- Docker status
- vulnerable-demo status
- gaps and recommended fixes

---

## 4. Required Project 2 Outputs

### 4.1 Test/build evidence

Create/update:

- `docs/reports/project2-test-build-evidence.md`

Include exact commands and results for:
- backend install/test/start if feasible
- frontend install/test/build if feasible
- Docker compose validation/build if feasible

### 4.2 CI/CD pipeline analysis

Create/update:

- `docs/reports/security-pipeline-analysis.md`

Document each workflow/job:
- job name
- trigger
- purpose
- main commands
- expected output
- security value
- current status if available
- limitations

Expected areas:
- build/test
- Semgrep SAST
- Trivy container scan
- OWASP ZAP DAST
- security summary

If workflow is incomplete, improve it carefully without making unrealistic always-failing checks.

### 4.3 Semgrep SAST

Run Semgrep if available.

Document:
- what Semgrep checks
- command used or command to run
- actual result if available
- limitation if unavailable
- how findings should be triaged

Do not fabricate exact findings.

### 4.4 Trivy container scan

Run Trivy if available.

Document:
- what Trivy scans
- command used or command to run
- actual result if available
- limitation if unavailable
- how common image vulnerabilities should be fixed

Do not fabricate CVE counts.

### 4.5 OWASP ZAP DAST

Run or validate ZAP if available.

Document:
- what ZAP scans
- target URL requirement
- command used or command to run
- actual result if available
- limitation if unavailable
- how alerts should be interpreted

Do not fabricate alert counts.

### 4.6 Vulnerable demo analysis

Create/update:

- `docs/reports/vulnerable-demo-analysis.md`

Include:
1. Purpose of the vulnerable demo.
2. Vulnerability list.
3. Affected route/code.
4. Vulnerability category.
5. Risk.
6. Safe exploitation example if appropriate.
7. Secure fix.
8. Before/after comparison.
9. Whether the vulnerable route should be disabled or isolated in production.
10. Relation to Semgrep/ZAP findings if applicable.

Create if useful:

- `backend/src/routes/vulnerable-demo-fixed.js`

### 4.7 STRIDE threat model

Create/update:

- `docs/reports/stride-threat-model.md`

Language: English.

Cover:
- Authentication and JWT
- RBAC
- Member personal data
- Trainer schedule management
- Training goals
- Subscription data
- Monthly evaluations
- Events
- Database
- Docker deployment
- CI/CD pipeline
- Secrets and environment variables

Use STRIDE:
- Spoofing
- Tampering
- Repudiation
- Information Disclosure
- Denial of Service
- Elevation of Privilege

For each item include:
- threat
- impact
- existing mitigation
- recommended improvement
- priority

### 4.8 English security write-up

Create/update:

- `docs/reports/security-writeup-en.md`

Write in English.

Include:
1. Project overview
2. Security objectives
3. Architecture summary
4. Authentication and authorization
5. Input validation and SQL safety
6. CI/CD security pipeline
7. Semgrep SAST
8. Trivy container scanning
9. OWASP ZAP DAST
10. Vulnerable demo before/after
11. STRIDE summary
12. Security hardening improvements
13. Limitations
14. Future improvements
15. Conclusion

Do not overclaim.

### 4.9 Project 2 presentation content

Create/update Markdown content only:

- `docs/slides/project2-security-presentation-content.md`
- `docs/slides/project2-security-qa.md`

Do not create `.pptx`.

Presentation content should include:
1. Project overview
2. Security goals
3. CI/CD pipeline overview
4. Build/test job
5. Semgrep SAST
6. Trivy scan
7. OWASP ZAP DAST
8. Vulnerable demo
9. Before/after remediation
10. STRIDE threat model summary
11. Security improvements
12. Limitations
13. Future work
14. Conclusion

Clearly separate:
- actual results
- commands to run
- limitations
- planned/future improvements

---

## 5. Security Hardening Checks

Inspect and fix low-risk obvious issues if found:

- hardcoded secrets
- missing JWT secret validation
- overly broad CORS
- missing role checks
- SQL injection risks
- unsafe raw error messages
- exposed vulnerable demo route
- missing input validation
- unsafe Docker defaults

If a fix is too large or risky, document it as future improvement.

---

## 6. Acceptance Criteria

Goal 2 is complete only when:

1. CI/CD pipeline is documented accurately.
2. Test/build evidence is documented.
3. Semgrep is run or limitation/commands are documented.
4. Trivy is run or limitation/commands are documented.
5. OWASP ZAP is run or limitation/commands are documented.
6. Vulnerable demo is analyzed.
7. A fixed version or fix plan exists.
8. STRIDE threat model is completed in English.
9. English security write-up is completed.
10. Project 2 presentation content exists in Markdown.
11. No fake scan results are written.
12. Goal 1 functionality is not broken.
13. Final summary is provided.

---

## 7. Final Response Required

When finished, provide:

1. Files created/updated.
2. Security reports created.
3. CI/CD jobs analyzed.
4. Commands run and results.
5. Vulnerabilities found or documented.
6. Fixes applied.
7. Known limitations.
8. Exact next commands to run.
9. What the student should study before Project 2 presentation.

Do not stop before producing this final summary.
