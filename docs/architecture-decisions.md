# Architecture Decision Records

Các quyết định dưới đây ghi lại những lựa chọn có ảnh hưởng đến nhiều module hoặc trực tiếp liên quan đến tiêu chí của hai học phần. Mỗi ADR mô tả quyết định hiện tại, không phải kế hoạch tương lai.

## ADR-001 — Training goals are member-owned

**Status:** Accepted

### Context

Mục tiêu tập luyện là dữ liệu cá nhân do hội viên xác định. Nếu HLV có thể thay đổi trực tiếp mục tiêu, hệ thống khó phân biệt giữa mong muốn của hội viên và đánh giá chuyên môn của HLV.

### Decision

- `MEMBER` là nguồn ghi chính cho training goal.
- `TRAINER` đọc mục tiêu của hội viên được phân công để thực hiện đánh giá.
- `ADMIN` có thể quan sát dữ liệu phục vụ vận hành nhưng không thay thế quyền sở hữu mục tiêu của hội viên trong luồng nghiệp vụ thông thường.

### Consequences

- Mô hình dữ liệu và UI phải thể hiện rõ ownership.
- Monthly evaluation dùng goal làm tham chiếu thay vì tạo một target độc lập không truy vết được.

---

## ADR-002 — Onboarding and goal setting are separate steps

**Status:** Accepted

### Context

Onboarding ban đầu từng có nguy cơ trộn package/trainer/body metrics với training goal, làm cùng một dữ liệu được nhập ở nhiều nơi.

### Decision

Onboarding chỉ chịu trách nhiệm cho body baseline, package và trainer preference. Sau onboarding, hội viên đặt hoặc cập nhật training goal ở luồng Goals riêng.

### Consequences

- Tránh duplicate source of truth.
- Luồng onboarding ngắn hơn và dễ kiểm thử hơn.
- Sequence/activity diagrams phải giữ hai bước tách biệt.

---

## ADR-003 — Authorization is enforced server-side

**Status:** Accepted

### Context

Ẩn nút hoặc route ở frontend không đủ để bảo vệ API. Project 2 yêu cầu thể hiện kiểm soát an toàn ứng dụng, còn Project 12 cần business rules nhất quán giữa các client.

### Decision

- JWT xác thực identity ở backend.
- Role/ownership checks được thực thi trong middleware và route handlers.
- Frontend guards chỉ hỗ trợ UX, không được coi là security boundary.

### Consequences

- Test backend phải bao phủ các trường hợp unauthorized/forbidden quan trọng.
- Các route mới phải xác định actor và ownership rule trước khi merge.

---

## ADR-004 — Security CI separates real-code gates from the vulnerable teaching fixture

**Status:** Accepted

### Context

Project 2 cần chứng minh scanner phát hiện được vulnerability, nhưng cố ý để code dễ lỗi trong application path rồi bắt toàn bộ pipeline phải xanh tạo ra mâu thuẫn giữa demonstration và secure delivery.

### Decision

- Application code thật được Semgrep scan với chế độ fail-on-finding.
- `backend/src/routes/vulnerable-demo.js` là fixture cố ý dễ lỗi, không được mount vào runtime application.
- Fixture được scan ở một job riêng, non-blocking, để chứng minh detection capability.
- Container images được quét bằng Trivy; fixable `HIGH`/`CRITICAL` findings là gate.
- OWASP ZAP baseline chạy trên stack thực tế và lưu report phục vụ review.

### Consequences

- Pipeline vừa có enforcement vừa có bằng chứng học thuật về detection.
- Fixture phải luôn được ghi nhãn rõ và không được import/mount vào `backend/src/index.js`.
- Security reports phải gắn với commit/workflow run thay vì được xem là trạng thái vĩnh viễn của repository.
