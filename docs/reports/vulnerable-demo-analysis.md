# Vulnerable Demo Analysis

Date: 2026-05-27

## Purpose

`backend/src/routes/vulnerable-demo.js` is an intentionally vulnerable Express router for Project 2 security education. It demonstrates common web application weaknesses and gives Semgrep/ZAP/manual review something concrete to discuss.

The vulnerable router is not mounted in `backend/src/index.js`. That means the demo is present in the repository for analysis, but it is not part of the active RubyGYM API unless a developer explicitly registers it.

## Files

| File | Purpose | Status |
|---|---|---|
| `backend/src/routes/vulnerable-demo.js` | Vulnerable before version | Kept for educational analysis, not mounted |
| `backend/src/routes/vulnerable-demo-fixed.js` | Secure comparison version | Added during Goal 2 |

## Vulnerability List

| Route or code | Vulnerability | Category | Risk | Safe exploitation example | Secure fix |
|---|---|---|---|---|---|
| `GET /search` | SQL query built with string concatenation | SQL Injection, OWASP A03 Injection | Attacker can alter query logic if the query is executed | `?name=' OR '1'='1` would change the intended WHERE clause | Use `pool.execute('... WHERE full_name = ?', [name])` |
| `DB_PASSWORD` and `API_KEY` constants | Hardcoded secrets | Secrets management failure | Secrets can leak through source control or scanner output | Reading repository source reveals fake secret values | Use environment variables or secret manager; do not commit secrets |
| `GET /greet` | Reflects user input into HTML | Reflected XSS | Browser may execute attacker-controlled script if mounted | `?name=<script>alert(1)</script>` | Return JSON or HTML-escape output before rendering |
| `GET /file` | Concatenates user input into filesystem path | Path Traversal | Attacker may read unintended files if path exists | `?name=../../etc/passwd` | Normalize path, restrict to upload root, reject traversal |
| `GET /token` | Uses `Math.random()` for token | Insecure randomness | Generated token may be predictable | Repeated weak random tokens can be guessed statistically | Use `crypto.randomBytes()` |
| `POST /calculate` | Runs request body through `eval()` | Remote Code Execution / Code Injection | Attacker can execute arbitrary JavaScript in the Node process | `{"expression":"process.env"}` could expose environment if mounted | Parse allowed arithmetic grammar; never evaluate raw input |

## Semgrep Relation

Final Semgrep scan found one real finding:

| Field | Value |
|---|---|
| Check ID | `javascript.lang.security.audit.code-string-concat.code-string-concat` |
| File | `backend/src/routes/vulnerable-demo.js` |
| Line | 41 |
| Severity | `ERROR` |
| Message summary | Request-controlled data reaches `eval` |

This finding is expected for the educational vulnerable file. It should remain visible in reports, but the route must stay unmounted outside demo contexts.

## ZAP Relation

OWASP ZAP scans the running frontend at `http://127.0.0.1:8080`. Because the vulnerable demo router is not mounted in the active backend app and ZAP baseline is unauthenticated/passive, ZAP does not directly exercise these demo endpoints.

ZAP did find missing header issues before remediation. After nginx hardening, final ZAP status was:
- `FAIL-NEW: 0`
- `WARN-NEW: 2`
- `PASS: 65`

## Before and After Comparison

| Concern | Vulnerable version | Fixed version |
|---|---|---|
| SQL search | Builds SQL with string concatenation | Uses parameterized query with `pool.execute` |
| Greeting | Sends raw HTML with user-controlled input | Returns JSON response |
| File read | Reads `/uploads/` plus raw user input | Uses `path.basename`, `path.resolve`, upload-root boundary check, and 404 handling |
| Token | Uses `Math.random()` | Uses `crypto.randomBytes(32)` |
| Calculator | Uses `eval(expression)` | Accepts only simple binary arithmetic with regex parsing |
| Secrets | Contains fake hardcoded secret constants | Contains no hardcoded secrets |
| Production exposure | Not mounted, but dangerous if mounted | Also not mounted by default; safe pattern if used as a teaching reference |

## Secure Fix Details

Implemented secure comparison file: `backend/src/routes/vulnerable-demo-fixed.js`.

Important implementation choices:
- The fixed route still follows Express router style so students can compare it line by line with the vulnerable route.
- The fixed route does not silently delete or hide the vulnerable file.
- The fixed route does not claim to be complete production functionality; it is a safe teaching implementation.

## Production Isolation Recommendation

The vulnerable route should remain unmounted in production. Recommended policy:

1. Do not add `app.use('/api/vulnerable-demo', vulnerableDemoRoutes)` to `backend/src/index.js` for any production or public demo deployment.
2. Keep the file only for classroom source review and SAST demonstration.
3. If a live demo is needed, mount it only behind a local-only flag such as `ENABLE_VULNERABLE_DEMO=true`, bind the server to localhost, and never deploy that flag to CI/CD or production.
4. Keep Semgrep scanning the file so the finding is visible and explainable.
5. Use `vulnerable-demo-fixed.js` as the before/after remediation evidence.

## Risk Rating

| Vulnerability | Risk if mounted publicly | Risk in current app state |
|---|---|---|
| `eval()` code execution | Critical | Low, because route is not mounted |
| SQL injection | High | Low, because route is not mounted and query is not executed in vulnerable file |
| Path traversal | High | Low, because route is not mounted |
| Reflected XSS | Medium/High | Low, because route is not mounted |
| Hardcoded demo secrets | Medium | Low/Medium, because values are fake but still train bad habits |
| Insecure random token | Medium | Low, because route is not mounted |

## Conclusion

The vulnerable demo is useful for Project 2, but it is dangerous by design. The correct handling is to keep it isolated, document it clearly, and compare it to `vulnerable-demo-fixed.js`. The current app satisfies that approach: the vulnerable route remains available for education, the active API does not mount it, and the secure fixed version exists for remediation discussion.
