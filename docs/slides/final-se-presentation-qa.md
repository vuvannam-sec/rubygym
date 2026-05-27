# RubyGYM Final Presentation Q&A

## 1. Why are Frontend, Backend, Database, and Docker not actors?

Actors are external roles interacting with the system. Frontend, Backend, Database, MySQL, and Docker are internal technical components, so they belong in architecture/deployment discussion, not use-case diagrams.

## 2. Can Member create or join training sessions by themselves?

No. In this implementation, Trainer creates sessions for assigned Members. Admin can support session creation through the API. Member only views assigned personal schedule.

## 3. Is online payment implemented?

No. RubyGYM supports subscription plan registration/renewal and computes end dates/free months. It does not integrate a payment gateway or store payment transactions.

## 4. How is the lunch-break rule enforced?

The schedule route accepts sessions only if the whole session fits in 05:00-11:30 or 13:30-20:00. Any session crossing 11:30-13:30 is rejected.

## 5. How does the system prevent Trainer overbooking?

The backend checks overlapping sessions for the same Trainer and sums daily session minutes. If total minutes exceed 480, the request is rejected.

## 6. How does the system prevent Member overbooking?

The backend checks existing sessions for selected Members on the same day, rejects overlaps, rejects more than three sessions/day, and allows only one session per morning/afternoon/evening period.

## 7. How are training goals implemented?

Training goals are stored in `training_goals`. Member can save/update their own goal through `/api/goals/me`. Trainer can view assigned Member goals and use them during monthly evaluation.

## 8. Can Trainer change a Member's goal?

No. Trainer can view goals for assigned Members, but Member owns goal updates. This matches the requirement that each customer can set their own training goals.

## 9. What is the monthly evaluation rule?

Trainer evaluates assigned Members using target/actual weight, target/actual BMI, and notes. The database enforces one evaluation per Member per month through `uq_member_month`.

## 10. How is loyal membership calculated?

Backend compares `join_date` with the current date. If the Member has trained for more than one year, `is_loyal` is synced. Loyal annual renewal adds 3 free months.

## 11. How is referral bonus handled?

When a referred customer joins, the referrer gets 1 free month. If the referrer has an active subscription, its `end_date` is extended. Otherwise the month is stored in `members.pending_bonus_months` and applied to the next subscription.

## 12. Why is one requirement marked Partial?

Trainer CRUD exists in backend. The frontend trainer management table is demo-ready but some create/update/delete interactions are still local-first. The report is honest and does not overclaim full UI persistence.

## 13. What tests prove schedule rules?

`backend/tests/schedule.test.js` checks rejection for sessions over 2 hours, lunch-break sessions, Member access to another schedule, and valid Admin session creation for assigned Members.

## 14. What tests prove training goals?

`backend/tests/goals.test.js` checks Member self-update, Trainer viewing assigned Member goals, and preventing a Member from updating another Member's goal.

## 15. What should we demo first?

Start with role login, then show Trainer creating a valid and invalid schedule, Member updating goals, Trainer monthly evaluation using that goal, and Member viewing schedule/evaluation result.

## 16. What are the biggest future improvements?

Complete Admin UI backend integration, add real MySQL integration tests, add reporting dashboards, add audit logging, and add CI/CD security scanning.
