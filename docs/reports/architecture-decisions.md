# Architecture Decision Records (ADR) — RubyGYM

Tài liệu này ghi lại các quyết định thiết kế quan trọng của dự án RubyGYM (Project 12 - Công nghệ phần mềm và Project 2 - An toàn ứng dụng web). Mỗi quyết định giải thích bối cảnh, lựa chọn và hệ quả, dùng làm nguồn tham chiếu duy nhất khi tài liệu khác (SRS, use case, sơ đồ) có khác biệt.

Trạng thái hợp lệ: `Accepted` (đã áp dụng), `Superseded` (bị thay thế), `Proposed` (đề xuất).

---

## ADR-001 — Chủ sở hữu "Mục tiêu tập luyện" là Hội viên (Member)

- **Trạng thái:** Accepted (2026-06-08)
- **Bối cảnh:** Đề bài gốc viết "Mỗi huấn luyện sẽ thiết lập mục tiêu luyện tập cho mình" (mơ hồ). SRS phiên bản cũ (`FR-EVL-01`) ghi Trainer đặt mục tiêu, trong khi đặc tả use case UC05 và code thực tế (`backend/src/routes/goals.js`, `evaluations.js`) lại để Member tự đặt. Ba nguồn mâu thuẫn — đây là lỗi truy vết yêu cầu.
- **Quyết định:** Hội viên **tự đặt và cập nhật** mục tiêu tập luyện của chính mình (loại mục tiêu, cân nặng mục tiêu, BMI mục tiêu, ngày mục tiêu, ghi chú). Đây là **nguồn dữ liệu duy nhất** cho mục tiêu. Huấn luyện viên và Admin **chỉ đọc** mục tiêu này khi lập lịch và đánh giá tháng, **không được chỉnh sửa** mục tiêu của hội viên.
- **Hệ quả:**
  - Một endpoint mục tiêu duy nhất: `GET/PUT /api/goals/me` (chủ sở hữu là Member), và `GET /api/goals/member/:id` (Trainer/Admin chỉ đọc).
  - Bảng `training_goals` giữ ràng buộc `UNIQUE(member_id)` — mỗi hội viên đúng một mục tiêu hiện hành.
  - Khi đánh giá tháng, hệ thống tự lấy `target_weight`/`target_bmi` từ mục tiêu của hội viên (đã có trong `evaluations.js`).
  - SRS được sửa cho khớp (xem `SRS.md` mục Training Goals & Monthly Evaluation).

## ADR-002 — Phạm vi Onboarding không bao gồm "Mục tiêu"

- **Trạng thái:** Accepted (2026-06-08)
- **Bối cảnh:** Giao diện hội viên có **hai chỗ nhập mục tiêu**: khối "Mục tiêu tập luyện" trong màn Onboarding (`MemberOnboarding.js` → `PUT /members/me/onboarding`) và trang riêng `/member/goals` (`TrainingGoals.js` → `PUT /goals/me`). Cả hai ghi vào cùng một dòng `training_goals`, gây trùng lặp và rối trải nghiệm.
- **Quyết định:** Onboarding chỉ thu thập **chỉ số cơ thể (cân nặng, chiều cao) + gói tập + huấn luyện viên mong muốn**. Việc đặt mục tiêu tách hẳn sang trang **Mục tiêu** (`/member/goals`) và là chức năng hậu-onboarding.
- **Hệ quả:**
  - `PUT /members/me/onboarding` không còn ghi `training_goals`; bỏ `goal_type` khỏi trường bắt buộc.
  - Điều kiện "onboarding hoàn tất" = có chỉ số cơ thể + có subscription (KHÔNG còn phụ thuộc mục tiêu). `missing_steps` chỉ gồm `PROFILE_METRICS`, `SUBSCRIPTION`.
  - Frontend: gỡ khối mục tiêu khỏi `MemberOnboarding.js`; dashboard và onboarding điều hướng hội viên sang trang Mục tiêu.
  - Test `onboarding.test.js` được cập nhật theo hành vi mới.

## ADR-003 — "Nhận xét sau mỗi buổi tập" hiểu là chu kỳ đánh giá theo tháng

- **Trạng thái:** Accepted (2026-06-08)
- **Bối cảnh:** Đề bài: "nhận được nhận xét sau mỗi buổi luyện tập (được thiết lập là 1 tháng)". Câu này có thể hiểu là nhận xét từng buổi, nhưng cụm "được thiết lập là 1 tháng" cho thấy chu kỳ nhận xét được ấn định theo tháng.
- **Quyết định:** Hệ thống cung cấp **đánh giá/nhận xét theo tháng** (`monthly_evaluations`) thay vì nhận xét cho từng buổi tập riêng lẻ. Mỗi hội viên có tối đa một đánh giá cho mỗi tháng (`UNIQUE(member_id, month_year)`).
- **Hệ quả:** Không xây tính năng nhận xét theo từng buổi (tránh phình phạm vi). SRS và use case mô tả rõ chu kỳ tháng. Nếu sau này cần nhận xét theo buổi, mở ADR mới thay thế.

## ADR-004 — Chính sách cổng chất lượng (quality gate) cho pipeline bảo mật

- **Trạng thái:** Accepted (2026-06-08)
- **Bối cảnh:** SRS cũ (`NFR-SEC-07`) ghi "pipeline phải fail khi có lỗi Critical/High", nhưng workflow thực tế để Trivy `--exit-code 0` (không bao giờ fail) và Semgrep `scan` cũng không chặn. Ngoài ra dự án cố ý có file lỗ hổng `backend/src/routes/vulnerable-demo.js` để minh họa khả năng phát hiện của SAST — file này **không được mount** trong `index.js` nên không expose ra ứng dụng đang chạy; bản vá tham chiếu là `vulnerable-demo-fixed.js`.
- **Quyết định:**
  - Tách hai mục tiêu rạch ròi: (1) **chứng minh phát hiện** và (2) **cổng chất lượng cho code thật**.
  - **Job "SAST detection demo"**: quét riêng `vulnerable-demo.js`, cho phép tìm thấy lỗi và **không chặn** pipeline (informational) — bằng chứng Semgrep bắt được SQLi/XSS/eval/hardcoded secret/path traversal/insecure random.
  - **Cổng chất lượng (gate)**: Semgrep (SAST) và Trivy (container/image) **fail pipeline khi có Critical/High** trên *mã ứng dụng thật*, có **loại trừ** `vulnerable-demo.js` khỏi gate (vì nó là tài liệu giảng dạy, không chạy).
  - **DAST (OWASP ZAP baseline)**: chạy và tải báo cáo nhưng **không chặn** (informational), vì baseline scan trên app demo tạo nhiều cảnh báo mức thấp; xem xét thủ công.
  - Mọi scanner luôn tải báo cáo dạng máy đọc được làm artifact.
- **Hệ quả:** `NFR-SEC-07` được viết lại chính xác theo chính sách này; workflow `.github/workflows/project2-security-ci.yml` được chỉnh để khớp (Task 10). Người chấm thấy được cả "bằng chứng phát hiện" lẫn "cổng chặn code thật".

## ADR-005 — Hệ thống giao diện dùng Design Tokens, branding ruby + nền tối

- **Trạng thái:** Accepted (2026-06-08)
- **Bối cảnh:** Giao diện hiện tại mang dáng dashboard SaaS chung chung, chưa giống website phòng gym thật, và CSS dùng nhiều giá trị màu/spacing rải rác khó bảo trì.
- **Quyết định:** Xây bộ **CSS design tokens** tập trung (biến `:root`) cho màu, typography, spacing, bo góc, đổ bóng, breakpoint. Bảng màu thương hiệu: **đỏ ruby/crimson làm điểm nhấn trên nền tối (charcoal/near-black) năng động**, kèm tông trung tính sạch. Trang công khai được dựng theo mô-típ web phòng gym thật (hero mạnh, chương trình/lớp tập, bảng giá hội viên, đội ngũ HLV, cơ sở vật chất, sự kiện, cảm nhận, liên hệ).
- **Hệ quả:** Mọi component dùng token thay vì giá trị cứng; đổi theme tập trung một chỗ. Ảnh tái dùng `imageCatalog` (`frontend/src/services/imageUtils.js`); ảnh còn thiếu dùng placeholder, danh sách prompt ảnh được bàn giao ở cuối.

## ADR-006 — Ranh giới phạm vi Project 12 (SE) và Project 2 (Security)

- **Trạng thái:** Accepted (2026-06-08)
- **Bối cảnh:** Cùng một mã nguồn RubyGYM phục vụ hai môn. Tài liệu trộn lẫn yêu cầu chức năng và yêu cầu pipeline bảo mật gây khó chấm.
- **Quyết định:** Trong SRS và tài liệu, **đánh nhãn rõ**: yêu cầu chức năng + thiết kế phần mềm thuộc **Project 12**; yêu cầu kiểm thử bảo mật tự động (SAST/DAST/Container Scan), threat model STRIDE, pipeline CI/CD thuộc **Project 2**. Hai phần dùng chung kiến trúc nhưng tách mục.
- **Hệ quả:** SRS có mục riêng "Security Engineering (Project 2)"; tài liệu bảo mật nằm trong `docs/reports/` với tiền tố/nhãn rõ ràng.
