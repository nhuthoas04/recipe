# Recipe App - RESTful API Backend

Backend API server cho ứng dụng Recipe, được xây dựng với Express.js, TypeScript, và MongoDB.

## 🚀 Cài đặt

### 1. Cài đặt dependencies

```bash
cd backend
npm install
```

### 2. Cấu hình môi trường

Sửa file `.env` với thông tin của bạn:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/recipe-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Chạy server

**Development mode (với hot reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

Server sẽ chạy tại: `http://localhost:5000`

## 📡 API Endpoints

### 🔐 Authentication (`/api/auth`)
- `POST /register` - Đăng ký user mới
- `POST /login` - Đăng nhập (trả về JWT token)
- `POST /logout` - Đăng xuất (xóa cookie)
- `GET /me` - Lấy thông tin user hiện tại
- `POST /forgot-password` - Gửi email reset password
- `POST /reset-password` - Đặt lại mật khẩu

### 🍳 Recipes (`/api/recipes`)
- `GET /` - Lấy danh sách recipes (có filter, search, pagination)
- `GET /:id` - Lấy chi tiết recipe
- `POST /` - Tạo recipe mới (cần auth)
- `PUT /:id` - Cập nhật recipe (cần auth, owner only)
- `DELETE /:id` - Xóa recipe - soft delete (cần auth, owner/admin)
- `POST /:id/review` - Duyệt/từ chối recipe (admin only)
- `POST /:id/restore` - Khôi phục recipe đã xóa (admin only)
- `POST /:id/comments` - Thêm comment vào recipe
- `DELETE /:id/comments/:commentId` - Xóa comment

### 👤 Users (`/api/users`)
- `GET /` - Lấy danh sách users (admin only)
- `GET /profile` - Lấy profile user hiện tại
- `PUT /profile` - Cập nhật profile
- `GET /health-profile` - Lấy health profile
- `POST /health-profile` - Tạo/cập nhật health profile
- `PATCH /:id/toggle-active` - Khóa/mở khóa user (admin only)
- `DELETE /:id` - Xóa user (admin only)

### 📅 Meal Plans (`/api/meal-plans`)
- `GET /` - Lấy meal plans của user (cần auth)
- `POST /` - Tạo/cập nhật meal plan (cần auth)
- `DELETE /:id` - Xóa meal plan (cần auth)
- `GET /week/:startDate` - Lấy meal plan theo tuần

### 🛒 Shopping List (`/api/shopping-list`)
- `POST /generate` - Tạo shopping list từ meal plans

### 🤖 AI Recommendations (`/api/ai`)
- `POST /recommendations` - Lấy gợi ý món ăn dựa trên health profile

## 🔐 Authentication

API sử dụng JWT token để xác thực. Token có thể được gửi qua:
1. **Cookie** (httpOnly): `token`
2. **Authorization header**: `Bearer <token>`

Token có thời hạn 7 ngày.

## 🧪 Test API

Bạn có thể test API bằng:
- **Postman** hoặc **Insomnia**
- **curl** commands
- Hoặc trực tiếp từ frontend

### Ví dụ với curl:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","name":"Test User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'

# Get recipes
curl http://localhost:5000/api/recipes
```

## 🎯 Tính năng

### Authentication & Authorization
- ✅ JWT-based authentication
- ✅ HttpOnly cookie support
- ✅ Role-based access control (User/Admin)
- ✅ Password reset via email

### Recipe Management
- ✅ CRUD operations
- ✅ Recipe review system (pending/approved/rejected)
- ✅ Soft delete & restore
- ✅ Search & filter
- ✅ Comments & ratings

### User Management
- ✅ User profiles
- ✅ Health profiles
- ✅ Admin dashboard
- ✅ Account activation/deactivation

### Meal Planning
- ✅ Weekly meal plans
- ✅ Shopping list generation
- ✅ AI recommendations

## 📁 Cấu trúc project

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts       # MongoDB connection
│   ├── models/
│   │   ├── User.ts           # User model
│   │   ├── Recipe.ts         # Recipe model
│   │   └── MealPlan.ts       # MealPlan model
│   ├── routes/
│   │   ├── auth.ts           # Auth routes
│   │   ├── recipes.ts        # Recipe routes
│   │   ├── users.ts          # User routes
│   │   └── mealPlans.ts      # MealPlan routes
│   ├── middleware/
│   │   ├── auth.ts           # JWT authentication
│   │   └── errorHandler.ts  # Error handling
│   └── server.ts             # Main server file
├── .env                      # Environment variables
├── package.json
├── tsconfig.json
└── nodemon.json
```

## 🔄 Kiến trúc hiện tại

Dự án này có **2 backend options**:

### Option 1: Next.js API Routes (Đang dùng)
```
app/api/*  ← API routes trong Next.js App Router
```
- ✅ Đơn giản, tích hợp sẵn với frontend
- ✅ Deploy 1 lần (Vercel, Netlify)
- ✅ Server-side rendering support
- ❌ Khó tách riêng backend

### Option 2: Express.js API (Backend folder)
```
backend/src/*  ← Standalone RESTful API
```
- ✅ Tách biệt hoàn toàn frontend/backend
- ✅ Scale độc lập
- ✅ Hỗ trợ đa platform (Web, Mobile, Desktop)
- ✅ Microservices-ready
- ❌ Phải deploy riêng

### Khi nào dùng Express backend?
- 🚀 Muốn phát triển mobile app
- 📱 Cần API cho nhiều platform
- 🔧 Team backend/frontend riêng biệt
- 📈 Cần scale backend riêng

## 🗄️ Database Models

### User Model
```typescript
{
  email: string
  password: string (hashed)
  name: string
  role: 'user' | 'admin'
  isActive: boolean
  healthProfile?: {
    age, weight, height, goal, restrictions, etc.
  }
}
```

### Recipe Model
```typescript
{
  title: string
  ingredients: string[]
  instructions: string[]
  cookTime: number
  servings: number
  cuisine: string
  tags: string[]
  status: 'pending' | 'approved' | 'rejected'
  author: User
  comments: Comment[]
  deletedAt?: Date
}
```

### MealPlan Model
```typescript
{
  user: User
  date: Date
  breakfast?: Recipe
  lunch?: Recipe
  dinner?: Recipe
}
```

## 🚀 Deploy

### Backend:
- **Heroku**: `git push heroku main`
- **Railway**: Connect GitHub repo
- **Render**: Connect GitHub repo
- **DigitalOcean**: Docker container
- **AWS EC2**: Manual setup

### Database:
## 📚 Công nghệ sử dụng

- **Express.js 4.18** - Web framework
- **TypeScript 5.3** - Type safety
- **MongoDB + Mongoose 8.0** - Database & ODM
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin requests
- **Nodemailer** - Email service
- **cookie-parser** - Cookie handling
- **dotenv** - Environment variables
- **nodemon** - Development hot reload

## 📝 Lưu ý quan trọng

### Quy tắc nghiệp vụ:
- User đầu tiên đăng ký sẽ tự động là **admin**
- Admin tạo recipe → tự động **approved**
- User tạo recipe → status **pending** → cần admin review
- Xóa recipe = **soft delete** (deletedAt field)
- CORS đã cấu hình cho `http://localhost:3000`

### Security:
- Password được hash bằng bcryptjs (salt rounds: 10)
- JWT token lưu trong **httpOnly cookie** (7 ngày)
- Rate limiting nên được thêm vào production
- Input validation cần được kiểm tra kỹ

## 🐛 Troubleshooting

### MongoDB connection error
```bash
# Kiểm tra MongoDB đang chạy
docker-compose ps

# Restart MongoDB
docker-compose restart

# Xem logs
docker-compose logs mongodb
```

### "bad auth" error
→ Kiểm tra username/password trong MONGODB_URI

### Port 5000 already in use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Hoặc đổi PORT trong .env
PORT=5001
```

### CORS errors
→ Kiểm tra FRONTEND_URL trong .env khớp với frontend URL

## 🧪 Testing

```bash
# Test health endpoint
curl http://localhost:5000/health

# Test register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@recipe.com","password":"admin123","name":"Admin"}'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@recipe.com","password":"admin123"}'
```

## 📖 Documentation Links

- [STRUCTURE.md](./STRUCTURE.md) - Cấu trúc chi tiết
- [docs/MONGODB_ATLAS_SETUP.md](./docs/MONGODB_ATLAS_SETUP.md) - Setup MongoDB Atlas
- [docs/JWT_AUTHENTICATION.md](./docs/JWT_AUTHENTICATION.md) - JWT implementation
- [docs/ADMIN_ROLES.md](./docs/ADMIN_ROLES.md) - Role-based access
- [docs/FORGOT_PASSWORD.md](./docs/FORGOT_PASSWORD.md) - Password reset flow

## 🚀 Deployment

### Railway / Render / Heroku
1. Push code to GitHub
2. Connect repository
3. Set environment variables
4. Deploy

### Docker
```bash
docker build -t recipe-backend .
docker run -p 5000:5000 --env-file .env recipe-backend
```

## 🤝 Contributing

Contributions are welcome! Xem [../README.md](../README.md) để biết thêm thông tin.

## 📄 License

MIT License - see LICENSE file for details
