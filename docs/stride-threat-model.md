# STRIDE Threat Model

## 1. Scope

Threat model này áp dụng cho classroom MVP của RubyGYM:

- React SPA chạy sau Nginx.
- Express REST API.
- MySQL database.
- Authentication bằng email/password và JWT.
- Các actor: Guest, Member, Trainer, Admin.
- GitHub Actions security pipeline.

Các tích hợp production chưa tồn tại như payment gateway, email/SMS, biometric device và attendance hardware nằm ngoài scope.

## 2. Assets

| Asset | Why it matters |
| --- | --- |
| User credentials / password hashes | Compromise có thể dẫn tới account takeover |
| JWT signing secret | Cho phép giả mạo session nếu bị lộ |
| Member profile and health-related training metrics | Dữ liệu riêng tư của hội viên |
| Trainer/member assignment | Quyết định ownership và quyền truy cập dữ liệu |
| Schedule and evaluation records | Ảnh hưởng vận hành và tính đúng đắn của tiến độ |
| Subscription/referral data | Ảnh hưởng entitlement và thời hạn dịch vụ |
| CI results and artifacts | Evidence cho chất lượng và security controls |

## 3. Trust boundaries

```text
Internet / Browser
        |
        | HTTP
        v
React SPA / Nginx
        |
        | REST API + JWT
        v
Express API
        |
        | SQL connection
        v
MySQL

GitHub repository -> GitHub Actions runners -> scanner containers / workflow artifacts
```

Backend API là security boundary chính. Frontend route guards không được coi là authorization control.

## 4. STRIDE analysis

| Category | Example threat | Existing control | Residual risk / follow-up |
| --- | --- | --- | --- |
| **Spoofing** | Credential theft hoặc JWT giả mạo | bcrypt password hashing; JWT verification; signing secret từ environment | Demo credentials yếu và công khai; chỉ dùng local/classroom |
| **Tampering** | Member sửa record của người khác; trainer sửa goal không thuộc quyền | Server-side role/ownership checks; parameterized DB access expected in real routes | Route mới có thể quên ownership check; cần test/review |
| **Repudiation** | User phủ nhận thao tác thay đổi lịch/đánh giá | Authenticated identity có trong request context | Chưa có production audit log bất biến; chấp nhận trong MVP |
| **Information disclosure** | Trả quá nhiều member data; secret bị commit | Role-based endpoints; `.gitignore` cho env/key files; local `.env.example` tách khỏi secret thật | Cần rà soát response fields khi thêm API mới |
| **Denial of service** | Request flood hoặc payload lớn | Express defaults và container isolation ở mức cơ bản | Chưa có rate limiting/reverse-proxy hardening; ngoài classroom MVP |
| **Elevation of privilege** | MEMBER gọi admin/trainer endpoint | JWT + role authorization middleware + ownership validation | Frontend không phải boundary; backend test phải kiểm tra 401/403 |

## 5. Security verification strategy

### SAST — Semgrep

Application code được scan với gate. Intentional vulnerable fixture được scan riêng để chứng minh scanner phát hiện được các pattern như SQL injection, XSS, hardcoded credential, path traversal, insecure random và `eval`.

### Container scanning — Trivy

Backend/frontend images được scan. Pipeline chặn fixable `HIGH` và `CRITICAL` vulnerabilities theo policy hiện tại.

### DAST — OWASP ZAP

GitHub Actions khởi động stack thật và chạy ZAP baseline trên frontend. Report được upload thành workflow artifact để review.

### Automated tests

Jest/Supertest tập trung vào authentication, authorization, onboarding, scheduling, subscription, goals, evaluations và health behavior.

## 6. Intentional vulnerable fixture

`backend/src/routes/vulnerable-demo.js` là teaching fixture, không phải route production và không được import vào `backend/src/index.js`.

Rules:

1. Không mount fixture vào runtime application.
2. Không copy code từ fixture sang route thật.
3. Chỉ dùng fixture cho static-analysis demonstration.
4. Nếu cấu trúc app thay đổi, phải kiểm tra lại rằng fixture vẫn tách khỏi runtime.

## 7. Accepted classroom limitations

Các control sau được xem là future work thay vì requirement bắt buộc của MVP:

- Rate limiting và abuse prevention production-grade.
- Centralized audit logging / SIEM.
- Secret manager/KMS thay cho environment variables.
- TLS termination và production reverse-proxy hardening.
- MFA.
- Production backup, disaster recovery và database encryption strategy.

Việc ghi rõ các giới hạn này nhằm phân biệt security scope của đồ án với claim rằng hệ thống đã production-ready.
