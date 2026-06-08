# RubyGYM Diagrams

Bộ sơ đồ UML/ERD cho Project 12 (Công nghệ phần mềm), đã đồng bộ với mã nguồn sau đợt refactor (xem `../reports/architecture-decisions.md`).

## Danh mục

| File | Loại | Nội dung |
|---|---|---|
| `usecase.puml` | Use case (tổng quát) | Toàn bộ chức năng theo 4 actor Guest/Member/Trainer/Admin. "Set Training Goals" thuộc **Member**. |
| `usecase-full.puml` / `usecase-full-simplified.puml` | Use case (đầy đủ) | Bản chi tiết; ghi rõ Trainer **không** sửa mục tiêu của Member. |
| `usecase-selected.puml` | Use case (chọn lọc) | 6 use case trọng tâm để nộp: quản lý hội viên, đăng ký/gia hạn, tạo buổi tập, xem lịch, đánh giá tháng, **đặt mục tiêu (Member)**. |
| `class.puml` | Class diagram | Gồm `TrainingGoal` (Member sở hữu/sets, Trainer read-only). |
| `relational-schema.puml` / `relational-schema-simplified.puml` | ERD | Khớp `docker/init.sql` (training_goals UNIQUE member_id, monthly_evaluations UNIQUE member+month). |
| `sequence-login.puml` | Sequence | Đăng nhập + JWT. |
| `sequence-onboarding.puml` | Sequence | Onboarding = metrics + gói + HLV (KHÔNG ghi goal — ADR-002). |
| `sequence-set-goal.puml` | Sequence | Member tự đặt mục tiêu; Trainer/Admin chỉ đọc (ADR-001). |
| `sequence-create-session.puml` | Sequence | Tạo buổi tập + ràng buộc lịch (≤2h, giờ mở cửa, ≤8h/ngày, ≤3 hội viên). |
| `sequence-monthly-evaluation.puml` | Sequence | Đánh giá tháng: HLV nhập actual, target lấy từ goal của Member. |
| `sequence-subscription-renewal.puml` | Sequence | Đăng ký/gia hạn + bonus loyal (3 tháng) + referral (1 tháng/người). |
| `activity-registration.puml` | Activity | Đăng ký → onboarding (metrics+gói+HLV) → đặt mục tiêu (bước riêng). |

## Cách render ra PNG

Máy hiện không cài sẵn PlantUML/Java. Có thể render bằng một trong các cách:

```bash
# 1) PlantUML jar (cần Java + Graphviz)
java -jar plantuml.jar docs/diagrams/*.puml

# 2) Docker (không cần cài Java)
docker run --rm -v "$PWD/docs/diagrams:/work" -w /work plantuml/plantuml "*.puml"
```

Hoặc dùng plugin PlantUML cho VS Code / IntelliJ, hoặc trang web https://www.plantuml.com/plantuml để xem nhanh.
