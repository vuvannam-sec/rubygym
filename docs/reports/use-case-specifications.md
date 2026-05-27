# Đặc tả Use Case chọn lọc - RubyGYM

Tài liệu này đặc tả 5 use case quan trọng nhất cho bản nộp cuối môn Công nghệ phần mềm. Actor hợp lệ chỉ gồm Guest, Member, Trainer và Admin. Frontend, Backend, Database, MySQL, Docker không phải actor. Hệ thống không triển khai thanh toán trực tuyến và không cho Member tự đăng ký vào buổi tập.

## UC01 - Quản lý hội viên

| Mục | Nội dung |
|---|---|
| ID | UC01 |
| Tên | Quản lý hội viên |
| Actor chính | Admin |
| Actor hỗ trợ | Không có |
| Đối tượng dữ liệu liên quan | Member, Trainer |
| Mục tiêu | Admin tạo, xem, cập nhật, xóa hồ sơ hội viên và phân công Trainer phụ trách khi cần. |
| Tiền điều kiện | Admin đã đăng nhập. Trainer được phân công phải tồn tại nếu Admin chọn `trainer_id`. |
| Kích hoạt | Admin mở màn hình quản lý hội viên hoặc gọi API quản lý hội viên. |

### Luồng cơ bản

| Bước | Mô tả |
|---:|---|
| 1 | Admin yêu cầu xem danh sách hội viên. |
| 2 | Hệ thống kiểm tra JWT và role `ADMIN`. |
| 3 | Hệ thống đọc bảng `members`, `users`, `trainers` và trả danh sách hội viên. |
| 4 | Admin chọn tạo, cập nhật hoặc xóa hồ sơ hội viên. |
| 5 | Hệ thống kiểm tra email trùng, Trainer tồn tại và Member giới thiệu tồn tại nếu có. |
| 6 | Hệ thống lưu thông tin vào `users` và `members`. |
| 7 | Nếu có `referred_by`, hệ thống cộng 1 tháng referral vào subscription active của người giới thiệu hoặc lưu vào `pending_bonus_months`. |
| 8 | Hệ thống trả kết quả thành công. |

### Luồng thay thế/ngoại lệ

| Mã | Tại bước | Điều kiện | Xử lý | Kết thúc |
|---|---:|---|---|---|
| A1 | 2 | Người dùng không phải Admin | Trả `403 Access denied`. | Use case kết thúc. |
| A2 | 5 | Email đã tồn tại | Trả lỗi `Duplicate email`. | Quay lại bước 4. |
| A3 | 5 | Trainer không tồn tại | Trả lỗi `Trainer not found`. | Quay lại bước 4. |
| A4 | 5 | Member giới thiệu không tồn tại | Trả lỗi `Referrer member not found`. | Quay lại bước 4. |
| A5 | 4 | Admin xóa hội viên | Hệ thống xóa dữ liệu phụ thuộc trong `training_goals`, `session_members`, `monthly_evaluations`, `subscriptions`, sau đó xóa `members` và `users`. | Use case kết thúc. |

### Dữ liệu và quy tắc

| Nhóm | Nội dung |
|---|---|
| Dữ liệu vào | `email`, `password`, `full_name`, `phone`, `trainer_id`, `join_date`, `is_loyal`, `referred_by`. |
| Dữ liệu ra | Danh sách hội viên, mã hội viên mới, thông báo cập nhật/xóa. |
| Bảng liên quan | `users`, `members`, `trainers`, `training_goals`, `subscriptions`, `session_members`, `monthly_evaluations`. |
| Backend route | `GET/POST /api/members`, `GET/PUT/DELETE /api/members/:id`, `GET /api/members/:id/referrals`. |
| Frontend | `MemberList.js`, `ReferralPage.js`. |
| Quy tắc nghiệp vụ | Admin là actor quản lý hồ sơ. Member chỉ được xem/cập nhật hồ sơ của chính mình, không quản lý danh sách hội viên. |
| Hậu điều kiện | Hồ sơ hội viên được đồng bộ với bảng `users` và `members`; phân công Trainer được lưu nếu có. |

## UC02 - Đăng ký hoặc gia hạn gói tập

| Mục | Nội dung |
|---|---|
| ID | UC02 |
| Tên | Đăng ký hoặc gia hạn gói tập |
| Actor chính | Member hoặc Admin |
| Actor hỗ trợ | Không có |
| Mục tiêu | Member hoặc Admin tạo/gia hạn subscription 3 tháng, 6 tháng hoặc 1 năm; hệ thống cộng tháng miễn phí khi đủ điều kiện. |
| Tiền điều kiện | Người dùng đã đăng nhập. Member chỉ thao tác subscription của chính mình. |
| Kích hoạt | Member chọn gói tập trên màn hình gói tập, hoặc Admin quản lý subscription qua API/UI quản trị. |

### Luồng cơ bản

| Bước | Mô tả |
|---:|---|
| 1 | Actor chọn `plan_type` gồm `QUARTERLY`, `SEMI_ANNUAL` hoặc `ANNUAL` và `start_date`. |
| 2 | Hệ thống kiểm tra quyền truy cập subscription. |
| 3 | Hệ thống đọc `members` để xác định `join_date`, `is_loyal`, `pending_bonus_months`. |
| 4 | Hệ thống xác định đây có phải lần gia hạn hay không bằng cách kiểm tra subscription hiện có. |
| 5 | Hệ thống tính thời hạn cơ bản: 3, 6 hoặc 12 tháng. |
| 6 | Nếu Member loyal, đang gia hạn và chọn gói 1 năm, hệ thống cộng 3 tháng loyal bonus. |
| 7 | Nếu Member có `pending_bonus_months`, hệ thống cộng số tháng referral đang chờ và đặt lại pending về 0 sau khi tạo subscription. |
| 8 | Hệ thống lưu `subscriptions` với `end_date`, `is_free_extension`, `status`. |
| 9 | Hệ thống trả thông tin ngày hết hạn mới và số tháng bonus đã áp dụng. |

### Luồng thay thế/ngoại lệ

| Mã | Tại bước | Điều kiện | Xử lý | Kết thúc |
|---|---:|---|---|---|
| A1 | 2 | Trainer cố tạo subscription | Trả `403 Access denied`. | Use case kết thúc. |
| A2 | 2 | Member tạo subscription cho Member khác | Trả `403 Access denied`. | Use case kết thúc. |
| A3 | 3 | Member không tồn tại | Trả `400 Member not found`. | Use case kết thúc. |
| A4 | 5 | `plan_type` không hợp lệ | Trả `400 Invalid plan type`. | Quay lại bước 1. |
| A5 | 6 | Member không loyal, không phải renewal hoặc không chọn gói 1 năm | Không cộng 3 tháng loyal bonus. | Tiếp tục bước 7. |

### Dữ liệu và quy tắc

| Nhóm | Nội dung |
|---|---|
| Dữ liệu vào | `member_id`, `plan_type`, `start_date`, `status` khi cập nhật. |
| Dữ liệu ra | `subscriptionId`, `end_date`, `free_extension_months`, `referral_bonus_months`, `is_loyal`, `is_renewal`. |
| Bảng liên quan | `members`, `subscriptions`. |
| Backend route | `GET/POST /api/subscriptions`, `GET/PUT/DELETE /api/subscriptions/:id`. |
| Frontend | `PlanSelector.js`, `SubscriptionStatus.js`. |
| Quy tắc nghiệp vụ | Gói hợp lệ chỉ gồm 3 tháng, 6 tháng, 1 năm. Loyal bonus chỉ áp dụng cho hội viên đã tập hơn 1 năm, đã có subscription trước đó và gia hạn gói 1 năm. Referral bonus được cộng vào thời hạn subscription. Thanh toán trực tuyến không thuộc phạm vi use case này. |
| Hậu điều kiện | Subscription được lưu; ngày hết hạn phản ánh tháng cơ bản và tháng miễn phí hợp lệ. |

## UC03 - Tạo buổi tập

| Mục | Nội dung |
|---|---|
| ID | UC03 |
| Tên | Tạo buổi tập |
| Actor chính | Trainer hoặc Admin |
| Actor hỗ trợ | Không có |
| Mục tiêu | Trainer hoặc Admin tạo buổi tập cho các Member được phân công với cùng quy tắc kiểm tra. |
| Tiền điều kiện | Trainer hoặc Admin đã đăng nhập. Member trong buổi tập phải thuộc Trainer được chọn. |
| Kích hoạt | Trainer hoặc Admin mở màn hình lịch tập và gửi biểu mẫu tạo buổi tập. |

### Luồng cơ bản

| Bước | Mô tả |
|---:|---|
| 1 | Actor nhập `trainer_id`, `session_date`, `start_time`, `end_time`, `session_type`, `member_ids`. |
| 2 | Hệ thống kiểm tra actor là `TRAINER` hoặc `ADMIN`. |
| 3 | Nếu actor là Trainer, hệ thống kiểm tra `trainer_id` có phải Trainer của chính actor không. |
| 4 | Hệ thống kiểm tra thời lượng buổi tập lớn hơn 0 và không quá 120 phút. |
| 5 | Hệ thống kiểm tra thời gian nằm trong 05:00-11:30 hoặc 13:30-20:00. |
| 6 | Hệ thống kiểm tra không trùng lịch Trainer. |
| 7 | Hệ thống kiểm tra tổng giờ làm Trainer trong ngày không vượt 480 phút. |
| 8 | Hệ thống kiểm tra tối đa 3 Member trong một buổi. |
| 9 | Hệ thống kiểm tra tất cả Member thuộc Trainer được chọn. |
| 10 | Hệ thống kiểm tra mỗi Member không quá 3 buổi/ngày, không quá 1 buổi trong mỗi khung sáng/chiều/tối, và không bị trùng giờ. |
| 11 | Hệ thống lưu `training_sessions` và `session_members`. |
| 12 | Hệ thống trả mã buổi tập mới. |

### Luồng thay thế/ngoại lệ

| Mã | Tại bước | Điều kiện | Xử lý | Kết thúc |
|---|---:|---|---|---|
| A1 | 2 | Actor không phải Trainer hoặc Admin | Trả `403 Access denied`. | Use case kết thúc. |
| A2 | 3 | Trainer tạo lịch cho Trainer khác | Trả `403 Access denied`. | Use case kết thúc. |
| A3 | 4 | Thời lượng hơn 2 giờ hoặc giờ kết thúc trước giờ bắt đầu | Trả lỗi rule lịch. | Quay lại bước 1. |
| A4 | 5 | Buổi tập rơi vào giờ nghỉ trưa hoặc ngoài giờ hoạt động | Trả `Session must be within operating hours`. | Quay lại bước 1. |
| A5 | 6 | Trainer đã có buổi trùng giờ | Trả lỗi trùng lịch Trainer. | Quay lại bước 1. |
| A6 | 7 | Tổng giờ Trainer vượt 8 giờ/ngày | Trả lỗi giới hạn 8 giờ. | Quay lại bước 1. |
| A7 | 8 | Nhiều hơn 3 Member trong buổi | Trả lỗi tối đa 3 Member. | Quay lại bước 1. |
| A8 | 9 | Member không thuộc Trainer được chọn | Trả `Member must belong to the selected trainer`. | Quay lại bước 1. |
| A9 | 10 | Member bị trùng lịch hoặc quá số buổi/ngày/khung | Trả lỗi rule lịch của Member. | Quay lại bước 1. |

### Dữ liệu và quy tắc

| Nhóm | Nội dung |
|---|---|
| Dữ liệu vào | `trainer_id`, `session_date`, `start_time`, `end_time`, `session_type`, `member_ids`. |
| Dữ liệu ra | `sessionId`, thông tin lịch của Trainer hoặc Member. |
| Bảng liên quan | `training_sessions`, `session_members`, `trainers`, `members`, `users`. |
| Backend route | `POST /api/schedule`, `PUT /api/schedule/:id`, `GET /api/schedule/trainer/:trainerId`. |
| Frontend | `ScheduleView.js`, `CreateSession.js`. |
| Quy tắc nghiệp vụ | Không có buổi tập trong 11:30-13:30. Trainer tối đa 8 giờ/ngày. Một buổi tối đa 2 giờ và tối đa 3 Member. Member không phải actor của UC03 và không tự đăng ký vào buổi tập. |
| Hậu điều kiện | Buổi tập được lưu và có thể hiển thị trong lịch của Trainer hoặc Member. |

## UC04 - Xem lịch tập cá nhân

| Mục | Nội dung |
|---|---|
| ID | UC04 |
| Tên | Xem lịch tập cá nhân |
| Actor chính | Member |
| Actor hỗ trợ | Không có |
| Mục tiêu | Member xem lịch tập được Trainer hoặc Admin gán cho chính mình. |
| Tiền điều kiện | Member đã đăng nhập và có `member_id`. |
| Kích hoạt | Member mở trang lịch tập cá nhân. |

### Luồng cơ bản

| Bước | Mô tả |
|---:|---|
| 1 | Member yêu cầu xem `/api/schedule/member/:memberId`. |
| 2 | Hệ thống kiểm tra JWT và xác định Member hiện tại. |
| 3 | Hệ thống kiểm tra `memberId` trên URL có trùng với Member hiện tại không. |
| 4 | Hệ thống đọc `training_sessions`, `session_members`, `trainers`, `users`. |
| 5 | Hệ thống trả danh sách buổi tập theo ngày và giờ. |
| 6 | Hệ thống hiển thị lịch dạng tuần và bảng chi tiết. |

### Luồng thay thế/ngoại lệ

| Mã | Tại bước | Điều kiện | Xử lý | Kết thúc |
|---|---:|---|---|---|
| A1 | 2 | Chưa đăng nhập | Trả `401 No token provided`. | Use case kết thúc. |
| A2 | 3 | Member yêu cầu lịch của Member khác | Trả `403 Access denied`. | Use case kết thúc. |
| A3 | 4 | Chưa có buổi tập nào | Trả danh sách rỗng; UI hiển thị empty state. | Use case kết thúc. |

### Dữ liệu và quy tắc

| Nhóm | Nội dung |
|---|---|
| Dữ liệu vào | JWT, `memberId`. |
| Dữ liệu ra | `session_date`, `start_time`, `end_time`, `session_type`, `trainer_name`. |
| Bảng liên quan | `training_sessions`, `session_members`, `members`, `trainers`, `users`. |
| Backend route | `GET /api/schedule/member/:memberId`, `GET /api/schedule/:id`. |
| Frontend | `ScheduleView.js`. |
| Quy tắc nghiệp vụ | Member chỉ xem lịch đã được gán; không thêm buổi tập trong use case này. Trainer hoặc Admin có route riêng cho lịch Trainer hoặc chi tiết buổi được phép truy cập. |
| Hậu điều kiện | Không thay đổi dữ liệu; lịch cá nhân được hiển thị cho đúng Member. |

## UC05 - Đánh giá tháng

| Mục | Nội dung |
|---|---|
| ID | UC05 |
| Tên | Đánh giá tháng |
| Actor chính | Trainer hoặc Admin |
| Actor hỗ trợ | Không có |
| Mục tiêu | Trainer hoặc Admin đánh giá Member được phân công theo tháng dựa trên cân nặng, BMI và mục tiêu tập luyện đã lưu. |
| Tiền điều kiện | Trainer hoặc Admin đã đăng nhập. Member thuộc danh sách khách hàng của Trainer được chọn. Mỗi Member chỉ có một đánh giá cho một tháng. |
| Kích hoạt | Trainer hoặc Admin mở màn hình đánh giá tháng và chọn Member. |

### Luồng cơ bản

| Bước | Mô tả |
|---:|---|
| 1 | Trainer hoặc Admin tải danh sách khách hàng được phân công. |
| 2 | Hệ thống trả thông tin Member kèm `training_goals` nếu đã có. |
| 3 | Trainer hoặc Admin chọn Member và tháng đánh giá. |
| 4 | Hệ thống tự điền target weight/BMI từ mục tiêu hiện tại nếu có. |
| 5 | Trainer hoặc Admin nhập cân nặng thực tế, BMI thực tế và ghi chú. |
| 6 | Hệ thống kiểm tra Trainer được chọn chỉ đánh giá Member của mình. |
| 7 | Hệ thống kiểm tra chưa có đánh giá cho cùng Member và tháng. |
| 8 | Hệ thống lưu `monthly_evaluations`. |
| 9 | Hệ thống trả kết quả, gồm `weight_progress` và `bmi_progress` khi xem danh sách/chi tiết. |

### Luồng thay thế/ngoại lệ

| Mã | Tại bước | Điều kiện | Xử lý | Kết thúc |
|---|---:|---|---|---|
| A1 | 1 | Người dùng không phải Trainer hoặc Admin khi tạo đánh giá | Trả `403 Access denied`. | Use case kết thúc. |
| A2 | 6 | Member không thuộc Trainer được chọn | Trả `Trainer can only evaluate their own clients`. | Use case kết thúc. |
| A3 | 7 | Đã có đánh giá cho tháng đó | Trả `Monthly evaluation already exists for this member`. | Quay lại bước 3. |
| A4a | 4 | Không có mục tiêu đã lưu và Trainer hoặc Admin không nhập target | Hệ thống yêu cầu nhập target weight/BMI. | Quay lại bước 5. |
| A4b | 5 | Thiếu actual weight/BMI | Hệ thống yêu cầu nhập chỉ số thực tế. | Quay lại bước 5. |

### Dữ liệu và quy tắc

| Nhóm | Nội dung |
|---|---|
| Dữ liệu vào | `member_id`, `trainer_id`, `month_year`, `target_weight`, `actual_weight`, `target_bmi`, `actual_bmi`, `notes`. |
| Dữ liệu ra | Đánh giá tháng, tiến độ cân nặng/BMI, ghi chú Trainer. |
| Bảng liên quan | `monthly_evaluations`, `training_goals`, `members`, `trainers`, `users`. |
| Backend route | `GET/POST /api/evaluations`, `GET/PUT/DELETE /api/evaluations/:id`, `GET/PUT /api/goals/me`, `GET /api/goals/member/:memberId`. |
| Frontend | `EvaluationForm.js`, `EvaluationList.js`, `TrainingGoals.js`, `MyMembersPage.js`. |
| Quy tắc nghiệp vụ | Member tự đặt/cập nhật mục tiêu. Trainer hoặc Admin dùng mục tiêu đó khi đánh giá, nhưng không tự ý sửa mục tiêu của Member. Member chỉ xem kết quả đánh giá trong use case xem kết quả, không thực hiện đánh giá. Mỗi Member chỉ có một evaluation trong một tháng. |
| Hậu điều kiện | Đánh giá tháng được lưu; Member có thể xem nhận xét và tiến độ của chính mình trong use case xem kết quả. |
