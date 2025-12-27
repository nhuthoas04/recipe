# 🍳 Recipe App - Ứng dụng Quản lý Công thức Nấu ăn

## 📋 Giới thiệu

Recipe App là một ứng dụng web toàn diện cho phép người dùng:
- 🔍 Tìm kiếm và duyệt công thức nấu ăn
- 📝 Tạo và chia sẻ công thức của riêng mình
- ❤️ Thích và lưu công thức yêu thích
- 📅 Lập kế hoạch bữa ăn hàng tuần
- 🛒 Tạo danh sách mua sắm tự động
- 💬 Bình luận và đánh giá công thức
- 👤 Quản lý hồ sơ sức khỏe cá nhân
- 🤖 Nhận gợi ý món ăn từ AI theo tình trạng sức khỏe

## 🏗️ Kiến trúc

- **Frontend:** Next.js 15 (App Router) + React 19 + TypeScript
- **Backend:** Express.js + TypeScript (RESTful API - Optional)
- **Database:** MongoDB Atlas (Cloud)
- **Authentication:** JWT + Zustand (persisted token)
- **UI Components:** shadcn/ui + Tailwind CSS
- **State Management:** Zustand
- **Deployment:** Docker + Docker Compose

## 🚀 Cài đặt nhanh

### 🐳 Option 1: Chạy với Docker (Khuyến nghị)

```bash
# Clone repository
git clone https://github.com/nhuthoas04/recipe.git
cd recipe

# Cấu hình MongoDB Atlas connection trong:
# - .env.local
# - backend/.env (optional)

# Build và chạy
docker-compose up -d --build

# Truy cập:
# - Frontend: http://localhost:3001
# - Backend: http://localhost:5000 (optional)
```

📖 Chi tiết: [DOCKER.md](DOCKER.md)

### 💻 Option 2: Chạy Development thủ công

#### 1. Clone repository
```bash
git clone https://github.com/nhuthoas04/recipe.git
cd recipe
```

#### 2. Cài đặt dependencies

```bash
# Frontend (chỉ cần này)
pnpm install

# Backend (tùy chọn - không bắt buộc)
cd backend
npm install
```

#### 3. Cấu hình MongoDB

**MongoDB Atlas (Cloud - Khuyến nghị)**
- Xem hướng dẫn chi tiết: [backend/docs/MONGODB_ATLAS_SETUP.md](backend/docs/MONGODB_ATLAS_SETUP.md)
- Tạo cluster miễn phí tại: https://www.mongodb.com/cloud/atlas/register

#### 4. Cấu hình môi trường

**Frontend (.env.local):**
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/goiymonan
JWT_SECRET=your-random-secret-key-min-32-chars
NEXT_PUBLIC_API_URL=http://localhost:3001
```

#### 5. Chạy ứng dụng

**Development:**
```bash
# Frontend (chỉ cần này)
pnpm dev              # http://localhost:3001

# Backend (tùy chọn)
cd backend
npm run dev           # http://localhost:5000
```

**Production:**
```bash
pnpm build
pnpm start
```

## 📁 Cấu trúc dự án

```
recipe/
├── app/              # 📱 Next.js App (Pages, API Routes, Components, Lib)
│   ├── components/   # React Components
│   ├── lib/          # Utilities & Stores
│   ├── api/          # API Routes
│   └── [pages]/      # Page components
├── backend/          # ⚙️ Express.js Backend API (Optional)
├── public/           # 🖼️ Static assets
└── [config files]    # ⚙️ Configuration files
```

Xem chi tiết:
- [📖 PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Cấu trúc chi tiết
- [🗂️ INDEX.md](INDEX.md) - Hướng dẫn navigation

## 📚 Documentation

### Project
- [INDEX.md](INDEX.md) - Navigation guide
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Project structure

### Backend (Optional)
- [backend/README.md](backend/README.md) - Backend API documentation
- [backend/STRUCTURE.md](backend/STRUCTURE.md) - Backend structure
- [backend/docs/](backend/docs/) - Detailed documentation

## 🔑 Tài khoản mặc định

Sau khi chạy lần đầu, tạo admin account:
```bash
cd backend
node scripts/create-admin.js
```

Hoặc đăng ký tài khoản với email: `admin@recipe.com`

## 🛠️ Công nghệ sử dụng

### Frontend
- Next.js 15.1
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zustand (State management)
- React Hook Form
- date-fns
- react-hot-toast

### Backend (Optional)
- Express.js
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs
- Nodemailer

## 📝 Features

✅ **Hoàn thành:**
- Authentication (Login/Register/Logout)
- Recipe CRUD operations
- Recipe search & filter
- ❤️ Like/Unlike recipes (real-time update)
- 🔖 Save/Unsave recipes (real-time update)
- 💬 Comments với reply & delete
- Meal planning
- Shopping list generation
- User profiles
- Admin dashboard
- Health profile
- 🤖 AI recommendations theo sức khỏe
- Forgot/Reset password

🚧 **Đang phát triển:**
- Recipe image upload
- Social sharing
- Nutrition calculator
- Mobile app

## 🔄 Recent Updates

### v1.1 - Like/Save Real-time Updates (2025-12-27)
- ✅ Token được lưu trong Zustand store (persisted)
- ✅ Like/Save counts cập nhật real-time
- ✅ Sửa lỗi 401 Unauthorized khi like/save
- ✅ Thêm `getToken()` function

### v1.0 - Initial Release
- ✅ Full authentication flow
- ✅ Recipe management
- ✅ AI recommendations
- ✅ Meal planning & Shopping list

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:
1. Fork repository
2. Tạo branch mới (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết

## 👨‍💻 Tác giả

**Nhuthoas04**
- GitHub: [@nhuthoas04](https://github.com/nhuthoas04)
- Repository: [recipe](https://github.com/nhuthoas04/recipe)

## 🆘 Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra [Issues](https://github.com/nhuthoas04/recipe/issues)
2. Xem [backend/docs/](backend/docs/) để biết hướng dẫn troubleshooting
3. Tạo issue mới nếu cần

## ⚠️ Lưu ý

- **Không commit file `.env` và `.env.local`** lên GitHub
- Sử dụng `.env.example` làm template
- Đổi JWT_SECRET trong production
- MongoDB password cần encode nếu có ký tự đặc biệt
