# Contributing

RubyGYM là đồ án học thuật nên ưu tiên thay đổi nhỏ, có thể kiểm chứng và giữ tài liệu đồng bộ với implementation.

## Development flow

1. Tạo branch từ `main`.
2. Giữ mỗi thay đổi tập trung vào một mục tiêu rõ ràng.
3. Chạy test liên quan trước khi mở pull request.
4. Nếu thay đổi business rule, cập nhật requirement/diagram/traceability tương ứng.
5. Không commit `.env`, key, token, database dump hoặc report scan tạm thời.

## Local setup

```bash
cp .env.example .env
docker compose up -d --build
```

Hoặc chạy backend/frontend riêng theo hướng dẫn trong `README.md`.

## Checks before review

```bash
cd backend && npm test
cd frontend && CI=true npm test -- --watchAll=false
cd .. && docker compose config
```

GitHub Actions sẽ tiếp tục chạy build và các security checks của Project 2.

## Code and documentation expectations

- Authorization phải được kiểm tra ở backend, không dựa vào việc ẩn UI.
- SQL/query input trong application code phải dùng API parameterized phù hợp.
- Không import hoặc mount `backend/src/routes/vulnerable-demo.js` vào runtime.
- Giữ API error messages đủ rõ cho client nhưng không làm lộ secret/internal stack details.
- Requirement mới phải có owner/actor, rule và cách verification rõ ràng.
- Không thêm tài liệu chỉ để “đủ file”; document phải phản ánh trạng thái code hiện tại.

## Pull request scope

PR nên mô tả:

- vấn đề được giải quyết;
- thay đổi chính;
- cách kiểm thử;
- ảnh hưởng tới Project 12 / Project 2 nếu có;
- tài liệu hoặc diagram đã cập nhật.
