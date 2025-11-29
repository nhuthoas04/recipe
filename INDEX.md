# 🗂️ Hướng dẫn Navigate Dự án Recipe App

## 📂 Cấu trúc Thư mục Chính

```
recipe/
├── app/           # 📱 Next.js Pages & API Routes
├── client/        # 💻 Frontend Components & Logic
├── backend/       # ⚙️ Express.js Backend (chưa tích hợp)
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
pnpm dev              # http://localhost:3000

# Chạy backend (tùy chọn)
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

**Mục đích:** Pages và API Routes

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
├── comments/          # POST, DELETE - CRUD comments
├── meal-plans/        # GET, POST - CRUD meal plans
├── shopping-list/     # GET, POST - Tạo shopping list
├── users/
│   ├── route.ts       # GET - Danh sách users (admin)
│   └── health-profile/ # GET, POST - Health profile
├── user/
│   └── profile/       # GET, PUT - User profile
├── admin/
│   └── users/         # PATCH, DELETE - Quản lý users
└── ai/
    └── recommendations/ # POST - AI gợi ý món ăn
```

**📖 Xem thêm:** Không có file riêng (Next.js convention)

---

## 💻 **client/** - Frontend Code

**Mục đích:** Components, Libraries, Styles

### **Cấu trúc:**
```
client/
├── components/              # React Components
│   ├── auth/               # Authentication
│   │   ├── auth-guard.tsx         # Protected routes
│   │   ├── user-data-sync.tsx     # Sync user data
│   │   └── cleanup-localstorage.tsx
│   ├── recipe/             # Recipe Management
│   │   ├── recipe-browser.tsx     # Browse & filter
│   │   ├── recipe-card.tsx        # Recipe card
│   │   ├── recipe-detail-dialog.tsx
│   │   └── recipe-form-dialog.tsx
│   ├── meal/               # Meal Planning
│   │   ├── meal-planner.tsx
│   │   ├── meal-slot.tsx
│   │   └── add-meal-dialog.tsx
│   ├── shopping/           # Shopping List
│   │   └── shopping-list.tsx
│   ├── layout/             # Layout
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── theme-provider.tsx
│   ├── shared/             # Shared
│   │   └── client-only.tsx
│   ├── ui/                 # shadcn/ui (12 components)
│   ├── health-profile-dialog.tsx
│   └── ai-recommendations.tsx
│
├── lib/                    # Utilities & Stores
│   ├── auth-store.ts      # Zustand auth store
│   ├── recipe-store.ts    # Zustand recipe store
│   ├── auth.ts            # Auth utilities
│   ├── api-client.ts      # API client
│   ├── types.ts           # TypeScript types
│   ├── utils.ts           # Helper functions
│   ├── mongodb.ts         # MongoDB client
│   └── recipes-data.ts    # Default recipes
│
└── styles/                 # CSS
    └── globals.css
```

**📖 Xem thêm:** [client/README.md](client/README.md)

---

## ⚙️ **backend/** - Express.js Backend

**Mục đích:** RESTful API Server (chưa tích hợp với frontend)

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
- **Frontend:** `client/components/auth/*`
- **Store:** `client/lib/auth-store.ts`
- **API:** `app/api/auth/*`
- **Backend:** `backend/src/routes/auth.ts` (chưa dùng)

### **🍽️ Recipes:**
- **Frontend:** `client/components/recipe/*`
- **Store:** `client/lib/recipe-store.ts`
- **API:** `app/api/recipes/*`
- **Backend:** `backend/src/routes/recipes.ts` (chưa dùng)

### **🗓️ Meal Planning:**
- **Frontend:** `client/components/meal/*`
- **Store:** `client/lib/recipe-store.ts`
- **API:** `app/api/meal-plans/*`
- **Backend:** `backend/src/routes/mealPlans.ts` (chưa dùng)

### **🛒 Shopping List:**
- **Frontend:** `client/components/shopping/*`
- **Store:** `client/lib/recipe-store.ts`
- **API:** `app/api/shopping-list/*`

### **💬 Comments:**
- **Frontend:** `client/components/recipe/recipe-detail-dialog.tsx`
- **API:** `app/api/comments/*`

### **🎨 UI Components:**
- **shadcn/ui:** `client/components/ui/*`
- **Layout:** `client/components/layout/*`

### **📊 Database:**
- **MongoDB Connection:** `client/lib/mongodb.ts`
- **Types:** `client/lib/types.ts`
- **Scripts:** `backend/scripts/*`

---

## 🔧 Configuration Files

| File | Mục đích |
|------|----------|
| `package.json` | Frontend dependencies & scripts |
| `tsconfig.json` | TypeScript config (`@/*` → `client/*`) |
| `next.config.mjs` | Next.js config |
| `components.json` | shadcn/ui config |
| `.env.local` | Environment variables |
| `backend/package.json` | Backend dependencies |
| `backend/tsconfig.json` | Backend TypeScript config |

---

## 📖 Documentation Files

### **Root Level:**
- **README.md** - Quick start guide
- **PROJECT_STRUCTURE.md** - Cấu trúc tổng quan
- **INDEX.md** - Navigator (file này)

### **Backend:**
- **backend/STRUCTURE.md** - Backend structure
- **backend/docs/** - 9 documentation files

### **Client:**
- **client/README.md** - Client folder guide

---

## 🎯 Quy trình làm việc

### **1. Thêm tính năng mới:**
1. Tạo component trong `client/components/[feature]/`
2. Thêm logic vào `client/lib/` (stores, utils)
3. Tạo API route trong `app/api/[feature]/`
4. Thêm page trong `app/[feature]/page.tsx`

### **2. Thêm UI component:**
1. Dùng shadcn/ui: `npx shadcn-ui@latest add [component]`
2. Component sẽ tự động vào `client/components/ui/`

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
✅ State: Zustand stores
✅ UI: shadcn/ui + Tailwind CSS
✅ Database: MongoDB (direct connection)
✅ API: Next.js API Routes
✅ Auth: JWT + bcryptjs
⏸️ Backend: Express.js (ready but not used)
```

**Import paths:** `@/*` → `client/*`
