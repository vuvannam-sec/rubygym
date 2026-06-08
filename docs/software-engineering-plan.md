# RubyGYM Software Engineering Plan

Version: 2026-06-08

This document is the engineering backbone for Project 12 - RubyGYM. It connects the project topic, requirement specification, analysis and design decisions, delivery plan, and implementation quality rules.

## 1. Product Goal

RubyGYM is a gym customer management and promotion system. The system must support public marketing, member onboarding, trainer assignment, training schedules, monthly evaluations, subscription renewal, loyalty rewards, referral rewards, and events.

The project is scoped as a university software engineering project, so the deliverable must show both working software and traceable engineering artifacts.

## 2. Stakeholders and Actors

| Actor | Main goal | System responsibilities |
| --- | --- | --- |
| Public visitor | Learn about RubyGYM and register as a member | See events, trainers, facilities, registration form |
| Member | Manage training journey | Login, view profile, trainer, current weight, schedule, goals, evaluations, subscriptions, referrals |
| Trainer | Manage assigned members | View clients, create schedule, create monthly evaluation |
| Admin | Operate the center | Manage trainers, members, subscriptions, events, reports |

## 3. MVP Scope

In scope:

- Public landing page and monthly event promotion.
- Member registration with email, password, phone, current weight, height, optional trainer choice, optional referral code.
- Member onboarding after first login for package selection, trainer preference, and body baseline. The training goal is set separately by the member on the Goals page (ADR-002).
- JWT login and role-based access control.
- Admin management for trainers, members, subscriptions, and events.
- Trainer schedule creation with RubyGYM scheduling rules.
- Member schedule view and goal tracking.
- Monthly evaluation with target and actual weight/BMI.
- Loyalty bonus and referral bonus handling.

Out of scope for the current classroom MVP:

- Real payment gateway.
- Real notification delivery via email/SMS.
- Biometric or device integration.
- Attendance check-in hardware.

## 4. Functional Requirements

| ID | Requirement | Priority | Main modules |
| --- | --- | --- | --- |
| FR-AUTH-01 | Public users can register a member account with identity, contact, current weight, and height. | High | Auth, Members |
| FR-AUTH-02 | Users can login by email/password and receive a JWT. | High | Auth |
| FR-AUTH-03 | System enforces ADMIN, TRAINER, MEMBER permissions. | High | Middleware |
| FR-MEM-01 | Members can choose a trainer or leave trainer assignment to admin. | High | Auth, Members |
| FR-MEM-02 | Members complete onboarding by saving body metrics, package, and trainer preference. | High | Members, Subscriptions |
| FR-MEM-03 | Members can view profile, trainer, current weight/BMI, subscription, schedule, goals, and evaluations. | High | Member dashboard |
| FR-TRN-01 | Admin can manage trainer profiles and specializations. | High | Trainers |
| FR-TRN-02 | Trainers can view only their assigned members. | High | Trainers, Members |
| FR-SCH-01 | Trainers/admin can create sessions for members assigned to the trainer. | High | Schedule |
| FR-SCH-02 | Session length must be at most 2 hours. | High | Schedule validation |
| FR-SCH-03 | Gym hours are 05:00-11:30 and 13:30-20:00. | High | Schedule validation |
| FR-SCH-04 | A trainer can work at most 8 training hours per day. | High | Schedule validation |
| FR-SCH-05 | A trainer can train at most 3 members in one session. | High | Schedule validation |
| FR-SCH-06 | A member can train at most 3 sessions per day, one per morning/afternoon/evening period. | Medium | Schedule validation |
| FR-EVL-01 | Trainers can record monthly weight/BMI evaluation for assigned members. | High | Evaluations |
| FR-EVL-02 | Members can read their evaluation history. | High | Evaluations |
| FR-SUB-01 | Members can buy or renew 3-month, 6-month, or 12-month plans. | High | Subscriptions |
| FR-SUB-02 | Loyal members get 3 extra months when renewing an annual plan. | Medium | Subscriptions |
| FR-SUB-03 | Referrers get 1 extra month per successful referred member. | Medium | Auth, Members, Subscriptions |
| FR-EVT-01 | Admin can manage events; public visitors can view events. | Medium | Events |

## 5. Non-Functional Requirements

| ID | Requirement | Current implementation |
| --- | --- | --- |
| NFR-SEC-01 | Passwords must be hashed before storage. | `bcryptjs` in auth/trainer/member creation routes |
| NFR-SEC-02 | Protected API routes must require JWT. | `authenticate` middleware |
| NFR-SEC-03 | Role permissions must be enforced server-side. | `authorize` and route-specific ownership checks |
| NFR-USE-01 | Users must receive clear success/error feedback. | Login/register toast, form errors, empty states |
| NFR-USE-02 | New member accounts must not show fake schedule/package data. | Member screens now default to empty state unless backend data exists |
| NFR-MNT-01 | Requirements must be traceable to modules and routes. | This document plus API docs |
| NFR-OPS-01 | Project must run locally through Docker Compose. | MySQL, backend, frontend services |

## 6. Core Use Cases

### UC-01 Register as Member

Primary actor: Public visitor

Main flow:

1. Visitor opens registration page.
2. Visitor enters name, phone, current weight, height, email, password.
3. Visitor optionally selects trainer and enters referral code.
4. System validates required fields and referral/trainer references.
5. System creates user and member profile.
6. System shows success feedback and redirects to login.

Post-condition:

- A `users` row exists with role `MEMBER`.
- A `members` row exists with `current_weight`, `height_cm`, optional `trainer_id`, `join_date`, and referral relationship.
- The account is not considered fully onboarded until package and training goal are saved.

### UC-01B Complete Member Onboarding

Primary actor: Member

Main flow:

1. Member logs in after registration.
2. If onboarding is incomplete, system routes the member to `/member/onboarding`.
3. Member confirms current weight and height; system calculates BMI.
4. Member selects a 3-month, 6-month, or annual package.
5. Member chooses a trainer preference or leaves assignment to the center.
6. After onboarding, the member sets a training goal on the Goals page (target weight/BMI, target date) — owned by the member (ADR-001/ADR-002).
7. System creates/updates subscription and upserts training goal.

Post-condition:

- Member profile has body baseline for BMI evaluation.
- A subscription row exists.
- A training goal row exists.
- Member dashboard can show real data instead of demo data.

### UC-02 Trainer Creates Training Session

Primary actor: Trainer

Rules:

- Trainer can only schedule their own members.
- Session must fit operating hours.
- Session duration is at most 2 hours.
- Session can contain at most 3 members.
- Trainer cannot exceed 8 hours per day.
- Member cannot overlap sessions or exceed daily/period limits.

### UC-03 Monthly Evaluation

Primary actor: Trainer

Main flow:

1. Trainer selects an assigned member.
2. Trainer enters target/actual weight and BMI for the month.
3. System compares actual metrics with target metrics.
4. Member can view the evaluation in their account.

## 7. Domain Model

| Entity | Key fields | Notes |
| --- | --- | --- |
| User | email, password_hash, role, full_name, phone | Authentication identity |
| Trainer | user_id, specialization, max_daily_hours | Staff profile |
| Member | user_id, trainer_id, join_date, current_weight, height_cm, is_loyal, referred_by | Member profile and onboarding body metrics |
| TrainingGoal | member_id, goal_type, target_weight, target_bmi, target_date | Member goal set by member and used by trainer |
| TrainingSession | trainer_id, session_date, start_time, end_time, session_type | Session header |
| SessionMember | session_id, member_id | Many-to-many session attendance |
| MonthlyEvaluation | member_id, trainer_id, month_year, target/actual weight/BMI | Monthly progress record |
| Subscription | member_id, plan_type, start_date, end_date, status | Membership plan |
| Event | title, description, event_date, image_url | Public marketing event |

## 8. Architecture

Runtime:

```text
Browser
  -> React SPA served by Nginx on :8080
  -> Express API on :3000
  -> MySQL 8 database on :3306
```

Backend modules:

- `auth`: register, login, profile context.
- `members`: member CRUD, profile, onboarding, referrals.
- `trainers`: trainer CRUD and assigned clients.
- `schedule`: trainer/member schedules and schedule validation.
- `goals`: member training goals.
- `evaluations`: monthly progress reviews.
- `subscriptions`: plan renewal, loyalty, referral bonus.
- `events`: public/admin event management.

Frontend layout:

- Public pages: landing, login, register.
- Admin workspace: dashboards, trainers, members, subscriptions, events.
- Trainer workspace: clients, schedule, monthly evaluations.
- Member workspace: dashboard, schedule, goals, results, subscriptions, referrals.

## 9. UX Redesign Decisions Applied

The registration/member flow was tightened because fake demo data made new accounts look complete even when no schedule or subscription existed.

Applied decisions:

- Login form is empty by default. No prefilled admin credentials.
- Register form now asks for current weight and height.
- New member login now routes incomplete profiles to a dedicated onboarding screen.
- Onboarding saves package, trainer preference, and body metrics. The training goal is a separate member-owned step on the Goals page (ADR-002, removes the previous duplicate goal entry).
- Registration success now produces visible feedback before redirecting to login, then shows a login-page success flash.
- Member dashboard displays actual current weight, height, and BMI from member profile.
- Member/trainer/subscription dashboards now show empty states unless backend data exists.

## 10. Delivery Plan

| Sprint | Goal | Deliverables |
| --- | --- | --- |
| Sprint 1 | Foundations | Docker Compose, schema, seed data, auth, RBAC, landing page |
| Sprint 2 | Core operations | Trainer/member management, schedule rules, member dashboard |
| Sprint 3 | Member lifecycle | Subscription plans, loyalty bonus, referral bonus |
| Sprint 4 | Progress tracking | Training goals, monthly evaluations, member result history |
| Sprint 5 | Polish and evidence | UX cleanup, empty states, tests, API docs, final SE report |

## 11. Definition of Done

A feature is done when:

- Requirement is mapped to a route/component.
- Server-side validation exists for business rules.
- UI shows success, loading, error, and empty states.
- Protected operations enforce role and ownership checks.
- Docker build succeeds.
- Relevant backend tests or manual verification evidence exists.
- API docs and SE docs are updated when request/response contracts change.

## 12. Current Risks and Follow-Ups

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Demo fallback data can hide real empty states | Users think new accounts already have plans/schedules | Keep operational dashboards data-driven and use empty states |
| Payment is simulated | Subscription flow is not production-ready | Mark as classroom MVP, add payment gateway as future work |
| BMI depends on accurate member height/weight | Wrong input affects evaluation quality | Validate ranges and allow profile/onboarding correction |
| MySQL schema changes need migration | Running container may not match `init.sql` | Apply migration or recreate DB with seed |
| Reports may drift from implementation | SE grading suffers | Maintain API docs and this engineering plan alongside code changes |
