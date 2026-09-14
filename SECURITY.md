# Security Policy

RubyGYM is a public university project and a classroom demonstration, not a production service. Security controls in this repository are implemented to demonstrate secure-development practices and CI/CD security testing.

## Supported scope

The `main` branch is the only supported code line. Historical commits and old workflow artifacts may contain behavior that has since changed.

## Reporting a security issue

If you find a security problem in the real application code, avoid publishing exploit details in a public issue before the problem is reviewed. A minimal report should include:

- affected file/route;
- preconditions and affected role;
- expected vs. observed behavior;
- impact;
- a minimal reproduction description that does not expose unrelated user data.

For ordinary bugs, documentation problems or non-sensitive defects, a normal GitHub issue is appropriate.

## Intentional vulnerable code

`backend/src/routes/vulnerable-demo.js` intentionally contains insecure patterns for the Project 2 SAST demonstration. It is **not** mounted by the runtime Express application and must remain isolated from production routes.

The file includes examples such as:

- SQL query string concatenation;
- reflected XSS pattern;
- hardcoded credential-like strings;
- path traversal;
- insecure randomness;
- `eval` usage.

These findings are expected in the dedicated non-blocking SAST demonstration job. They should not be reported as newly discovered vulnerabilities unless the fixture becomes reachable from the running application or the same pattern appears in real application code.

## Local secrets

- `.env` and key files are ignored by Git.
- `.env.example` contains development placeholders only.
- Docker Compose defaults are intended only for local classroom use.
- Real deployments must use unique secrets and an appropriate secret-management mechanism.

## Security controls in CI

The Project 2 workflow currently provides:

- backend/frontend tests;
- Semgrep SAST gate for real application code;
- a separate Semgrep detection demo for the intentional fixture;
- Trivy image scanning with a gate for fixable `HIGH`/`CRITICAL` findings;
- OWASP ZAP baseline DAST against the running stack.

See `docs/stride-threat-model.md` and `docs/architecture-decisions.md` for design context and accepted classroom limitations.
