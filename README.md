# RubyGYM

RubyGYM is a web-based gym management system for a course final submission. It supports role-based gym operations for guests, members, trainers, and admins, plus Project 2 security evidence through GitHub Actions and generated scanner reports.

## Tech Stack

- Frontend: React, React Router, Axios, served by nginx in Docker.
- Backend: Node.js, Express, JWT authentication, MySQL access through `mysql2/promise`.
- Database: MySQL 8.0 with schema and seed scripts in `docker/`.
- Deployment/demo: Docker Compose.
- CI/CD and security: GitHub Actions, Semgrep SAST, Trivy image scanning, OWASP ZAP baseline DAST.

## Main Features

- Guest can view public events and trainer information.
- Member can register/login, choose a trainer during registration, view assigned schedule, manage training goals, view evaluations, manage subscriptions, and see referral information.
- Trainer can view assigned members, create compliant training sessions, and record monthly evaluations for assigned members.
- Admin can manage trainers, members, subscriptions, schedules, evaluations, and public events.
- Scheduling rules enforce operating hours, lunch break, max 2 hours per session, max 8 trainer hours/day, max 3 members/session, and member daily/session overlap limits.
- Subscription logic supports 3-month, 6-month, and 1-year plans with loyalty and referral extensions.

## Actors and Scope

Final use-case actors are `Guest`, `Member`, `Trainer`, and `Admin`. Frontend, backend, database, Docker, and CI/CD are internal technical components, not actors.

Current MVP limitations:

- Online payment is outside the MVP.
- Members do not self-register into training sessions; trainers or admins create sessions.
- The frontend still has dependency audit debt from Create React App / `react-scripts`.
- `backend/src/routes/vulnerable-demo.js` is intentionally vulnerable for Project 2 education and is not mounted as a production API route. Use `backend/src/routes/vulnerable-demo-fixed.js` as the secure comparison.

## Run With Docker Compose

```bash
docker compose up -d --build
```

Services:

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:3000/api`
- Health check: `http://localhost:3000/api/health`
- MySQL: `localhost:3306`

Docker Compose loads `docker/init.sql` and `docker/seed.sql` when the database volume is first created. To reset seeded data:

```bash
docker compose down -v
docker compose up -d --build
```

Demo accounts:

- Admin: `admin@rubygym.com` / `admin123`
- Trainer: `trainer.linh@rubygym.com` / `trainer123`
- Member: `member.an@rubygym.com` / `member123`

Stop the stack:

```bash
docker compose down
```

## Run Locally

Start MySQL first, then create a backend `.env` from `backend/.env.example` if needed.

Backend:

```bash
cd backend
npm ci
npm test
npm run dev
```

Frontend:

```bash
cd frontend
npm ci
CI=true npm test -- --watchAll=false
npm run build
npm start
```

## Final Documents

Final Software Engineering deliverables are in `docs/reports/`:

- `final-se-project-audit.md`
- `final-se-report.md`
- `use-case-specifications.md`
- `final-requirement-traceability.md`
- `final-test-build-evidence.md`
- `FINAL_SUBMISSION_NOTE.md`

Final SE presentation content is in `docs/slides/final-se-presentation-content.md` and `docs/slides/final-se-presentation-qa.md`.

Final diagrams are in `docs/diagrams/`, especially:

- `usecase-full-simplified.puml` / `.png`
- `usecase-selected.puml` / `.png`
- `relational-schema.puml` / `.png`
- `relational-schema-simplified.puml` / `.png`

## Project 2 Security Documents

Project 2 deliverables are in `docs/reports/` and `docs/slides/`:

- `project2-audit.md`
- `project2-test-build-evidence.md`
- `security-pipeline-analysis.md`
- `security-writeup-en.md`
- `stride-threat-model.md`
- `vulnerable-demo-analysis.md`
- `project2-security-presentation-content.md`
- `project2-security-qa.md`

Scanner artifacts are kept under `docs/reports/`: Semgrep JSON, Trivy JSON, and ZAP HTML/JSON/Markdown outputs.

## GitHub Actions

Workflows:

- **RubyGYM General CI** at `.github/workflows/ci.yml` for backend tests, frontend tests/build, and Docker Compose config validation.
- **Project 2 Security CI** at `.github/workflows/project2-security-ci.yml` for final Project 2 test/build/security evidence.

The Project 2 workflow runs backend tests, frontend tests/build, Docker Compose validation/build, Semgrep, Trivy, and OWASP ZAP baseline scanning on pushes to `main`/`master`, pull requests, and manual dispatch.
