# Documentation index

RubyGYM giữ tài liệu ở mức đủ để truy vết đồ án mà không biến repository thành một bộ hồ sơ nặng nề. Tài liệu được chia theo hai mục tiêu của hai học phần.

## Software engineering — Project 12

| Document | Purpose |
| --- | --- |
| [`software-engineering-plan.md`](software-engineering-plan.md) | Product scope, actors, functional/non-functional requirements, use cases, domain model, delivery plan |
| [`requirements-traceability.md`](requirements-traceability.md) | Mapping giữa requirement IDs, implementation modules và verification evidence |
| [`architecture-decisions.md`](architecture-decisions.md) | Các quyết định thiết kế có ảnh hưởng xuyên suốt hệ thống |
| [`diagrams/`](diagrams/) | Use case, class, relational schema, sequence và activity diagrams |

## Application security — Project 2

| Document / evidence | Purpose |
| --- | --- |
| [`stride-threat-model.md`](stride-threat-model.md) | Threat model theo STRIDE, trust boundaries, controls và residual risks |
| [`../.github/workflows/project2-security-ci.yml`](../.github/workflows/project2-security-ci.yml) | Pipeline test, SAST, container scanning và DAST |
| [`../backend/src/routes/vulnerable-demo.js`](../backend/src/routes/vulnerable-demo.js) | Intentional vulnerable fixture dùng riêng để chứng minh SAST detection |
| [`../SECURITY.md`](../SECURITY.md) | Security scope và hướng dẫn báo cáo vấn đề |

## Generated reports

Semgrep, Trivy và OWASP ZAP tạo report trong GitHub Actions. Các report này được upload thành workflow artifacts và **không** được commit vào repository để tránh làm lịch sử Git phình to hoặc lưu kết quả scan cũ như thể chúng còn hiện hành.

Khi dùng report làm evidence cho bài nộp, ghi lại workflow run/commit SHA tương ứng để có thể truy vết kết quả về đúng phiên bản mã nguồn.
