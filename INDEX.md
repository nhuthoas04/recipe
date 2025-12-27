# 🗂️ Hướng dẫn Navigate Dự án Recipe App

## 📂 Cấu trúc Thư mục Chính

```
recipe/
├── app/           # 📱 Next.js App (Pages, API Routes, Components, Lib)
├── backend/       # ⚙️ Express.js Backend API (Optional)
├── .next/         # 🔨 Build output (auto-generated)
└── node_modules/  # 📦 Dependencies (auto-generated)
```

---

## 🚀 Quick Start

### **1. Development:**
```bash
# Cài đặt dependencies
pnpm install

# Chạy frontend
pnpm dev              # http://localhost:3001

# Chạy backend (tùy chọn - không bắt buộc)
cd backend
npm install
npm run dev           # http://localhost:5000
```

### **2. Xem Documentation:**
- **📖 README.md** - Quick start & MongoDB setup
- **📊 PROJECT_STRUCTURE.md** - Cấu trúc tổng quan
- **🗂️ INDEX.md** - File này (Navigator)

---

## 📱 **app/** - Next.js App Router

**Mục đích:** Pages, API Routes, Components, và Libraries

### **Pages:**
```
app/
├── page.tsx                    # / - Trang chủ (Recipe Browser)
├── login/page.tsx              # /login - Đăng nhập
├── register/page.tsx           # /register - Đăng ký
├── forgot-password/page.tsx    # /forgot-password - Quên mật khẩu
├── reset-password/page.tsx     # /reset-password - Đặt lại mật khẩu
├── profile/page.tsx            # /profile - Trang cá nhân
├── meal-planner/page.tsx       # /meal-planner - Lên kế hoạch bữa ăn
├── shopping-list/page.tsx      # /shopping-list - Danh sách mua sắm
└── admin/page.tsx              # /admin - Quản trị (admin only)
```

### **API Routes:**
```
app/api/
├── auth/
│   ├── login/         # POST - Đăng nhập
│   ├── register/      # POST - Đăng ký
│   └── logout/        # POST - Đăng xuất
├── recipes/
│   ├── route.ts       # GET, POST - CRUD recipes
│   ├── restore/       # POST - Khôi phục recipe đã xóa
│   └── review/        # POST - Duyệt/từ chối recipe (admin)
├── comments/          # GET, POST, DELETE, PATCH - CRUD comments
├── meal-plans/        # GET, POST - CRUD meal plans
├── shopping-list/     # GET, POST - Tạo shopping list
├── users/
│   ├── route.ts       # GET - Danh sách users (admin)
│   └── health-profile/ # GET, POST - Health profile
├── user/
│   ├── profile/       # GET, PUT - User profile
│   ├── like-recipe/   # POST - Like/Unlike recipe
│   ├── save-recipe/   # POST - Save/Unsave recipe
│   ├── liked-recipes/ # GET - Get liked recipes
│   └── saved-recipes/ # GET - Get saved recipes
├── admin/
│   └── users/         # PATCH, DELETE - Quản lý users
└── ai/
    └── recommendations/ # POST - AI gợi ý món ăn
```

### **Components:**
```
app/components/
├── auth/                       # Authentication
│   ├── auth-guard.tsx         # Protected routes
│   ├── user-data-sync.tsx     # Sync user data
│   └── cleanup-localstorage.tsx
├── recipe/                     # Recipe Management
│   ├── recipe-browser.tsx     # Browse & filter recipes
│   ├── recipe-card.tsx        # Recipe card with like/save
│   ├── recipe-detail-dialog.tsx # Chi tiết recipe + comments
│   └── recipe-form-dialog.tsx # Form đóng góp recipe
├── meal/                       # Meal Planning
│   ├── meal-planner.tsx
│   ├── meal-slot.tsx
│   └── add-meal-dialog.tsx
├── shopping/                   # Shopping List
│   └── shopping-list.tsx
├── layout/                     # Layout
│   ├── header.tsx
│   ├── footer.tsx
│   └── theme-provider.tsx
├── shared/                     # Shared
│   └── client-only.tsx
├── ui/                         # shadcn/ui components
├── health-profile-dialog.tsx
└── ai-recommendations.tsx      # AI gợi ý món ăn theo sức khỏe
```

### **Libraries:**
```
app/lib/
├── auth-store.ts      # Zustand auth store (user, token, login/logout)
├── recipe-store.ts    # Zustand recipe store (recipes, filters)
├── auth.ts            # Auth utilities
├── api-client.ts      # API client
├── types.ts           # TypeScript types
├── utils.ts           # Helper functions (cn, etc.)
├── mongodb.ts         # MongoDB client
└── recipes-data.ts    # Default recipes data
```

---

## ⚙️ **backend/** - Express.js Backend (Optional)

**Mục đích:** RESTful API Server chạy trên port 5000
> **Note:** Hầu hết API đã được migrate sang Next.js API Routes, backend chỉ cần cho một số tính năng đặc biệt.

### **Cấu trúc:**
```
backend/
├── src/              # Source code
│   ├── server.ts    # Entry point
│   ├── models/      # Mongoose models
│   ├── routes/      # API routes
│   └── middleware/  # Auth, ErrorHandler
│
├── scripts/          # Database scripts
├── docs/             # Documentation (9 files)
├── docker-compose.yml
└── Dockerfile
```

**📖 Xem thêm:** [backend/STRUCTURE.md](backend/STRUCTURE.md)

---

## 🔍 Tìm file theo chức năng

### **🔐 Authentication:**
- **Components:** `app/components/auth/*`
- **Store:** `app/lib/auth-store.ts` (token, user, login, logout, getToken)
- **API:** `app/api/auth/*`

### **🍽️ Recipes:**
- **Components:** `app/components/recipe/*`
- **Store:** `app/lib/recipe-store.ts`
- **API:** `app/api/recipes/*`

### **❤️ Like/Save:**
- **Components:** `app/components/recipe/recipe-card.tsx`, `recipe-detail-dialog.tsx`
- **Store:** `app/lib/auth-store.ts` (likedRecipes, savedRecipes)
- **API:** `app/api/user/like-recipe/*`, `app/api/user/save-recipe/*`

### **💬 Comments:**
- **Component:** `app/components/recipe/recipe-detail-dialog.tsx`
- **API:** `app/api/comments/*`

### **🤖 AI Recommendations:**
- **Component:** `app/components/ai-recommendations.tsx`
- **API:** `app/api/ai/recommendations/*`

### **�️ Meal Planning:**
- **Components:** `app/components/meal/*`
- **Store:** `app/lib/recipe-store.ts`
- **API:** `app/api/meal-plans/*`

### **� Shopping List:**
- **Components:** `app/components/shopping/*`
- **API:** `app/api/shopping-list/*`

### **🎨 UI Components:**
- **shadcn/ui:** `app/components/ui/*`
- **Layout:** `app/components/layout/*`

### **📊 Database:**
- **MongoDB Connection:** `app/lib/mongodb.ts`
- **Types:** `app/lib/types.ts`

---

## 🔧 Configuration Files

| File | Mục đích |
|------|----------|
| `package.json` | Dependencies & scripts |
| `tsconfig.json` | TypeScript config (`@/*` → `app/*`) |
| `next.config.mjs` | Next.js config |
| `components.json` | shadcn/ui config |
| `.env.local` | Environment variables |
| `backend/package.json` | Backend dependencies |

---

## 📖 Documentation Files

### **Root Level:**
- **README.md** - Quick start guide
- **PROJECT_STRUCTURE.md** - Cấu trúc tổng quan
- **INDEX.md** - Navigator (file này)

### **Backend:**
- **backend/STRUCTURE.md** - Backend structure
- **backend/docs/** - 9 documentation files

---

## 🎯 Quy trình làm việc

### **1. Thêm tính năng mới:**
1. Tạo component trong `app/components/[feature]/`
2. Thêm logic vào `app/lib/` (stores, utils)
3. Tạo API route trong `app/api/[feature]/`
4. Thêm page trong `app/[feature]/page.tsx`

### **2. Thêm UI component:**
1. Dùng shadcn/ui: `npx shadcn-ui@latest add [component]`
2. Component sẽ tự động vào `app/components/ui/`

### **3. Thêm API endpoint:**
1. Tạo file trong `app/api/[route]/route.ts`
2. Export functions: GET, POST, PUT, DELETE

### **4. Sửa bug:**
1. Check errors: VS Code Problems panel
2. Check console: Browser DevTools
3. Check terminal: Server logs

---

## 🆘 Cần giúp đỡ?

- **MongoDB issues:** `backend/docs/MONGODB_*.md`
- **Authentication:** `backend/docs/JWT_AUTHENTICATION.md`
- **Admin setup:** `backend/docs/ADMIN_ROLES.md`
- **Docker:** `backend/DOCKER.md`

---

## 🏗️ Cấu trúc hiện tại

```
✅ Frontend: Next.js 15 + React 19 + TypeScript
✅ State: Zustand stores (auth-store, recipe-store)
✅ UI: shadcn/ui + Tailwind CSS
✅ Database: MongoDB Atlas (Cloud)
✅ API: Next.js API Routes (chính) + Express.js Backend (tùy chọn)
✅ Auth: JWT + bcryptjs (token stored in Zustand)
✅ Docker: docker-compose deployment
```

**Import paths:** `@/*` → `app/*`

---

## 🔄 Recent Updates

### Like/Save Real-time Updates (2025-12-27)
- ✅ Token được lưu trong Zustand store (persisted)
- ✅ Like/Save counts cập nhật real-time trong dialog và cards
- ✅ `getToken()` function để lấy token từ store

### Files quan trọng đã cập nhật:
- `app/lib/auth-store.ts` - Token management
- `app/components/recipe/recipe-detail-dialog.tsx` - Real-time updates
- `app/components/recipe/recipe-browser.tsx` - onLikeSaveChange handler
- `app/components/ai-recommendations.tsx` - onLikeSaveChange handler
