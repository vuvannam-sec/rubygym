# Ảnh cần cung cấp cho RubyGYM (placeholder → ảnh thật)

Giao diện đang dùng **placeholder** cho các ảnh dưới đây. Khi có ảnh thật, đặt đúng **tên file** vào thư mục **`frontend/public/images/`** (giữ nguyên tên). Hệ thống tự nhận qua `frontend/src/services/imageUtils.js` (`imageCatalog`), không cần sửa code.

Tỷ lệ gợi ý: ảnh khối/landscape ~ **16:9 hoặc 4:3, tối thiểu 1200×800px**, JPG nén vừa (~200–500KB). Tông màu nên ăn nhập theme tối + điểm nhấn đỏ ruby (xem bảng màu cuối trang).

## Ảnh còn thiếu (bắt buộc để landing đẹp)

| # | Tên file (đặt vào `frontend/public/images/`) | Dùng ở | Prompt gợi ý (mô tả ảnh) |
|---|---|---|---|
| 1 | `class-hiit.jpg` | Lớp "HIIT đốt mỡ" | Phòng gym hiện đại ánh sáng tối, nhóm 3–4 người tập HIIT cường độ cao (battle rope, box jump), mồ hôi, năng lượng mạnh, điểm nhấn đèn đỏ ruby, góc rộng. |
| 2 | `class-strength.jpg` | Lớp "Strength & Tăng cơ" | Khu tạ free-weight, một người nâng tạ đòn (barbell squat/deadlift) tư thế chuẩn, nền tối, tương phản cao, tông đỏ/than chì. |
| 3 | `class-yoga.jpg` | Lớp "Yoga & Phục hồi" | Phòng tập yên tĩnh ánh sáng dịu, người tập tư thế yoga trên thảm, không khí thư giãn, vẫn giữ tông tối sang trọng, nhấn nhẹ đỏ ruby. |
| 4 | `class-cardio.jpg` | Lớp "Cardio & Sức bền" | Khu cardio với máy chạy/xe đạp/rower, người tập đang chạy, hậu cảnh mờ động, nền tối, đèn đỏ ruby. |
| 5 | `cta-join.jpg` | Dải kêu gọi đăng ký (CTA) | Ảnh truyền cảm hứng: vận động viên quyết tâm trong phòng gym tối, ánh đỏ ruby mạnh, nhiều khoảng tối để đặt chữ trắng đè lên (negative space bên trái). |

## Ảnh tùy chọn (nâng cấp thương hiệu)

| # | Tên file | Dùng ở | Prompt gợi ý |
|---|---|---|---|
| 6 | `logo.png` (nền trong suốt) | Có thể thay logo chữ hiện tại | Logo phòng gym RubyGYM tối giản: chữ "Ruby" đỏ + "GYM" trắng, hoặc biểu tượng viên ruby/tạ cách điệu, nền trong suốt, phẳng (flat). |

> Ảnh **đã có sẵn** và đang dùng tốt (không cần tạo lại): `hero-banner.jpg`, `hero-banner-2.jpg`, `feature-*`, `trainer-male-1/2/3`, `trainer-female-1/2`, `event-*`, `member-*`, `facility-weights/cardio/reception`.

## Bảng màu thương hiệu (đã áp dụng — tham chiếu khi chọn/chỉnh ảnh)

| Vai trò | Mã màu |
|---|---|
| Ruby (điểm nhấn chính) | `#e6314a` |
| Ruby sáng (gradient) | `#ff5f6d` |
| Nền trang (đen pha xanh) | `#0a0d14` |
| Bề mặt thẻ | `#141a25` / `#161d2a` |
| Chữ chính | `#eef2f8` |
| Chữ phụ | `#aab6c8` |

## Cách bàn giao
Khi đã đặt ảnh vào `frontend/public/images/`, chỉ cần báo: "đã đặt ảnh xong" (hoặc cho tôi biết nếu bạn để ở thư mục khác). Nếu muốn đổi tên file, gửi tên mới để tôi cập nhật `imageCatalog`.
