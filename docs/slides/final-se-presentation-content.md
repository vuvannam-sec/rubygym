# RubyGYM Final SE Presentation Content

## Slide 1 - Title and team

- RubyGYM - Gym Management Web Application
- Final Software Engineering Submission
- Team Project 12
- Stack: React, Express, MySQL, Docker

## Slide 2 - Problem and motivation

- Gym centers need one system to manage members, trainers, schedules, subscriptions, evaluations, and events.
- Manual scheduling can violate operating-hour, trainer-hour, and member-capacity constraints.
- Members need visibility into personal schedules, goals, subscriptions, referrals, and monthly progress.

## Slide 3 - Original requirements summary

- Manage Trainers and assigned Members.
- Trainer or Admin can create sessions independently.
- Member sees assigned schedule and monthly evaluation comments.
- Member sets training goals.
- Subscription plans are 3 months, 6 months, or 1 year.
- Loyal and referral free-month rules extend subscription duration.
- Admin publishes training events to the website.

## Slide 4 - Scope and MVP boundary

- Included: web app, role-based auth, database schema, backend business rules, frontend demo workflows, Docker Compose.
- Excluded: online payment, mobile app, nutrition planning, wearables, equipment management, AI evaluation.
- Important boundary: Member does not self-register into training sessions.

## Slide 5 - Actors and system boundary

- Actors: Guest, Member, Trainer, Admin.
- RubyGYM System is the use-case boundary.
- Frontend, Backend, Database, MySQL, Docker and CI/CD are technical components, not actors.

## Slide 6 - Full use-case diagram

- Diagram source: `docs/diagrams/usecase-full-simplified.puml`.
- Guest views public gym information/events and can register.
- Member manages own goals, schedule, subscription, evaluations, referrals.
- Trainer manages assigned clients, schedules, monthly evaluations.
- Admin manages members, trainers, subscriptions, events, reports, and permitted API workflows.

## Slide 7 - Five selected use cases

- UC01 Manage Members - Admin.
- UC02 Register/Renew Subscription Plan - Member or Admin.
- UC03 Create Training Session - Trainer or Admin.
- UC04 View Personal Schedule - Member.
- UC05 Perform Monthly Evaluation - Trainer or Admin; Member only views results.

## Slide 8 - Relational schema

- Diagram source: `docs/diagrams/relational-schema.puml`.
- Main tables: `users`, `trainers`, `members`, `training_goals`, `subscriptions`, `training_sessions`, `session_members`, `monthly_evaluations`, `events`.
- `session_members` supports many Members in one session and many sessions per Member.
- `monthly_evaluations` has unique Member/month rule.

## Slide 9 - Architecture overview

- React frontend with role-based routes and reusable layout components.
- Express REST API grouped by resource.
- MySQL stores persistent business data.
- Docker Compose runs database, backend, and static frontend.

## Slide 10 - Main implemented features

- Login/register with JWT.
- Member and Trainer management.
- Member training goals.
- Trainer schedule creation and assigned-client management.
- Member personal schedule and evaluation results.
- Subscription, loyal bonus, referral bonus.
- Event publishing and Admin event routes.

## Slide 11 - Schedule business rules

- Center hours: 05:00-20:00.
- Lunch break: 11:30-13:30; no sessions during lunch.
- Session length: max 2 hours.
- Trainer workload: max 8 hours/day.
- Session capacity: max 3 Members.
- Member attendance: max 3 sessions/day, one per morning/afternoon/evening period.
- No overlapping Trainer or Member sessions.

## Slide 12 - Subscription, loyalty, referral rules

- Plans: `QUARTERLY`, `SEMI_ANNUAL`, `ANNUAL`.
- Loyal Member: trained more than 1 year.
- Loyal annual renewal: +3 free months.
- Referral: +1 free month when referred customer joins.
- Referral month is applied to active subscription or stored in `pending_bonus_months` for the next subscription.
- Online payment is out of scope.

## Slide 13 - Training goals and monthly evaluation

- Member saves own goal through `/api/goals/me`.
- Goal data includes type, target weight, target BMI, target date, notes.
- Trainer sees goals in assigned-client/evaluation flow.
- Evaluation stores target/actual weight and BMI plus notes.
- Member views only own evaluation results.

## Slide 14 - Demo flow

- Start backend/frontend or Docker Compose.
- Login as Admin: `admin@rubygym.com` / `admin123`; inspect members, trainers, events.
- Login as Trainer: `trainer.linh@rubygym.com` / `trainer123`; view assigned clients, create valid/invalid sessions, create monthly evaluation.
- Login as Member: `member.an@rubygym.com` / `member123`; update goal, view schedule, renew subscription, view evaluation comments.
- Visit public site: view events.

## Slide 15 - Testing/build summary

- Backend tests: `npm test -- --runInBand`, 6 suites / 25 tests passed.
- Frontend tests: `CI=true npm test -- --watchAll=false`, 1 suite / 1 test passed.
- Frontend build: `npm run build`, compiled successfully.
- Docker verification is documented in `docs/reports/final-test-build-evidence.md`.

## Slide 16 - Requirement traceability summary

- 22 original requirements reviewed.
- 21 Implemented, 1 Partial.
- Partial item: Trainer management frontend remains local-first for some admin table actions; backend CRUD exists.
- No unsupported features are claimed.

## Slide 17 - Limitations and future work

- Complete backend integration for all Admin table actions.
- Add integration tests with real MySQL.
- Add revenue/retention reports.
- Add audit logs and stronger security hardening.
- Add CI/CD security pipeline as a future/Goal 2 item.

## Slide 18 - Conclusion

- RubyGYM is demo-ready for final SE submission.
- The implementation preserves correct actor responsibility.
- Core business rules are enforced in backend routes.
- Documentation, diagrams, traceability, test/build evidence, and presentation content are prepared in Markdown.
