# RubyGYM Sprint Plan

## Overview

- Duration: 16 weeks
- Total sprints: 6
- Delivery style: Incremental, demo at week 8, progress review at week 12, final defense at week 16
- Team note: Nam codes the implementation; task assignment below is for presentation, planning, and reporting on paper

## Sprint Timeline

| Sprint | Weeks | Goal | Assigned Member (on paper) | Main Deliverables |
| --- | --- | --- | --- | --- |
| Sprint 1 | Week 1-2 | Clarify scope, users, business rules, and architecture baseline | Dương Ngô Hoàng Vũ | Use case draft, stakeholder list, initial backlog, project structure |
| Sprint 2 | Week 3-5 | Build authentication, database schema, and core backend skeleton | Nguyễn Công Sơn | `init.sql`, auth API, route skeletons, environment setup |
| Sprint 3 | Week 6-8 | Complete trainer/member/schedule flows for first milestone demo | Nguyễn Công Sơn, Dương Ngô Hoàng Vũ | CRUD APIs, business-rule validation, week 7-8 requirement-analysis slides |
| Sprint 4 | Week 9-11 | Add subscriptions, evaluations, and basic frontend pages | Trần Bình Minh | React screens, JWT flow, dashboards, week 11-12 progress slides |
| Sprint 5 | Week 12-14 | Dockerize app, add tests, prepare reports and API docs | Chu Văn An | Docker setup, automated tests, test cases report, API docs |
| Sprint 6 | Week 15-16 | Stabilize system, rehearse demo, finalize presentation artifacts | Vũ Văn Nam | Final presentation slides, sprint summary, release candidate |

## Detailed Plan

### Sprint 1: Requirement Discovery

- Goal: Understand the gym management problem and freeze the MVP scope.
- User stories:
  - As an admin, I want to manage trainers, members, events, and subscriptions.
  - As a trainer, I want to manage my clients, schedule, and monthly evaluations.
  - As a member, I want to view my schedule, evaluations, and active subscriptions.
- Tasks:
  - Interview course stakeholder assumptions and convert them into use cases.
  - Capture business rules: operating hours, session limits, loyalty and referral logic.
  - Define architecture decision: React + Express + MySQL + Docker.
- Deliverables:
  - Product scope document.
  - Use case diagram and initial backlog.
  - High-level project structure.

### Sprint 2: Backend Foundation

- Goal: Make the backend runnable with a clean schema and authentication flow.
- User stories:
  - As a user, I want to register and login securely.
  - As a developer, I want a testable Express app separated from the server bootstrap.
- Tasks:
  - Create database schema for users, trainers, members, subscriptions, sessions, evaluations, and events.
  - Implement `auth/register` and `auth/login`.
  - Add JWT middleware and core route registration.
- Deliverables:
  - `backend/src/index.js` and `server.js`.
  - `docker/init.sql`.
  - Auth endpoints and sample environment file.

### Sprint 3: Core Gym Operations

- Goal: Cover the most visible daily workflows before the first in-class demo.
- User stories:
  - As an admin, I want full CRUD for trainers and members.
  - As a trainer, I want to create compliant training sessions.
  - As a member, I want my profile and schedule protected by role-based access.
- Tasks:
  - Complete trainer/member CRUD.
  - Add schedule CRUD and enforce operating-hour and capacity rules.
  - Prepare week 7-8 requirement presentation content.
- Deliverables:
  - CRUD APIs for trainers, members, schedule.
  - Seed data for realistic screenshots and demos.
  - Requirement-analysis slide content.

### Sprint 4: Fitness Tracking Experience

- Goal: Connect the remaining business modules and expose them in the frontend.
- User stories:
  - As a member, I want to purchase or renew subscriptions.
  - As a trainer, I want to record monthly evaluations for my own clients.
  - As any authenticated user, I want a simple dashboard based on my role.
- Tasks:
  - Implement subscriptions CRUD with loyalty/referral logic.
  - Implement evaluations CRUD with trainer-client ownership check.
  - Build React app with router, auth context, dashboard, and CRUD forms.
- Deliverables:
  - Frontend pages for auth, dashboards, trainers, members, schedule, evaluations, subscriptions, events.
  - Role-based navigation and Axios JWT interceptor.
  - Progress slide content draft.

### Sprint 5: Integration and Quality

- Goal: Make the system easier to deploy, test, and explain.
- User stories:
  - As a developer, I want backend tests that do not need a real MySQL server.
  - As a presenter, I want clear documentation for API and test coverage.
- Tasks:
  - Add Jest + Supertest test suites with mocked DB.
  - Add frontend Dockerfile and full `docker-compose`.
  - Write API documentation and structured test-case report.
- Deliverables:
  - Passing backend tests.
  - Working frontend build.
  - Docker compose configuration and reports.

### Sprint 6: Final Hardening and Defense

- Goal: Package the project for final submission and live demo.
- User stories:
  - As a course team, we want a stable final build for presentation day.
  - As the main implementer, Nam wants a coherent story about both software engineering and deployment.
- Tasks:
  - Fix final bugs found during rehearsal.
  - Prepare final slides, demo script, and speaking notes.
  - Freeze scope and verify all required artifacts exist.
- Deliverables:
  - Final-presentation slide content.
  - Demo-ready repository state.
  - Submission checklist.

## Milestones

| Week | Milestone | Exit Criteria |
| --- | --- | --- |
| Week 2 | Scope approved | Use cases and backlog aligned with course expectations |
| Week 5 | Backend foundation ready | Auth flow works and DB schema is stable |
| Week 8 | Midpoint classroom demo | Core CRUD and schedule business rules demonstrable |
| Week 12 | Progress review | Frontend pages and integration are visible end-to-end |
| Week 14 | Release candidate | Tests pass, Docker config validates, docs mostly complete |
| Week 16 | Final defense | Slides, reports, demo, and codebase all ready |
