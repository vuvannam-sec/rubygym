# Hướng Dẫn Chạy RubyGYM

Tài liệu này dùng cho bản nộp cuối của RubyGYM. Hệ thống gồm frontend React, backend Express, MySQL, Docker Compose và workflow GitHub Actions cho Project 2 Security CI.

## 1. Yêu Cầu

- Docker Desktop hoặc Docker Engine có hỗ trợ `docker compose`.
- Node.js 24 nếu chạy backend/frontend trực tiếp ngoài Docker.
- Cổng mặc định chưa bị chiếm: `8080`, `3000`, `3306`.

## 2. Chạy Bằng Docker Compose

Tại thư mục gốc repository:

```bash
docker compose up -d --build
```

Docker Compose tạo 3 service:

- `db`: MySQL 8.0.
- `backend`: API Node.js/Express ở cổng `3000`.
- `frontend`: React build được phục vụ bằng nginx ở cổng `8080`.

Truy cập:

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:3000/api`
- Health check: `http://localhost:3000/api/health`
- MySQL: `localhost:3306`

Kiểm tra trạng thái container:

```bash
docker compose ps
```

Kiểm tra API:

```bash
curl http://localhost:3000/api/health
```

Kết quả mong đợi:

```json
{"status":"ok","service":"rubygym-api"}
```

## 3. Seed Database

Khi database được tạo lần đầu, MySQL tự chạy:

- `docker/init.sql`: tạo schema.
- `docker/seed.sql`: nạp dữ liệu demo.

Tài khoản demo:

- Admin: `admin@rubygym.com` / `admin123`
- Trainer: `trainer.linh@rubygym.com` / `trainer123`
- Member: `member.an@rubygym.com` / `member123`

Reset database và seed lại từ đầu:

```bash
docker compose down -v
docker compose up -d --build
```

## 4. Dừng Và Xem Log

Dừng hệ thống:

```bash
docker compose down
```

Dừng và xóa volume database:

```bash
docker compose down -v
```

Xem log toàn bộ stack:

```bash
docker compose logs -f
```

Xem log từng service:

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

## 5. Chạy Backend Cục Bộ

Cần có MySQL đang chạy. Có thể dùng service `db` từ Docker Compose hoặc MySQL cài trên máy.

Tạo file cấu hình nếu cần:

```bash
cp backend/.env.example backend/.env
```

Chạy backend:

```bash
cd backend
npm ci
npm test
npm run dev
```

Backend mặc định đọc cấu hình:

- `PORT=3000`
- `DB_HOST=localhost`
- `DB_PORT=3306`
- `DB_USER=root`
- `DB_PASSWORD=rubygym123`
- `DB_NAME=rubygym`

## 6. Chạy Frontend Cục Bộ

```bash
cd frontend
npm ci
CI=true npm test -- --watchAll=false
npm run build
npm start
```

Frontend dev server của Create React App thường chạy ở `http://localhost:3000`. Nếu backend cũng dùng cổng `3000`, chọn cổng khác khi được hỏi hoặc chạy frontend sau khi đổi cổng backend.

## 7. Lệnh Kiểm Tra Nhanh

Tại thư mục gốc:

```bash
docker compose config
```

Backend:

```bash
cd backend
npm test
```

Frontend:

```bash
cd frontend
CI=true npm test -- --watchAll=false
npm run build
```

## 8. Lưu Ý Phạm Vi MVP

- RubyGYM hiện không triển khai thanh toán trực tuyến.
- Member chỉ xem lịch được gán; Member không tự đăng ký vào buổi tập.
- Trainer hoặc Admin tạo buổi tập theo rule nghiệp vụ.
- `backend/src/routes/vulnerable-demo.js` chỉ dùng cho phân tích bảo mật Project 2 và không được mount trong API production.
- Frontend vẫn còn audit debt từ Create React App / `react-scripts`; đây là hạn chế đã được ghi trong báo cáo bảo mật.

## 9. Lỗi Thường Gặp

Docker chưa chạy:

```bash
docker compose ps
```

Nếu lệnh báo không kết nối được daemon, hãy mở Docker Desktop hoặc khởi động Docker Engine.

Cổng bị chiếm:

- `8080`: đổi port frontend trong `docker-compose.yml` hoặc tắt ứng dụng đang dùng cổng này.
- `3000`: đổi port backend hoặc tắt tiến trình Node khác.
- `3306`: tắt MySQL cục bộ hoặc đổi port DB trong `docker-compose.yml`.

Database không reset dữ liệu:

```bash
docker compose down -v
docker compose up -d --build
```

Backend không kết nối được MySQL khi chạy local:

- Kiểm tra MySQL đang chạy.
- Kiểm tra `backend/.env` có đúng `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`.
- Nếu dùng MySQL trong Docker Compose, chờ `rubygym-db` healthy trước khi chạy backend local.
