# Goal 1 — Complete RubyGYM for Final Software Engineering Submission

## 1. Purpose

Complete RubyGYM end-to-end for the final Software Engineering submission.

This goal includes:
- Completing the working web application.
- Aligning the implementation with the original requirements.
- Updating database/backend/frontend/docs as needed.
- Creating final SE documentation.
- Creating use-case diagrams, relational schema diagrams, use-case specifications, and requirement traceability.
- Creating final presentation content in Markdown only.

Do not generate a `.pptx` file. Only create slide content/outline in Markdown.

Be strict about requirement correctness, actor responsibility, use-case logic, and wording.

---

## 2. Original Requirements

RubyGYM is a web-based gym management system for managing customers and promoting the gym center.

The original requirements are:

1. The system manages trainers in the center.
2. Each trainer manages a list of customers assigned to them.
3. A customer can choose a trainer, or the center/admin assigns a trainer if the customer does not choose one.
4. Trainers set up training schedules for their customers.
5. A training session lasts at most 2 hours.
6. The center operates from 05:00 to 20:00.
7. Lunch break is from 11:30 to 13:30; no training session is allowed during this time.
8. A trainer works at most 8 hours per day.
9. In one training session, a trainer can guide at most 3 customers.
10. A customer can attend at most 3 sessions per day: morning, afternoon, or evening.
11. Each customer can set their own training goals.
12. At the end of each month, the trainer evaluates each assigned customer based on weight, BMI, and comparison with training goals.
13. A customer’s schedule appears in the customer account after being set up by the trainer.
14. Customers can see their weekly activities and receive comments after each monthly training cycle.
15. Customers joining the center become members.
16. Customers who have trained for more than 1 year become loyal members.
17. Loyal members receive 3 free training months when registering for one more year.
18. A customer who refers a new customer receives 1 free training month for each referred customer who joins the center.
19. Customers can register membership plans for 3 months, 6 months, or 1 year.
20. Extra free months are added to the valid membership/subscription duration.
21. The center can create events to encourage training activities.
22. Event information is published on the gym website.

---

## 3. Critical Correctness Rules

### 3.1 Valid actors

Use only external users as actors:

- Guest
- Member
- Trainer
- Admin

Do not model these as actors:

- Frontend
- Backend
- Database
- MySQL
- React
- Express
- Docker
- GitHub Actions
- CI/CD tools

These are internal components, not actors.

### 3.2 Do not invent unsupported features

Do not claim the system supports these unless actually implemented:

- Online payment
- Mobile app
- Nutrition planning
- Wearables
- Equipment management
- Member self-registration into training sessions
- Automatic AI evaluation

If a requirement is partial, document it as partial.

### 3.3 Be precise with wording

Be very careful with "and" and "or".

Correct examples:
- "Trainer or Admin can create a training session" if either role can do it independently.
- "Member views assigned schedule."
- "Trainer creates training sessions for assigned members."
- "Login is a precondition for protected use cases."

Incorrect examples:
- "Trainer and Admin create a session together" unless both are required at the same time.
- "Member creates/registers for training sessions" unless implemented.
- "Database is an actor."
- "Online payment is implemented" unless implemented.

---

## 4. Required Application Work

Inspect the existing repository first.

Then complete or fix the project so it is demo-ready.

Required areas:

1. Authentication and role-based access control.
2. Admin trainer management.
3. Admin member management.
4. Trainer assigned-client management.
5. Member trainer selection or admin trainer assignment.
6. Subscription plans for 3 months, 6 months, and 1 year.
7. Loyalty bonus:
   - customer trained for more than 1 year
   - registers for another 1-year plan
   - receives 3 free months
8. Referral bonus:
   - referrer receives 1 free month when referred customer joins.
9. Training goals:
   - Member should be able to set/update their own training goals.
   - Implement this if missing and feasible.
   - Trainer should be able to view goals during evaluation.
10. Training session scheduling:
   - created by Trainer or Admin if supported
   - no session during 11:30–13:30
   - within 05:00–11:30 or 13:30–20:00
   - max 2 hours/session
   - max 8 hours/day/trainer
   - max 3 members/session
   - max 3 sessions/day/member
   - no overlapping trainer sessions
   - no overlapping member sessions
   - trainer schedules assigned members only unless Admin override is intentionally implemented
11. Member personal schedule:
   - Member can view only their own assigned schedule.
   - Member must not view other members’ schedules.
12. Monthly evaluations:
   - Trainer evaluates assigned members.
   - One evaluation per member per month.
   - Store target weight, actual weight, target BMI, actual BMI, and notes.
   - Compare actual values with goals/targets if implemented.
13. Events:
   - Admin can create/manage events if supported.
   - Public users/Guest can view published events if supported.
14. Frontend should be clean enough for demo:
   - no broken routes
   - clear navigation by role
   - clear error/loading/empty states
   - consistent labels and layout
15. Docker/local run should be verified or limitations documented.

---

## 5. Required SE Documentation Outputs

Create or update the following files.

### 5.1 Final project audit

Create/update:

- `docs/reports/final-se-project-audit.md`

Include:
- implemented features
- partially implemented features
- missing/future features
- database status
- backend status
- frontend status
- test/build status
- Docker status
- known limitations

### 5.2 Use-case diagrams

Create/update:

- `docs/diagrams/usecase-full-simplified.puml`
- `docs/diagrams/usecase-selected.puml`

Render PNGs if PlantUML is available:

- `docs/diagrams/usecase-full-simplified.png`
- `docs/diagrams/usecase-selected.png`

Full use-case diagram:
- Actors: Guest, Member, Trainer, Admin.
- Boundary: RubyGYM System.
- Include implemented major use cases.
- No internal technical components as actors.
- No online payment.
- No Member self-registering into training sessions unless implemented.

Selected use-case diagram:
Include the 5 most important SE use cases:

- UC01 Manage Members
- UC02 Register/Renew Subscription Plan
- UC03 Create Training Session
- UC04 View Personal Schedule
- UC05 Perform Monthly Evaluation

Actor mapping must match actual implementation.

### 5.3 Relational schema diagrams

Create/update:

- `docs/diagrams/relational-schema.puml`
- `docs/diagrams/relational-schema-simplified.puml`

Render PNGs if possible.

The schema must reflect the actual database.

Include at least:
- users
- trainers
- members
- subscriptions
- training_sessions
- session_members
- monthly_evaluations
- events
- training_goals if implemented

### 5.4 Use-case specifications

Create/update:

- `docs/reports/use-case-specifications.md`

Language: Vietnamese.

For each selected use case, include:
- ID
- name
- main actor
- supporting actor if any
- goal
- preconditions
- trigger
- basic flow
- alternative/exception flows
- input data
- output data
- related tables
- business rules
- postconditions

Be strict and logical. Alternative flows must reference valid basic-flow steps.

### 5.5 Requirement traceability

Create/update:

- `docs/reports/final-requirement-traceability.md`

Map each original requirement to:
- status: Implemented / Partial / Missing / Future
- related use case
- related database table
- related backend route
- related frontend component
- notes

Be honest. Do not hide partial or missing items.

### 5.6 Final SE report

Create/update:

- `docs/reports/final-se-report.md`

Language: Vietnamese.

The report should include:
1. Project introduction
2. Team members and roles
3. Original requirements
4. Scope and MVP boundary
5. Actors and system boundary
6. Use-case diagrams
7. Selected use-case specifications summary
8. Relational schema
9. System architecture overview
10. Main implemented features
11. Backend API overview
12. Frontend UI overview
13. Database design
14. Business rules implementation
15. Testing/build summary
16. Requirement traceability summary
17. Demo guide
18. Limitations
19. Future improvements
20. Conclusion

### 5.7 Final presentation content

Create/update Markdown content only:

- `docs/slides/final-se-presentation-content.md`

Do not create `.pptx`.

The content should be suitable for creating final slides manually or with an AI slide tool.

Include:
1. Title and team
2. Problem and motivation
3. Original requirements summary
4. Scope/MVP boundary
5. Actors and system boundary
6. Full use-case diagram
7. Five selected use cases
8. Relational schema
9. Architecture overview
10. Main implemented features
11. Schedule business rules
12. Subscription/loyalty/referral rules
13. Training goals and monthly evaluation
14. Demo flow
15. Testing/build summary
16. Requirement traceability summary
17. Limitations and future work
18. Conclusion

Also create/update:

- `docs/slides/final-se-presentation-qa.md`

Include likely instructor questions and concise answers.

---

## 6. Testing and Verification

Run as much as possible.

Backend:
- install dependencies if needed
- run tests
- start backend if feasible

Frontend:
- install dependencies if needed
- run tests if available
- run build

Docker:
- `docker compose config`
- `docker compose build` if feasible
- `docker compose up` if feasible

If a command fails due to a real project issue, fix it and retry.
If it fails due to environment/tool limitations, document the limitation.

Create/update:

- `docs/reports/final-test-build-evidence.md`

Include exact commands and results.

---

## 7. Acceptance Criteria

Goal 1 is complete only when:

1. The application is demo-ready or limitations are clearly documented.
2. Core backend features work or issues are documented.
3. Frontend builds or limitations are documented.
4. Database schema matches backend queries.
5. Training goals are implemented or clearly documented as partial/future.
6. Use-case diagrams are logically correct.
7. Relational schema diagrams are accurate.
8. Use-case specifications are complete and precise.
9. Requirement traceability is honest.
10. Final SE report exists.
11. Final SE presentation content exists as Markdown.
12. No unsupported feature is claimed.
13. Actor responsibilities are not mixed.
14. Final summary is provided.

---

## 8. Final Response Required

When finished, provide:

1. Files created/updated.
2. Features implemented or fixed.
3. Test/build commands run and results.
4. Docker verification result.
5. Diagrams generated.
6. Reports generated.
7. Known limitations.
8. What the student should study before final SE presentation.
9. Exact next commands to run locally.

Do not stop before producing this final summary.
