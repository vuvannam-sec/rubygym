# RubyGYM Design System

Tài liệu mô tả hệ thống thiết kế của RubyGYM (xem quyết định ADR-005). Mục tiêu: giao diện nhất quán, dễ bảo trì, mang phong cách một phòng gym thật — nền tối năng động với điểm nhấn ruby.

## 1. Nguồn duy nhất: Design Tokens
Mọi giá trị màu/typography/spacing/radius/shadow được khai báo tập trung trong `frontend/src/styles/tokens.css` dưới dạng biến CSS (`:root`). Component không dùng giá trị cứng mà tham chiếu token, nên đổi theme chỉ sửa một nơi.

Import thứ tự trong `frontend/src/index.js`: `tokens.css` → `index.css` → (App.css qua `App.js`).

## 2. Bảng màu

### Thương hiệu (Ruby)
| Token | Giá trị | Dùng cho |
|---|---|---|
| `--rg-accent` (`--rg-ruby-500`) | `#e6314a` | Màu nhấn chính: nút, link active, highlight |
| `--rg-accent-2` | `#ff5f6d` | Màu phối gradient nút/CTA |
| `--rg-accent-strong` (`--rg-ruby-600`) | `#c81e3a` | Trạng thái hover đậm |
| `--rg-accent-soft` | `rgba(230,49,74,.14)` | Nền nhạt cho badge/active |
| `--rg-accent-glow` | `rgba(230,49,74,.45)` | Bóng phát sáng nút |

### Bề mặt tối
| Token | Giá trị | Dùng cho |
|---|---|---|
| `--rg-bg` | `#0a0d14` | Nền trang |
| `--rg-bg-2` | `#0e121b` | Nền phụ (footer, sidebar gradient) |
| `--rg-surface` | `#141a25` | Thẻ/section chính |
| `--rg-surface-2` | `#1a2230` | Thẻ lồng, input |
| `--rg-surface-3` | `#212b3b` | Lớp sâu hơn |
| `--rg-elevate` | `#161d2a` | Card nổi (metric/panel) |

### Chữ & viền
`--rg-text` `#eef2f8`, `--rg-text-2` `#aab6c8` (muted), `--rg-text-3` `#76839a` (dim), `--rg-heading` `#fff`.
`--rg-border`, `--rg-border-2`, `--rg-border-strong` (đường viền trắng mờ tăng dần).

### Phản hồi (feedback)
`--rg-success` `#34d399`, `--rg-warning` `#fbbf24`, `--rg-danger` `#fb5066`, `--rg-info` `#58a6ff` (mỗi loại có biến `-bg` và `-line` đi kèm).

## 3. Typography
- Font hiển thị (heading): `--rg-font-display` = Poppins → fallback Inter/Segoe UI.
- Font nội dung: `--rg-font` = Inter → fallback Segoe UI/system.
- Nạp qua Google Fonts trong `frontend/public/index.html`.
- Thang cỡ chữ: `--rg-fs-xs..xl`; độ đậm: `--rg-fw-medium/bold/black`.

## 4. Spacing, Radius, Shadow
- Spacing scale 4px: `--rg-space-1..12`.
- Bo góc: `--rg-radius-sm/(base)/lg/xl/pill`.
- Đổ bóng: `--rg-shadow-sm/(base)/lg` và `--rg-shadow-accent` (bóng ruby cho CTA).
- Layout: `--rg-container` `1280px`, `--rg-gutter` `24px`.

## 5. Primitives dùng chung
Các component nền tảng nằm ở `frontend/src/components/Layout/ProductUI.js` và được tạo kiểu bằng class trong `App.css` (đã tham chiếu token): `MetricCard`, `SectionHeader`, `StatusBadge`, `Toast`, `EmptyState`, `LoadingPanel`. Ngoài ra: `.primary-button/.ghost-button/.danger-button`, `.page-card`, `.dashboard-panel`, `.form-grid`, bảng `.table-wrapper`, `.status-badge` (success/warning/neutral/info).

## 6. Quy tắc sử dụng
1. Không hard-code màu/spacing trong component mới — luôn dùng token.
2. Trạng thái màn hình phải có đủ: loading (`LoadingPanel`), empty (`EmptyState`), error (`Toast`/`error-text`).
3. Ảnh dùng qua `MediaAsset` để có fallback nhất quán; nguồn ảnh khai báo ở `services/imageUtils.js` (`imageCatalog`).
4. Đổi theme/branding: chỉ sửa `tokens.css`.
