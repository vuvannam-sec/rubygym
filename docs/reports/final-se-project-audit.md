# RubyGYM Final SE Project Audit

Audit date: 2026-05-27.

## Implemented features

- Authentication with JWT login, `/api/auth/me`, and role checks for Admin, Trainer, and Member.
- Public Member registration with optional trainer selection and referral code.
- Admin member management through backend routes; frontend supports listing and trainer assignment flow.
- Admin trainer management through backend routes; frontend supports a demo management table.
- Trainer assigned-client list restricted to the trainer's own clients.
- Member training goals implemented with `training_goals`, `/api/goals/me`, and `/api/goals/member/:memberId` view rules.
- Trainer evaluation flow can see current Member goals and uses target weight/BMI when saving monthly evaluations.
- Schedule creation by Trainer or Admin with backend enforcement for operating hours, lunch break, max 2 hours, max 8 trainer hours/day, max 3 members/session, max 3 sessions/member/day, one session per day period, and overlap checks.
- Member personal schedule restricted to the logged-in Member's own `member_id`.
- Subscription plans for 3 months, 6 months, and 1 year.
- Loyal-member bonus: loyal renewal for annual plan adds 3 months.
- Referral bonus: referred join grants 1 free month to active subscription or stores pending free months for the next subscription.
- Public event list/detail routes and Admin event management routes.
- Docker Compose file for MySQL, backend, and frontend demo environment.

## Partially implemented features

- Frontend Admin trainer/subscription tables still use local state for some create/update/delete interactions. Backend APIs are implemented.
- Automatic center assignment when a Member does not choose a trainer is not implemented; Admin assignment is implemented.
- Admin can create sessions through API. The main schedule creation UI is Trainer-focused.
- Event publishing exists as public event viewing. Event registration/attendance is not implemented and is not claimed.

## Missing or future features

- Online payment is not implemented.
- Member self-registration into training sessions is not implemented.
- Mobile app, nutrition planning, wearables, equipment management, and AI evaluation are outside scope.
- Full revenue/accounting reports are future work.

## Database status

- Current schema source: `docker/init.sql`.
- Seed data source: `docker/seed.sql`.
- Demo accounts: `admin@rubygym.com/admin123`, `trainer.linh@rubygym.com/trainer123`, `member.an@rubygym.com/member123`.
- Core tables: `users`, `trainers`, `members`, `training_goals`, `subscriptions`, `training_sessions`, `session_members`, `monthly_evaluations`, `events`.
- `members.pending_bonus_months` stores referral months that cannot be applied immediately.
- Schema matches backend route queries after Goal 1 updates.

## Backend status

- Backend package metadata added in `backend/package.json`.
- New route mounted: `/api/goals`.
- Tests cover auth, trainer routes, subscriptions, goals, schedule rules, and health.
- Known warning: Node/npm print `url.parse()` deprecation from tooling; it does not fail tests/build.

## Frontend status

- Production build succeeds.
- Member workspace includes a training-goal page.
- Trainer evaluation page shows selected Member goal targets.
- Role navigation is explicit for Admin, Trainer, and Member.
- Fallback demo data remains in several screens to keep the UI demoable when backend is offline.

## Test/build status

- Backend: `npm test -- --runInBand` passed, 6 suites / 25 tests.
- Frontend: `CI=true npm test -- --watchAll=false` passed, 1 suite / 1 test.
- Frontend build: `npm run build` passed.

## Docker status

- `docker-compose.yml` exists for `db`, `backend`, and `frontend`.
- `docker compose config` should validate the final file.
- `docker compose build` should build backend and frontend images from package manifests.
- Runtime depends on ports 3306, 3000, and 8080 being available locally.

## Known limitations

- The UI is demo-ready but not a complete commercial product.
- Some Admin UI create/update/delete operations are local-first and should be integrated fully with backend APIs in a later iteration.
- No payment gateway, invoice, or transaction table exists.
- No Member action creates or joins training sessions directly.
- Local PlantUML CLI is not installed, but PNG diagrams were regenerated through the Dockerized `plantuml/plantuml` image.
