# Requirements Traceability Matrix

Tài liệu này nối các requirement IDs trong `software-engineering-plan.md` với implementation và verification evidence hiện có. Mục tiêu là giúp Project 12 có truy vết rõ, đồng thời tránh claim rằng một requirement đã được automated-test nếu repo chưa có test riêng cho nó.

## Functional requirements

| Requirement | Implementation evidence | Verification evidence |
| --- | --- | --- |
| FR-AUTH-01 — Register member | `backend/src/routes/auth.js`, member schema | `backend/tests/auth.test.js` |
| FR-AUTH-02 — Login + JWT | `backend/src/routes/auth.js`, `backend/src/middlewares/auth.js` | `backend/tests/auth.test.js` |
| FR-AUTH-03 — Role enforcement | `backend/src/middlewares/auth.js`, route-level checks | Auth/role cases across backend test suites |
| FR-MEM-01 — Trainer choice / assignment | `backend/src/routes/auth.js`, `backend/src/routes/members.js` | `backend/tests/onboarding.test.js` |
| FR-MEM-02 — Member onboarding | `backend/src/routes/members.js`, `backend/src/routes/subscriptions.js` | `backend/tests/onboarding.test.js` |
| FR-MEM-03 — Member profile/dashboard data | `backend/src/routes/members.js` + member frontend screens | Manual UI verification + build/test pipeline |
| FR-TRN-01 — Manage trainers | `backend/src/routes/trainers.js` | `backend/tests/trainers.test.js` |
| FR-TRN-02 — Assigned-member visibility | `backend/src/routes/trainers.js`, `backend/src/routes/members.js` | `backend/tests/trainers.test.js` and ownership checks |
| FR-SCH-01 — Create training session | `backend/src/routes/schedule.js` | `backend/tests/schedule.test.js` |
| FR-SCH-02 — Max 2 hours/session | `backend/src/routes/schedule.js` | `backend/tests/schedule.test.js` |
| FR-SCH-03 — Operating hours | `backend/src/routes/schedule.js` | `backend/tests/schedule.test.js` |
| FR-SCH-04 — Max 8 trainer hours/day | `backend/src/routes/schedule.js` | `backend/tests/schedule.test.js` |
| FR-SCH-05 — Max 3 members/session | `backend/src/routes/schedule.js` | `backend/tests/schedule.test.js` |
| FR-SCH-06 — Member daily/period limits | `backend/src/routes/schedule.js` | `backend/tests/schedule.test.js` |
| FR-EVL-01 — Trainer monthly evaluation | `backend/src/routes/evaluations.js` | `backend/tests/evaluations.test.js` |
| FR-EVL-02 — Member evaluation history | `backend/src/routes/evaluations.js` + member result UI | `backend/tests/evaluations.test.js` + UI verification |
| FR-SUB-01 — 3/6/12 month plans | `backend/src/routes/subscriptions.js` | `backend/tests/subscription.test.js` |
| FR-SUB-02 — Loyalty extension | `backend/src/routes/subscriptions.js` | `backend/tests/subscription.test.js` |
| FR-SUB-03 — Referral extension | `backend/src/routes/auth.js`, `backend/src/routes/subscriptions.js` | `backend/tests/subscription.test.js` |
| FR-EVT-01 — Manage/view events | `backend/src/routes/events.js` + public/admin event UI | Manual API/UI verification + CI build |

## Non-functional requirements

| Requirement | Evidence |
| --- | --- |
| NFR-SEC-01 — Password hashing | `bcryptjs` in account creation/auth flows |
| NFR-SEC-02 — JWT required on protected APIs | `backend/src/middlewares/auth.js` |
| NFR-SEC-03 — Server-side role enforcement | Authorization middleware + route ownership checks |
| NFR-USE-01 — Clear success/error feedback | Frontend form, toast/error/empty-state behavior |
| NFR-USE-02 — No fake operational data for new members | Data-driven member screens and onboarding flow |
| NFR-MNT-01 — Requirements traceable | This matrix + `software-engineering-plan.md` + diagrams |
| NFR-OPS-01 — Local Docker runtime | `docker-compose.yml`, backend/frontend Dockerfiles |

## Security verification evidence — Project 2

| Control | Pipeline evidence |
| --- | --- |
| Unit/integration tests | `backend-test`, `frontend-test-build` jobs |
| SAST enforcement | `semgrep-sast` job |
| SAST detection demonstration | `semgrep-detection-demo` against intentional fixture |
| Container vulnerability scanning | `trivy-image-scan` job |
| DAST baseline | `zap-baseline-dast` job |
| Threat modeling | `docs/stride-threat-model.md` |

## Maintenance rule

Khi thay đổi requirement hoặc business rule:

1. cập nhật `software-engineering-plan.md`;
2. cập nhật route/component liên quan;
3. thêm hoặc cập nhật test nếu rule có thể kiểm thử tự động;
4. cập nhật diagram nếu flow/domain model thay đổi;
5. cập nhật matrix này trong cùng pull request.
