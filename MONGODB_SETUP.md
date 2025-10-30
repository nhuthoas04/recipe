# Hướng dẫn Setup MongoDB

## Tùy chọn 1: MongoDB Atlas (Cloud - Khuyên dùng)

### Bước 1: Tạo tài khoản MongoDB Atlas

1. Truy cập https://www.mongodb.com/cloud/atlas/register
2. Đăng ký tài khoản miễn phí
3. Tạo một cluster mới (chọn FREE tier)

### Bước 2: Lấy Connection String

1. Trong MongoDB Atlas, click **"Connect"**
2. Chọn **"Connect your application"**
3. Copy connection string có dạng:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Bước 3: Cấu hình .env.local

1. Tạo file `.env.local` từ `.env.local.example`
2. Thay thế connection string:
   ```
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/recipe_app?retryWrites=true&w=majority
   ```
3. Thay `<username>` và `<password>` bằng thông tin của bạn

### Bước 4: Whitelist IP Address

1. Trong MongoDB Atlas, vào **"Network Access"**
2. Click **"Add IP Address"**
3. Chọn **"Allow Access from Anywhere"** (cho development)
4. Hoặc add IP cụ thể của bạn

---

## Tùy chọn 2: MongoDB Local (Localhost)

### Bước 1: Cài đặt MongoDB Community Server

**Windows:**
1. Download từ https://www.mongodb.com/try/download/community
2. Chạy file installer
3. Chọn "Complete" installation
4. Chọn "Run service as Network Service user"
5. Install MongoDB Compass (GUI tool - optional)

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

### Bước 2: Kiểm tra MongoDB đang chạy

```bash
# Windows (trong Command Prompt)
mongo --version

# macOS/Linux
mongosh --version
```

### Bước 3: Cấu hình .env.local

Sử dụng connection string local:
```
MONGODB_URI=mongodb://localhost:27017/recipe_app
```

---

## Khởi động ứng dụng

```bash
# Cài đặt dependencies
pnpm install

# Chạy development server
pnpm dev
```

Truy cập http://localhost:3000

---

## Kiểm tra kết nối

Khi bạn đăng ký tài khoản đầu tiên, MongoDB sẽ tự động:
- Tạo database `recipe_app`
- Tạo collection `users`
- Lưu user vào database

Bạn có thể kiểm tra dữ liệu:

**MongoDB Atlas:** Vào tab "Collections" trong dashboard

**MongoDB Local:** Sử dụng MongoDB Compass hoặc mongosh:
```bash
mongosh
use recipe_app
db.users.find()
```

---

## Collections trong Database

- `users` - Thông tin tài khoản người dùng
- `meal_plans` - Thực đơn của từng user
- `shopping_lists` - Danh sách mua sắm của từng user
- `recipes` - (Tùy chọn) Công thức nấu ăn tùy chỉnh của user

---

## Troubleshooting

### Lỗi "MongoServerError: bad auth"
- Kiểm tra username/password trong connection string
- Đảm bảo đã tạo database user trong MongoDB Atlas

### Lỗi "connect ECONNREFUSED"
- Đảm bảo MongoDB đang chạy
- Kiểm tra connection string trong .env.local

### Lỗi "IP not whitelisted"
- Vào Network Access trong MongoDB Atlas
- Add IP address của bạn

---

## Next Steps

Sau khi setup MongoDB thành công:
1. Đăng ký tài khoản mới
2. Tạo thực đơn
3. Dữ liệu sẽ được lưu vào MongoDB thay vì localStorage
4. Mỗi user có dữ liệu riêng biệt
