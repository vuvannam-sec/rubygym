# UX Consistency Report — RubyGYM

Ngày: 2026-06-08. Phạm vi: rà soát toàn bộ giao diện (public + 3 vai trò Admin/Trainer/Member) để phát hiện trùng lặp, nhập nhằng, link chết và rò rỉ dữ liệu giả (mock-data). Mỗi mục ghi rõ trạng thái và task xử lý.

Quy ước trạng thái: ✅ Đã sửa | 🔜 Sẽ xử lý ở task sau | ➖ Chấp nhận (có lý do).

## 1. Trùng lặp chức năng

| # | Vấn đề | Vị trí | Trạng thái |
|---|---|---|---|
| 1.1 | Nhập "Mục tiêu tập luyện" ở **hai nơi** (Onboarding và trang Mục tiêu), cùng ghi vào `training_goals` | `MemberOnboarding.js`, `TrainingGoals.js`, `members.js`, `goals.js` | ✅ Task 2+3: gỡ khỏi onboarding; `/member/goals` là nguồn duy nhất (ADR-001, ADR-002) |
| 1.2 | Chỉ số cân nặng/chiều cao thu ở Đăng ký **và** Onboarding | `RegisterForm.js`, `MemberOnboarding.js` | ➖ Có chủ đích: Đăng ký lấy baseline (FR-AUTH-01), Onboarding cho **xác nhận/cập nhật** (pre-fill từ hồ sơ). Không phải lỗi |
| 1.3 | Danh sách hội viên ở Admin (`MemberList`) và Trainer (`MyMembersPage`) | hai vai trò khác nhau | ➖ Không trùng: phạm vi dữ liệu và quyền khác nhau (toàn bộ vs khách của HLV) |

## 2. Nhập nhằng nội dung / nhãn

| # | Vấn đề | Vị trí | Trạng thái |
|---|---|---|---|
| 2.1 | Onboarding/Dashboard nhắc "lưu mục tiêu ban đầu" như một bước của onboarding | `MemberDashboard.js` callout | ✅ Task 3: sửa text, mục tiêu tách sang trang Mục tiêu |
| 2.2 | Đăng ký ghi "đưa bạn tới bước chọn gói tập **và mục tiêu**" | `RegisterForm.js` subtitle | ✅ Task 4: đổi thành "chọn gói tập và hoàn tất hồ sơ ban đầu" |
| 2.3 | Branding mâu thuẫn: "RubyGYM **Cloud**" + "Điều hành phòng gym trong một nền tảng duy nhất" (định vị SaaS bán cho phòng gym) trong khi RubyGYM **là chính phòng gym** | `LoginForm.js` | ✅ Task 4: đổi sang cổng của chính trung tâm ("Chào mừng trở lại RubyGYM", "Trung tâm thể hình") theo ADR-005 |
| 2.4 | Landing định vị "Nền tảng quản lý phòng gym thế hệ mới" (giọng SaaS B2B) thay vì trang của chính phòng gym | `LandingPage.js` hero | 🔜 Task 6: redesign trang công khai theo phong cách gym thật |
| 2.5 | Lẫn lộn thuật ngữ "workspace" (tiếng Anh) trong UI tiếng Việt | `Sidebar.js`, `LoginForm.js` | 🔜 Task 7: chuẩn hóa thuật ngữ khi redesign khu làm việc |

## 3. Rò rỉ dữ liệu giả (mock-data) vào màn hình vận hành

> Vi phạm NFR-USE-03: tài khoản thật không được hiển thị lịch/gói/số liệu giả.

| # | Vấn đề | Vị trí | Trạng thái |
|---|---|---|---|
| 3.1 | Dashboard Admin hiển thị `adminStats` + `recentActivities` + "Tín hiệu nổi bật" **hardcode** như số liệu thật | `AdminDashboard.js` | 🔜 Task 7: wiring dữ liệu thật từ API (`/members`, `/subscriptions`, `/trainers`, `/events`) + empty state |
| 3.2 | Báo cáo Admin dùng `reportRows` cứng, tiêu đề "Hiệu suất tháng 04/2026" cố định, khuyến nghị giả | `AdminReports.js` | 🔜 Task 7: tính từ dữ liệu thật hoặc đánh dấu rõ là mẫu |
| 3.3 | Trainer/Member dashboard dùng fallback giả khi API lỗi | `TrainerDashboard.js`, `MemberDashboard.js` | 🔜 Task 7: chuyển sang empty/error state rõ ràng |
| 3.4 | Danh sách dùng `initialMembers/initialTrainers/initialEvents` làm seed | `MemberList.js`, `TrainerList.js`, `EventList.js` | 🔜 Task 7: ưu tiên dữ liệu API, mock chỉ là fallback có nhãn |
| 3.5 | `EvaluationForm` dùng `trainerMembers`, `trainerEvaluationRows` giả | `EvaluationForm.js` | 🔜 Task 7/9: nối API thật + test |
| 3.6 | `weeklyDays` (nhãn T2..CN) import từ `mockData` | `ScheduleView.js` | ➖ Là hằng số nhãn UI hợp lệ, không phải dữ liệu giả. Cân nhắc chuyển sang `constants` ở Task 7 |
| 3.7 | `RegisterForm` dùng `fallbackTrainers` khi `/trainers/public` lỗi | `RegisterForm.js` | ➖ Fallback graceful chấp nhận được; có thể bỏ khi backend ổn định |

## 4. Link chết / điều hướng

| # | Kết quả |
|---|---|
| 4.1 | Đã đối chiếu mọi `to=`/`navigate(...)` với bảng route trong `App.js`: tất cả đều hợp lệ (`/`, `/login`, `/register`, `/admin*`, `/trainer*`, `/member*`). **Không có link chết.** ✅ |

## 5. Tổng kết
- Đã sửa ngay trong Task 2–4: 1.1, 2.1, 2.2, 2.3 (các trùng lặp/nhập nhằng cốt lõi).
- Chuyển sang Task 6 (public) và Task 7 (workspace): 2.4, 2.5, và toàn bộ nhóm 3 (rò rỉ mock-data) — vì các component này sẽ được viết lại khi redesign, nối dữ liệu thật + empty state trong cùng một lần chạm để tránh sửa hai lần.
- Các mục ➖ là quyết định có chủ đích, ghi lại để không bị hiểu nhầm là thiếu sót.
