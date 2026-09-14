# RubyGYM Diagrams

Bộ sơ đồ UML/ERD cho Project 12 (Công nghệ phần mềm). Các sơ đồ phải được giữ đồng bộ với requirement và quyết định kiến trúc trong [`../software-engineering-plan.md`](../software-engineering-plan.md) và [`../architecture-decisions.md`](../architecture-decisions.md).

## Danh mục

| File | Loại | Nội dung |
| --- | --- | --- |
| `usecase.puml` | Use case tổng quát | Chức năng theo 4 actor Guest / Member / Trainer / Admin |
| `usecase-full.puml` / `usecase-full-simplified.puml` | Use case đầy đủ | Bản chi tiết; thể hiện ownership của training goal |
| `usecase-selected.puml` | Use case chọn lọc | Các use case trọng tâm phục vụ bài nộp |
| `class.puml` | Class diagram | Domain entities và quan hệ chính |
| `relational-schema.puml` / `relational-schema-simplified.puml` | ERD | Schema quan hệ đồng bộ với `docker/init.sql` |
| `sequence-login.puml` | Sequence | Login + JWT |
| `sequence-onboarding.puml` | Sequence | Onboarding: body metrics + package + trainer preference |
| `sequence-set-goal.puml` | Sequence | Member tự đặt training goal |
| `sequence-create-session.puml` | Sequence | Tạo buổi tập và các scheduling constraints |
| `sequence-monthly-evaluation.puml` | Sequence | Trainer đánh giá tiến độ dựa trên goal của member |
| `sequence-subscription-renewal.puml` | Sequence | Gia hạn, loyalty bonus và referral bonus |
| `activity-registration.puml` | Activity | Registration → onboarding → set goal |

## Render PlantUML

```bash
# Cách 1: PlantUML jar
java -jar plantuml.jar docs/diagrams/*.puml

# Cách 2: Docker
docker run --rm \
  -v "$PWD/docs/diagrams:/work" \
  -w /work \
  plantuml/plantuml "*.puml"
```

Có thể dùng extension PlantUML cho VS Code/IntelliJ để preview trong lúc chỉnh sửa.

## Maintenance rule

Khi thay đổi actor, ownership, domain relationship hoặc business flow, cập nhật `.puml` liên quan trong cùng pull request. File PNG là bản render để đọc nhanh; `.puml` mới là source of truth.
