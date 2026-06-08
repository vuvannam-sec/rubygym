<div align="center">

# RubyGYM 💎🏋️

**Hệ thống quản lý khách hàng & quảng bá cho trung tâm thể hình RubyGYM**

Project 12 — Công nghệ phần mềm · Project 2 — An toàn ứng dụng web & CI/CD security

</div>

---

## 1. Giới thiệu

RubyGYM là ứng dụng web giúp trung tâm thể hình quản lý huấn luyện viên, hội viên, lịch tập, đánh giá theo tháng, gói hội viên và sự kiện; đồng thời quảng bá trung tâm tới khách truy cập. Dự án phục vụ hai học phần:

- **Project 12 (Công nghệ phần mềm):** quy trình SE đầy đủ — yêu cầu, thiết kế, lập trình, kiểm thử, tài liệu.
- **Project 2 (An toàn ứng dụng web):** tích hợp SAST/DAST/Container Scanning vào CI/CD và threat model STRIDE.

## 2. Công nghệ

| Lớp | Công nghệ |
|---|---|
| Frontend | React 18 (CRA), React Router, design tokens CSS |
| Backend | Node.js + Express, JWT, bcrypt |
| Database | MySQL 8 |
| Triển khai | Docker + Docker Compose, Nginx |
| CI/CD bảo mật | GitHub Actions + Semgrep (SAST), Trivy (container), OWASP ZAP (DAST) |

## 3. Chức năng chính

- Quản lý huấn luyện viên và phân công hội viên (chọn HLV hoặc để trung tâm chỉ định).
- Lập lịch tập với ràng buộc: ≤ 2h/buổi, giờ mở cửa 05:00–20:00 (nghỉ trưa 11:30–13:30), ≤ 8h/ngày/HLV, ≤ 3 hội viên/buổi, hội viên ≤ 3 buổi/ngày (sáng/chiều/tối).
- **Mục tiêu tập luyện do hội viên tự đặt** (nguồn duy nhất); HLV chỉ đọc để đánh giá (xem ADR-001).
- Đánh giá theo tháng dựa trên cân nặng, BMI và so với mục tiêu.
- Gói hội viên 3/6/12 tháng; ưu đãi hội viên thân thiết (+3 tháng) và giới thiệu bạn (+1 tháng).
- Trang công khai: chương trình, bảng giá, HLV, cơ sở vật chất, sự kiện, liên hệ.

## 4. Vai trò & phân quyền

`ADMIN` (vận hành trung tâm) · `TRAINER` (quản lý học viên, lịch, đánh giá) · `MEMBER` (lịch, mục tiêu, gói, kết quả) · `Guest` (xem trang công khai, đăng ký).

## 5. Chạy dự án (Docker)

```bash
docker compose up -d --build
```

| Dịch vụ | Địa chỉ |
|---|---|
| Frontend | http://localhost:8080 |
| Backend API | http://localhost:3000/api |
| MySQL | localhost:3306 |

Dừng: `docker compose down` (thêm `-v` nếu muốn xoá dữ liệu DB).

### Tài khoản demo (dữ liệu seed)

| Vai trò | Email | Mật khẩu |
|---|---|---|
| Admin | `admin@rubygym.com` | `admin123` |
| Trainer | `trainer.linh@rubygym.com` | `trainer123` |
| Member | `member.an@rubygym.com` | `member123` |

> Thông tin trong `docker-compose.yml` (mật khẩu DB, JWT secret) chỉ dùng cho môi trường demo cục bộ.

## 6. Phát triển cục bộ (không Docker)

```bash
# Backend
cd backend && npm install && npm run dev      # cần MySQL chạy sẵn
# Frontend
cd frontend && npm install && npm start
```

## 7. Kiểm thử

```bash
cd backend && npm test      # Jest + Supertest (DB mocked) — 8 suites / 32 tests
cd frontend && CI=true npm test -- --watchAll=false
```

## 8. Tài liệu (thư mục `docs/`)

| Tài liệu | Mô tả |
|---|---|
| `docs/reports/SRS.md` | Đặc tả yêu cầu phần mềm |
| `docs/reports/architecture-decisions.md` | Nhật ký quyết định kiến trúc (ADR) |
| `docs/reports/final-requirement-traceability.md` | Ma trận truy vết yêu cầu ↔ test |
| `docs/reports/design-system.md` | Hệ thống thiết kế (design tokens) |
| `docs/reports/stride-threat-model.md` | Threat model STRIDE (Project 2) |
| `docs/reports/security-pipeline-analysis.md` | Phân tích pipeline bảo mật |
| `docs/diagrams/*.puml` | Use case, class, ERD, sequence, activity (xem `docs/diagrams/README.md`) |

## 9. Bảo mật & CI/CD (Project 2)

GitHub Actions (`.github/workflows/project2-security-ci.yml`) chạy: test backend/frontend → build Docker → **Semgrep SAST (gate)** → **SAST detection demo** (chứng minh phát hiện trên file lỗ hổng mẫu, không chặn) → **Trivy** (gate Critical/High) → **OWASP ZAP** baseline (thông tin). Chi tiết chính sách: ADR-004.

## 10. Cấu trúc thư mục

```
rubygym/
├─ backend/          # Express API (routes, middlewares, config) + tests
├─ frontend/         # React app (components, services, styles/tokens.css)
├─ docker/           # init.sql, seed.sql
├─ docs/             # SRS, ADR, reports, slides, diagrams
├─ .github/workflows # CI/CD bảo mật
└─ docker-compose.yml
```
