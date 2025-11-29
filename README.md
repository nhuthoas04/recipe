# 🍳 Recipe App - Ứng dụng Quản lý Công thức Nấu ăn

## 📋 Giới thiệu

Recipe App là một ứng dụng web toàn diện cho phép người dùng:
- 🔍 Tìm kiếm và duyệt công thức nấu ăn
- 📝 Tạo và chia sẻ công thức của riêng mình
- 📅 Lập kế hoạch bữa ăn hàng tuần
- 🛒 Tạo danh sách mua sắm tự động
- 💬 Bình luận và đánh giá công thức
- 👤 Quản lý hồ sơ sức khỏe cá nhân
- 🤖 Nhận gợi ý món ăn từ AI

## 🏗️ Kiến trúc

- **Frontend:** Next.js 15 (App Router) + React + TypeScript
- **Backend:** Express.js + TypeScript (RESTful API)
- **Database:** MongoDB (Local hoặc Atlas)
- **Authentication:** JWT + HttpOnly Cookies
- **UI Components:** shadcn/ui + Tailwind CSS
- **State Management:** Zustand

## 🚀 Cài đặt nhanh

### 1. Clone repository
```bash
git clone https://github.com/nhuthoas04/recipe.git
cd recipe
```

### 2. Cài đặt dependencies

**Frontend:**
```bash
pnpm install
```

**Backend:**
```bash
cd backend
npm install
```

### 3. Cấu hình MongoDB

**Tùy chọn A: MongoDB Atlas (Cloud - Khuyến nghị)**
- Xem hướng dẫn chi tiết: [backend/docs/MONGODB_ATLAS_SETUP.md](backend/docs/MONGODB_ATLAS_SETUP.md)
- Tạo cluster miễn phí tại: https://www.mongodb.com/cloud/atlas/register

**Tùy chọn B: MongoDB Local**
```bash
cd backend
docker-compose up -d
```

### 4. Cấu hình môi trường

**Frontend (.env.local):**
```env
MONGODB_URI=mongodb+srv://admin:yourpassword@cluster0.abc.mongodb.net/recipe?retryWrites=true&w=majority
JWT_SECRET=your-random-secret-key-min-32-chars
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**Backend (.env):**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/recipe-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 5. Chạy ứng dụng

**Development:**
```bash
# Terminal 1 - Frontend
pnpm dev              # http://localhost:3000

# Terminal 2 - Backend (tùy chọn - nếu muốn dùng Express backend)
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
├── app/              # 📱 Next.js App Router (Pages & API Routes)
├── client/           # 💻 Frontend Components & Libraries
├── backend/          # ⚙️ Express.js Backend API
├── public/           # 🖼️ Static assets
└── [config files]    # ⚙️ Configuration files
```

Xem chi tiết:
- [📖 PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Cấu trúc chi tiết
- [🗂️ INDEX.md](INDEX.md) - Hướng dẫn navigation

## 📚 Documentation

### Frontend
- [client/README.md](client/README.md) - Frontend structure

### Backend
- [backend/README.md](backend/README.md) - Backend API documentation
- [backend/STRUCTURE.md](backend/STRUCTURE.md) - Backend structure
- [backend/docs/](backend/docs/) - Detailed documentation

## 🔑 Tài khoản mặc định

Sau khi chạy lần đầu, tạo admin account:
```bash
cd backend
node scripts/create-admin.js
```

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

### Backend
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
- Meal planning
- Shopping list generation
- Comments & ratings
- User profiles
- Admin dashboard
- Health profile
- AI recommendations
- Forgot/Reset password

🚧 **Đang phát triển:**
- Recipe image upload
- Social sharing
- Nutrition calculator
- Mobile app

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
