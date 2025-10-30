# 🐳 Docker Deployment Guide

## Yêu cầu
- Docker Desktop hoặc Docker Engine
- Docker Compose

## Cách chạy với Docker Compose (Khuyến nghị)

### 1. Build và chạy tất cả services
```bash
docker-compose up -d
```

### 2. Xem logs
```bash
docker-compose logs -f
```

### 3. Dừng services
```bash
docker-compose down
```

### 4. Dừng và xóa volumes (xóa dữ liệu)
```bash
docker-compose down -v
```

## Cách chạy riêng lẻ

### Build Docker image
```bash
docker build -t recipe-app .
```

### Chạy MongoDB
```bash
docker run -d \
  --name recipe-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=adminpassword \
  mongo:7.0
```

### Chạy App
```bash
docker run -d \
  --name recipe-app \
  -p 3000:3000 \
  -e MONGODB_URI=mongodb://admin:adminpassword@host.docker.internal:27017/recipe?authSource=admin \
  recipe-app
```

## Truy cập ứng dụng

- **Web App**: http://localhost:3000
- **MongoDB**: mongodb://localhost:27017

## Troubleshooting

### Xem logs của container
```bash
docker logs recipe-app -f
```

### Vào shell của container
```bash
docker exec -it recipe-app sh
```

### Rebuild sau khi thay đổi code
```bash
docker-compose up -d --build
```

### Xóa tất cả và bắt đầu lại
```bash
docker-compose down -v
docker-compose up -d --build
```

## Cấu trúc

- `Dockerfile` - Build Next.js app
- `docker-compose.yml` - Orchestration (App + MongoDB)
- `mongo-init.js` - MongoDB initialization script
- `.dockerignore` - Files to exclude from Docker build

## Lưu ý

- Dữ liệu MongoDB được lưu trong Docker volume `mongodb_data`
- App chạy ở port 3000, MongoDB ở port 27017
- Tài khoản admin mặc định: admin@recipe.com / admin123
