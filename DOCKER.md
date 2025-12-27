# Docker Deployment Guide

## 🐳 Chạy ứng dụng với Docker

### Yêu cầu
- Docker Desktop đã cài đặt
- Docker Compose
- MongoDB Atlas account (hoặc MongoDB server có sẵn)

### Bước 1: Cấu hình MongoDB Atlas

Cập nhật MongoDB connection string trong:
- `.env.local`: `MONGODB_URI`
- `backend/.env`: `MONGODB_URI` (nếu dùng backend)

### Bước 2: Build và chạy tất cả services

```bash
# Tại thư mục gốc của project
docker-compose up -d --build
```

Lệnh này sẽ:
- ✅ Build và chạy Frontend (port 3001)
- ✅ Build và chạy Backend API (port 5000) - optional

### Bước 3: Kiểm tra services đang chạy

```bash
docker-compose ps
```

### Bước 4: Xem logs

```bash
# Xem tất cả logs
docker-compose logs -f

# Xem logs từng service
docker-compose logs -f frontend
docker-compose logs -f backend
```

### Bước 5: Truy cập ứng dụng

- 🌐 Frontend: http://localhost:3001
- 🔧 Backend API: http://localhost:5000 (optional)
- 🗄️ MongoDB: MongoDB Atlas (cloud)

### Dừng và xóa containers

```bash
# Dừng tất cả services
docker-compose down

# Rebuild lại từ đầu
docker-compose up -d --build
```

## 📦 Cấu trúc Docker

```
recipe/
├── docker-compose.yml          # Orchestrate frontend + backend
├── Dockerfile                  # Frontend (Next.js standalone)
├── .dockerignore              # Ignore files khi build frontend
└── backend/
    ├── Dockerfile.backend     # Backend (Express.js)
    └── .dockerignore         # Ignore files khi build backend
```

## 🔧 Services

### 1. Frontend (frontend)
- Build từ: ./Dockerfile
- Port: 3001
- Env: Production
- Standalone Next.js build
- Features:
  - ✅ External image support (remotePatterns)
  - ✅ Server-side rendering
  - ✅ API routes (MongoDB direct)
  - ✅ Static optimization
  - ✅ Like/Save real-time updates

### 2. Backend API (backend) - Optional
- Build từ: ./backend/Dockerfile.backend
- Port: 5000
- Env: Production
- Kết nối: MongoDB Atlas Cloud

## ⚡ Tips

### Rebuild một service cụ thể
```bash
docker-compose up -d --build frontend
docker-compose up -d --build backend
```

### Xem resource usage
```bash
docker stats
```

### Truy cập vào container
```bash
docker exec -it recipe-frontend sh
docker exec -it recipe-backend sh
```

### Clear tất cả và rebuild
```bash
docker-compose down
docker system prune -a
docker-compose up -d --build
```

## 🔒 Production Notes

Khi deploy production, nhớ:
1. ✅ Sử dụng MongoDB Atlas với proper credentials
2. ✅ Thay đổi JWT_SECRET trong environment variables
3. ✅ Cập nhật SMTP credentials (nếu dùng email features)
4. ✅ Set proper CORS origins trong backend
5. ✅ Enable HTTPS/SSL cho domain thật
6. ✅ Sử dụng environment variables thay vì hardcode
7. ✅ Set NODE_ENV=production
8. ✅ Configure next.config.mjs với domain images cho phép

## 🐛 Troubleshooting

### Port đã được sử dụng
```bash
# Windows
netstat -ano | findstr :3001
netstat -ano | findstr :5000

# Kill process nếu cần
taskkill /PID <PID> /F

# Hoặc thay đổi port trong docker-compose.yml
```

### Container không start
```bash
docker-compose logs backend
docker-compose logs frontend

# Kiểm tra chi tiết
docker inspect recipe-backend
docker inspect recipe-frontend
```

### MongoDB Atlas connection failed
```bash
# Kiểm tra MongoDB URI trong logs
docker-compose logs frontend | grep "MongoDB"

# Verify environment variables
docker exec -it recipe-frontend printenv | grep MONGODB
```

### Like/Save không hoạt động
- ✅ Đã fix: Token được lưu trong Zustand store
- ✅ Verify: Đăng xuất và đăng nhập lại
- ✅ Check: Browser console để xem API errors

## 📝 Environment Variables

### Frontend (.env.local)
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/goiymonan
JWT_SECRET=your_secret_key_min_32_chars
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend (.env) - Optional
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/goiymonan
JWT_SECRET=same_as_frontend
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```
