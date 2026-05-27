# Báo cáo cuối kỳ Công nghệ phần mềm - RubyGYM

## 1. Giới thiệu dự án

RubyGYM là hệ thống web quản lý phòng gym, tập trung vào quản lý hội viên, huấn luyện viên, lịch tập, gói tập, ưu đãi loyal/referral, mục tiêu tập luyện, đánh giá tháng và sự kiện. Mục tiêu của dự án là tạo một sản phẩm đủ demo cho môn Công nghệ phần mềm, đồng thời bám sát yêu cầu nghiệp vụ ban đầu.

## 2. Thành viên và vai trò

| Thành viên | Vai trò |
|---|---|
| Vũ Văn Nam | Project Manager, DevOps, tài liệu cuối kỳ |
| Nguyễn Công Sơn | Backend/API |
| Trần Bình Minh | Frontend/UI |
| Chu Văn An | Database, test, Docker |

## 3. Yêu cầu ban đầu

Hệ thống phải quản lý Trainer, Member, phân công Trainer, lịch tập theo quy tắc vận hành, mục tiêu tập luyện, đánh giá tháng, subscription 3/6/12 tháng, ưu đãi loyal/referral và sự kiện công khai trên website. Bản traceability chi tiết nằm tại `docs/reports/final-requirement-traceability.md`.

## 4. Phạm vi và MVP

MVP hiện tại bao gồm web app React, REST API Express, cơ sở dữ liệu MySQL, seed data demo và Docker Compose. Ngoài phạm vi: thanh toán trực tuyến, mobile app, dinh dưỡng, wearable, thiết bị phòng tập, AI evaluation và Member tự đăng ký vào buổi tập.

## 5. Actor và ranh giới hệ thống

Actor hợp lệ: Guest, Member, Trainer, Admin. RubyGYM System là ranh giới phần mềm. Frontend, Backend, Database, MySQL, Docker và CI/CD là thành phần kỹ thuật, không phải actor use-case.

## 6. Use-case diagrams

- Full diagram: `docs/diagrams/usecase-full-simplified.puml`.
- Selected diagram: `docs/diagrams/usecase-selected.puml`.
- Actor mapping chính: Member đặt mục tiêu/xem lịch/gia hạn gói; Trainer tạo lịch và đánh giá; Admin quản lý hồ sơ, Trainer, subscription, sự kiện và có quyền hỗ trợ một số thao tác qua API.

## 7. Tóm tắt 5 use case chọn lọc

| ID | Tên | Actor chính | Trách nhiệm |
|---|---|---|---|
| UC01 | Quản lý hội viên | Admin | Tạo/cập nhật/xóa hồ sơ, phân công Trainer, xử lý referral khi tạo hội viên. |
| UC02 | Đăng ký/gia hạn gói tập | Member | Chọn gói 3/6/12 tháng; hệ thống tính loyal/referral bonus. |
| UC03 | Tạo buổi tập | Trainer | Tạo lịch cho Member được phân công theo rule giờ và sức chứa. |
| UC04 | Xem lịch cá nhân | Member | Xem lịch đã được Trainer hoặc Admin tạo cho chính mình. |
| UC05 | Đánh giá tháng | Trainer | Đánh giá Member được phân công dựa trên cân nặng, BMI và mục tiêu tập luyện. |

Chi tiết nằm tại `docs/reports/use-case-specifications.md`.

## 8. Relational schema

Schema chính có các bảng: `users`, `trainers`, `members`, `training_goals`, `subscriptions`, `training_sessions`, `session_members`, `monthly_evaluations`, `events`. Diagram chi tiết nằm tại `docs/diagrams/relational-schema.puml`; diagram rút gọn nằm tại `docs/diagrams/relational-schema-simplified.puml`.

## 9. Kiến trúc hệ thống

RubyGYM dùng React cho giao diện, Express cho REST API, MySQL cho dữ liệu nghiệp vụ. Frontend gọi API qua Axios. Backend gom route theo resource: auth, trainers, members, goals, schedule, subscriptions, evaluations, events. Docker Compose chạy 3 service: database, backend, frontend.

## 10. Tính năng đã triển khai

- Đăng ký, đăng nhập, JWT auth và role-based routing.
- Quản lý Trainer/Member ở backend; UI quản trị demo-ready.
- Member chọn Trainer lúc đăng ký; Admin có thể phân công Trainer.
- Trainer xem danh sách Member được phân công.
- Member đặt/cập nhật mục tiêu tập luyện.
- Trainer tạo lịch tập và xem mục tiêu Member khi đánh giá.
- Member xem lịch cá nhân và kết quả đánh giá.
- Subscription 3/6/12 tháng với loyal/referral bonus.
- Public events và Admin event routes.

## 11. Backend API overview

| Module | Route chính | Vai trò |
|---|---|---|
| Auth | `/api/auth` | Đăng ký, đăng nhập, lấy profile hiện tại. |
| Trainers | `/api/trainers` | Danh sách, CRUD, danh sách client của Trainer. |
| Members | `/api/members` | CRUD hội viên, profile, referral. |
| Goals | `/api/goals` | Member lưu mục tiêu; Trainer hoặc Admin xem mục tiêu hợp lệ. |
| Schedule | `/api/schedule` | Tạo/cập nhật/xóa buổi tập, xem lịch Trainer/Member. |
| Subscriptions | `/api/subscriptions` | Gói tập, gia hạn, loyal/referral bonus. |
| Evaluations | `/api/evaluations` | Đánh giá tháng và xem tiến độ. |
| Events | `/api/events` | Event công khai và Admin CRUD. |

## 12. Frontend UI overview

Frontend có layout công khai và workspace theo role. Admin có dashboard, Trainer/Member/Membership/Event screens. Trainer có lịch tập, học viên, đánh giá tháng. Member có dashboard, lịch cá nhân, mục tiêu, kết quả, gói tập và referral. UI có loading, toast, empty states và fallback data để demo khi backend chưa chạy.

## 13. Database design

`users` lưu tài khoản và role. `trainers`/`members` mở rộng hồ sơ theo role. `training_goals` là bảng 1-1 với Member. `training_sessions` và `session_members` mô hình hóa quan hệ nhiều-nhiều giữa session và Member. `monthly_evaluations` có unique key theo Member/tháng. `subscriptions` lưu gói tập và ngày hiệu lực. `events` lưu thông tin sự kiện công khai.

## 14. Business rules implementation

- Session tối đa 2 giờ.
- Chỉ được tạo trong 05:00-11:30 hoặc 13:30-20:00.
- Không có session trong giờ nghỉ trưa 11:30-13:30.
- Trainer tối đa 8 giờ/ngày.
- Một session tối đa 3 Member.
- Member tối đa 3 session/ngày và tối đa 1 session cho mỗi khung sáng/chiều/tối.
- Không trùng lịch Trainer hoặc Member.
- Trainer chỉ tạo/đánh giá Member được phân công.
- Loyal annual renewal cộng 3 tháng.
- Referral cộng 1 tháng ngay vào subscription active hoặc lưu pending cho lần đăng ký kế tiếp.
- Member tự đặt mục tiêu; Trainer dùng mục tiêu đó khi đánh giá.

## 15. Testing/build summary

Kết quả hiện tại:

| Khu vực | Lệnh | Kết quả |
|---|---|---|
| Backend | `npm test -- --runInBand` | Passed, 6 suites / 25 tests. |
| Frontend test | `CI=true npm test -- --watchAll=false` | Passed, 1 suite / 1 test. |
| Frontend build | `npm run build` | Passed, production build created. |
| Docker config/build | Xem `docs/reports/final-test-build-evidence.md` | Cập nhật theo lần chạy cuối. |

## 16. Requirement traceability summary

Kết quả traceability cuối: 21 yêu cầu Implemented, 1 yêu cầu Partial. Yêu cầu partial là quản lý Trainer ở frontend còn local-first ở một số thao tác, trong khi backend CRUD đã có.

## 17. Demo guide

1. Chạy Docker hoặc chạy backend/frontend local.
2. Đăng nhập Admin bằng `admin@rubygym.com` / `admin123` để xem hội viên, Trainer, subscription, events.
3. Đăng nhập Trainer bằng `trainer.linh@rubygym.com` / `trainer123` để xem học viên, tạo session và tạo evaluation.
4. Đăng nhập Member bằng `member.an@rubygym.com` / `member123` để cập nhật mục tiêu, xem lịch cá nhân, xem kết quả và gia hạn gói.
5. Mở trang public để xem thông tin gym và events.

## 18. Hạn chế

- Không có thanh toán trực tuyến.
- Member không tự đăng ký vào buổi tập.
- Một số UI quản trị vẫn cần tích hợp backend đầy đủ hơn.
- Chưa có báo cáo doanh thu và analytics nâng cao.
- PlantUML CLI cục bộ không có sẵn; PNG đã được render bằng Docker image `plantuml/plantuml`.

## 19. Cải tiến tương lai

- Hoàn thiện CRUD frontend gọi backend cho toàn bộ Admin screens.
- Thêm kiểm thử integration với MySQL thật.
- Thêm báo cáo doanh thu, hiệu suất Trainer và retention Member.
- Thêm phân quyền chi tiết hơn và audit log.
- Thêm CI/CD security pipeline cho Goal 2.

## 20. Kết luận

RubyGYM hiện đáp ứng phần lớn yêu cầu nghiệp vụ ban đầu và đủ demo cuối kỳ. Hệ thống có backend rule enforcement rõ ràng, frontend role-based, database phản ánh nghiệp vụ chính, tài liệu use case/schema/traceability/test evidence đầy đủ và không claim các tính năng ngoài phạm vi như online payment hoặc Member self-registration vào buổi tập.
