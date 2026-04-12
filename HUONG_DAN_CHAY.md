# Hướng dẫn chạy RubyGYM

## Yêu cầu

- Cài `Docker Desktop`
- Bật Docker trước khi chạy

## Chạy bằng Docker Compose

Mở terminal tại thư mục gốc `rubygym` rồi chạy:

```powershell
docker-compose up -d --build
```

Sau khi chạy xong, hệ thống sẽ có 3 service:

- `db`: MySQL
- `backend`: API Node.js/Express
- `frontend`: React build qua Nginx

## Kiểm tra service

Xem trạng thái container:

```powershell
docker-compose ps
```

Kiểm tra API backend:

```powershell
Invoke-RestMethod http://localhost:3000/api/health | ConvertTo-Json -Compress
```

Kết quả mong đợi:

```json
{"status":"ok","service":"rubygym-api"}
```

## Truy cập ứng dụng

- Frontend: [http://localhost](http://localhost)
- Backend API: [http://localhost:3000](http://localhost:3000)
- Health check: [http://localhost:3000/api/health](http://localhost:3000/api/health)
- MySQL: `localhost:3306`

## Tài khoản demo

- Admin: `admin@rubygym.com / admin123`
- Trainer: `trainer@rubygym.com / trainer123`
- Member: `member@rubygym.com / member123`

## Dừng hệ thống

```powershell
docker-compose down
```

Nếu muốn xóa luôn image build và volume:

```powershell
docker-compose down -v --rmi local
```

## Xem log

Xem toàn bộ log:

```powershell
docker-compose logs -f
```

Xem riêng từng service:

```powershell
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

## Khi code thay đổi

Build lại toàn bộ:

```powershell
docker-compose down
docker-compose up -d --build
```

## Chạy không dùng Docker

### Backend

```powershell
cd backend
npm install
npm test
npm start
```

### Frontend

```powershell
cd frontend
npm install
npm run build
npm start
```

## Lỗi thường gặp

### Docker chưa bật

Nếu `docker-compose` báo không kết nối được daemon, hãy mở `Docker Desktop` rồi chạy lại.

### Port bị chiếm

Nếu `80`, `3000` hoặc `3306` đang bị dùng, hãy tắt ứng dụng đang chiếm port hoặc đổi port trong `docker-compose.yml`.

### Muốn reset database

```powershell
docker-compose down -v
docker-compose up -d --build
```
