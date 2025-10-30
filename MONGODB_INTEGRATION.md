# 🍳 Recipe App với MongoDB

## ✅ Đã hoàn thành tích hợp MongoDB!

### 📦 Packages đã cài đặt:
- ✅ `mongodb` - MongoDB driver cho Node.js
- ✅ `bcryptjs` - Hash password an toàn

### 🔧 Files đã tạo:

#### 1. MongoDB Configuration
- `lib/mongodb.ts` - Kết nối MongoDB với connection pooling
- `.env.local` - Biến môi trường (connection string)
- `.env.local.example` - Template cho .env

#### 2. API Routes (RESTful API)

**Authentication:**
- `app/api/auth/login/route.ts` - POST /api/auth/login
- `app/api/auth/register/route.ts` - POST /api/auth/register

**Meal Plans:**
- `app/api/meal-plans/route.ts`
  - GET - Lấy thực đơn của user
  - POST - Tạo thực đơn mới
  - PUT - Cập nhật thực đơn
  - DELETE - Xóa thực đơn

**Shopping List:**
- `app/api/shopping-list/route.ts`
  - GET - Lấy danh sách mua sắm
  - POST - Cập nhật danh sách

#### 3. Updated Stores
- `lib/auth-store.ts` - Sử dụng API thay vì localStorage

### 🗄️ Database Schema

**Collection: users**
```json
{
  "_id": ObjectId,
  "email": String,
  "password": String (hashed with bcrypt),
  "name": String,
  "createdAt": Date
}
```

**Collection: meal_plans**
```json
{
  "_id": ObjectId,
  "userId": String,
  "date": String,
  "breakfast": [Recipe],
  "lunch": [Recipe],
  "dinner": [Recipe],
  "snack": [Recipe],
  "createdAt": Date,
  "updatedAt": Date
}
```

**Collection: shopping_lists**
```json
{
  "_id": ObjectId,
  "userId": String,
  "items": [ShoppingItem],
  "updatedAt": Date
}
```

---

## 🚀 Cách Setup

### Bước 1: Chọn MongoDB (1 trong 2)

**Option A: MongoDB Atlas (Cloud - Khuyên dùng)**
1. Đăng ký tại https://www.mongodb.com/cloud/atlas/register
2. Tạo FREE cluster
3. Lấy connection string
4. Whitelist IP address

**Option B: MongoDB Local**
1. Cài MongoDB Community Server
2. Chạy MongoDB service
3. Sử dụng: `mongodb://localhost:27017/recipe_app`

### Bước 2: Cấu hình .env.local

File `.env.local` đã được tạo với giá trị mặc định:
```
MONGODB_URI=mongodb://localhost:27017/recipe_app
JWT_SECRET=dev-secret-key-change-in-production
```

**Nếu dùng MongoDB Atlas**, thay đổi `MONGODB_URI`:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/recipe_app?retryWrites=true&w=majority
```

### Bước 3: Chạy ứng dụng

```bash
pnpm dev
```

---

## 🧪 Testing API

### Test Authentication

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456","name":"Test User"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

---

## 📝 TODO: Cập nhật Recipe Store

Hiện tại `auth-store.ts` đã sử dụng API, nhưng `recipe-store.ts` vẫn dùng localStorage.

Cần cập nhật để:
1. Load meal plans từ API khi user đăng nhập
2. Gọi API khi thêm/sửa/xóa meal plans
3. Gọi API khi cập nhật shopping list

---

## 🔐 Security Features

- ✅ Password được hash với bcrypt (10 rounds)
- ✅ Email validation
- ✅ Password minimum 6 characters
- ✅ MongoDB connection pooling
- ⚠️ TODO: Add JWT tokens
- ⚠️ TODO: Add authentication middleware
- ⚠️ TODO: Add rate limiting

---

## 📚 Documentation

Xem file `MONGODB_SETUP.md` để biết hướng dẫn chi tiết về:
- Setup MongoDB Atlas
- Setup MongoDB Local
- Troubleshooting
- Next steps

---

## 🎯 Next Steps

1. **Setup MongoDB**
   - Chọn Atlas hoặc Local
   - Cấu hình .env.local

2. **Test API**
   - Đăng ký tài khoản mới
   - Đăng nhập
   - Kiểm tra data trong MongoDB

3. **Cập nhật Recipe Store** (Optional)
   - Migrate từ localStorage sang API
   - Sync meal plans với MongoDB
   - Sync shopping list với MongoDB

4. **Deploy** (Optional)
   - Deploy lên Vercel
   - Sử dụng MongoDB Atlas cho production
   - Update environment variables

---

## ⚠️ Important Notes

- File `.env.local` đã có trong `.gitignore` - KHÔNG commit lên Git
- Đổi `JWT_SECRET` trước khi deploy production
- Sử dụng strong passwords cho MongoDB users
- Whitelist IP addresses cẩn thận

---

## 🐛 Common Issues

**"Please add your MongoDB URI to .env.local"**
→ Tạo file .env.local và thêm MONGODB_URI

**Connection timeout**
→ Kiểm tra MongoDB đang chạy và IP đã được whitelist

**Authentication failed**
→ Kiểm tra username/password trong connection string

---

Chúc bạn code vui vẻ! 🎉
