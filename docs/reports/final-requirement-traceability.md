# Final Requirement Traceability Matrix - RubyGYM

Status values: Implemented, Partial, Missing, Future.

| No | Original requirement | Status | Use case | Tables | Backend route(s) | Frontend component(s) | Notes |
|---:|---|---|---|---|---|---|---|
| 1 | The system manages trainers in the center. | Partial | UC01 support | `users`, `trainers` | `GET/POST /api/trainers`, `GET/PUT/DELETE /api/trainers/:id` | `TrainerList.js` | Backend CRUD is implemented. Frontend trainer table is demo-ready but some create/update/delete behavior remains local-first. |
| 2 | Each trainer manages a list of customers assigned to them. | Implemented | UC03, UC05 | `trainers`, `members`, `users`, `training_goals` | `GET /api/trainers/:id/clients` | `MyMembersPage.js`, `CreateSession.js`, `EvaluationForm.js` | Trainer access is restricted to own `trainer_id`. |
| 3 | A customer can choose a trainer, or Admin assigns one if the customer does not choose. | Implemented | UC01 | `members`, `trainers` | `POST /api/auth/register`, `PUT /api/members/:id` | `RegisterForm.js`, `MemberList.js` | Registration accepts optional `trainer_id`; Admin can later assign or change `trainer_id`. No automatic assignment is claimed. |
| 4 | Trainers set up training schedules for their customers. | Implemented | UC03 | `training_sessions`, `session_members`, `members`, `trainers` | `POST /api/schedule`, `PUT /api/schedule/:id` | `CreateSession.js`, `ScheduleView.js` | Trainer can create sessions only for assigned members. Admin API support also exists. |
| 5 | A training session lasts at most 2 hours. | Implemented | UC03 | `training_sessions` | `POST /api/schedule`, `PUT /api/schedule/:id` | `CreateSession.js` | Backend rejects duration over 120 minutes. |
| 6 | The center operates from 05:00 to 20:00. | Implemented | UC03 | `training_sessions` | `POST /api/schedule`, `PUT /api/schedule/:id` | `CreateSession.js` | Backend allows 05:00-11:30 and 13:30-20:00 only. |
| 7 | Lunch break is 11:30 to 13:30; no training session is allowed. | Implemented | UC03 | `training_sessions` | `POST /api/schedule`, `PUT /api/schedule/:id` | `CreateSession.js` | Sessions must fit fully before lunch or after lunch. |
| 8 | A trainer works at most 8 hours per day. | Implemented | UC03 | `training_sessions`, `trainers` | `POST /api/schedule`, `PUT /api/schedule/:id` | `CreateSession.js` | Backend sums trainer minutes and rejects more than 480 minutes/day. |
| 9 | In one session, a trainer can guide at most 3 customers. | Implemented | UC03 | `session_members` | `POST /api/schedule`, `PUT /api/schedule/:id` | `CreateSession.js` | Backend rejects more than 3 `member_ids`. |
| 10 | A customer can attend at most 3 sessions per day: morning, afternoon, or evening. | Implemented | UC03 | `training_sessions`, `session_members` | `POST /api/schedule`, `PUT /api/schedule/:id` | `CreateSession.js`, `ScheduleView.js` | Backend enforces max 3/day and one session per period. |
| 11 | Each customer can set their own training goals. | Implemented | UC05 support | `training_goals`, `members` | `GET/PUT /api/goals/me`, `GET /api/goals/member/:memberId` | `TrainingGoals.js`, `MyMembersPage.js`, `EvaluationForm.js` | Member can set/update own goal. Trainer or Admin can view allowed goal data. |
| 12 | At the end of each month, trainer evaluates assigned customer based on weight, BMI, and comparison with goals. | Implemented | UC05 | `monthly_evaluations`, `training_goals`, `members`, `trainers` | `GET/POST /api/evaluations`, `GET/PUT/DELETE /api/evaluations/:id` | `EvaluationForm.js`, `EvaluationList.js` | One evaluation per Member/month. Responses include weight/BMI progress against saved or entered targets. |
| 13 | A customer's schedule appears in the customer account after trainer setup. | Implemented | UC04 | `training_sessions`, `session_members`, `members`, `trainers` | `GET /api/schedule/member/:memberId` | `ScheduleView.js` | Member sees only assigned personal schedule. |
| 14 | Customers can see weekly activities and receive comments after each monthly cycle. | Implemented | UC04, UC05 | `training_sessions`, `monthly_evaluations` | `GET /api/schedule/member/:memberId`, `GET /api/evaluations` | `ScheduleView.js`, `EvaluationList.js` | Weekly schedule and evaluation notes are visible to Member. |
| 15 | Customers joining the center become members. | Implemented | UC01 context | `users`, `members` | `POST /api/auth/register`, `POST /api/members` | `RegisterForm.js`, `MemberList.js` | Registration creates role `MEMBER` and a member profile. |
| 16 | Customers who trained for more than 1 year become loyal members. | Implemented | UC02 | `members` | `GET /api/members/:id`, `POST/PUT /api/subscriptions` | `PlanSelector.js`, `MemberList.js` | Backend syncs `is_loyal` from `join_date` when member/subscription data is accessed. |
| 17 | Loyal members receive 3 free training months when registering for one more year. | Implemented | UC02 | `members`, `subscriptions` | `POST/PUT /api/subscriptions` | `PlanSelector.js` | Applies only for loyal renewal with annual plan. |
| 18 | A customer who refers a new customer receives 1 free month when the referred customer joins. | Implemented | UC01, UC02 | `members`, `subscriptions` | `POST /api/auth/register`, `POST /api/members`, `POST /api/subscriptions` | `RegisterForm.js`, `ReferralPage.js`, `PlanSelector.js` | Active subscription is extended immediately; otherwise `pending_bonus_months` is applied to next subscription. |
| 19 | Customers can register membership plans for 3 months, 6 months, or 1 year. | Implemented | UC02 | `subscriptions`, `members` | `POST /api/subscriptions` | `PlanSelector.js`, `SubscriptionStatus.js` | `QUARTERLY`, `SEMI_ANNUAL`, `ANNUAL` are supported. No online payment is claimed. |
| 20 | Extra free months are added to valid membership/subscription duration. | Implemented | UC02 | `members`, `subscriptions` | `POST /api/subscriptions`, `POST /api/auth/register` | `PlanSelector.js`, `ReferralPage.js` | Loyalty and referral months extend `end_date` when conditions are met. |
| 21 | The center can create events to encourage training activities. | Implemented | Full use-case diagram | `events`, `users` | `POST/PUT/DELETE /api/events/:id` | `EventList.js` | Admin event management route exists. |
| 22 | Event information is published on the gym website. | Implemented | Full use-case diagram | `events`, `users` | `GET /api/events`, `GET /api/events/:id` | `LandingPage.js`, `EventList.js`, `EventDetail.js` | Guest/public event viewing exists. |

## Summary

| Status | Count | Requirement numbers |
|---|---:|---|
| Implemented | 21 | 2-22 |
| Partial | 1 | 1 |
| Missing | 0 | None |
| Future | 0 | Future items are outside original requirements. |

## Test Coverage (SRS FR/NFR → automated tests)

Backend: Jest + Supertest (DB mocked) — 8 suites / 32 tests. Frontend: React Testing Library — 2 suites.

| Requirement (SRS) | Automated test | Type |
|---|---|---|
| FR-AUTH-01..05 (register, login, JWT, RBAC, bcrypt) | `backend/tests/auth.test.js` | Backend |
| FR-TRN-01..04 (trainer CRUD, assigned clients) | `backend/tests/trainers.test.js` | Backend |
| FR-SCH-01..07 (session rules: ≤2h, hours, lunch, ≤8h/day, ≤3 members, empty list) | `backend/tests/schedule.test.js` | Backend |
| FR-GOAL-01/02 (member sets own goal; non-owner rejected; trainer read) | `backend/tests/goals.test.js` | Backend |
| FR-EVL-01..06 (trainer-only create, ownership, duplicate-month, goal target) | `backend/tests/evaluations.test.js` | Backend |
| FR-MEM-01..05, FR-SUB (plan, loyalty, referral bonus) | `backend/tests/subscription.test.js` | Backend |
| FR-MEM-06 (onboarding = metrics+plan+trainer, NO goal — ADR-002) | `backend/tests/onboarding.test.js` | Backend |
| NFR-OPS (health endpoint) | `backend/tests/health.test.js` | Backend |
| FR-EVT-02 + landing (public page, pricing, classes) | `frontend/src/App.test.js` | Frontend |
| ADR-002 (onboarding has no goal input) | `frontend/src/components/Members/MemberOnboarding.test.js` | Frontend |

Notes:
- `schedule.test.js` `today()` uses local date parts to avoid a UTC/+07:00 timezone-boundary flake.
- `onboarding.test.js` asserts onboarding does **not** write `training_goals` (ADR-002).
- `evaluations.test.js` asserts a member cannot create evaluations and a trainer cannot evaluate non-assigned members.

## Wording rules for presentation

- Say: Trainer creates sessions for assigned Members.
- Say: Member views assigned schedule and sets personal training goals.
- Say: Member registers or renews a subscription plan; online payment is out of scope.
- Say: Admin can assign Trainer to Member.
- Do not say: Member self-registers into training sessions.
- Do not say: Database, Backend, Frontend, MySQL, Docker, or CI/CD are actors.
