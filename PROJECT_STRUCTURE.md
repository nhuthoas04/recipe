# 📁 Cấu trúc Dự án - Recipe App

## 🏗️ Tổng quan:

```
recipe/
├── app/                  # 📱 Next.js App Router (Pages & API Routes)
├── client/               # 💻 Frontend Code (Components, Libs, Styles)
├── backend/              # ⚙️ Express.js Backend (chưa sử dụng)
├── scripts/              # 🛠️ Setup scripts
├── node_modules/         # 📦 Dependencies
└── [config files]        # ⚙️ Config files
```

---

## 📱 **app/** - Next.js App Router

### Pages:
- `/` - Homepage (Recipe Browser - Trang chủ duyệt công thức)
- `/login` - Đăng nhập
- `/register` - Đăng ký
- `/forgot-password` - Quên mật khẩu
- `/reset-password` - Đặt lại mật khẩu
- `/profile` - Trang cá nhân người dùng
- `/meal-planner` - Lập kế hoạch bữa ăn theo tuần
- `/shopping-list` - Danh sách mua sắm tự động
- `/admin` - Trang quản trị (chỉ admin)

### API Routes:
- `/api/auth/*` - Authentication (login, register, logout)
- `/api/recipes/*` - CRUD recipes + review/restore
- `/api/comments/*` - CRUD comments on recipes
- `/api/meal-plans/*` - CRUD meal plans
- `/api/shopping-list/*` - Generate shopping list
- `/api/users/*` - User management + health profile
- `/api/user/profile/*` - Current user profile
- `/api/admin/users/*` - Admin user management
- `/api/ai/recommendations/*` - AI meal recommendations

---

## 💻 **client/** - Frontend Code

### **components/** - React Components (chia theo feature)

#### `auth/` - Authentication
- `auth-guard.tsx` - Protected route wrapper
- `user-data-sync.tsx` - Sync user data
- `cleanup-localstorage.tsx` - Cleanup localStorage

#### `recipe/` - Recipe Management
- `recipe-browser.tsx` - Browse & filter recipes
- `recipe-card.tsx` - Recipe card display
- `recipe-detail-dialog.tsx` - Recipe details + comments
- `recipe-form-dialog.tsx` - Create/edit recipe form

#### `meal/` - Meal Planning
- `meal-planner.tsx` - Weekly meal planner
- `meal-slot.tsx` - Individual meal slot
- `add-meal-dialog.tsx` - Add meal to plan dialog

#### `shopping/` - Shopping List
- `shopping-list.tsx` - Shopping list management

#### `layout/` - Layout Components
- `header.tsx` - Navigation header
- `theme-provider.tsx` - Dark/Light mode

#### `shared/` - Shared Utilities
- `client-only.tsx` - Client-side only wrapper

#### `ui/` - shadcn/ui Components (12 files)
- button, card, dialog, input, checkbox, etc.

### **lib/** - Utilities & Logic

- `auth-store.ts` - Zustand auth state management
- `recipe-store.ts` - Zustand recipe state management
- `types.ts` - TypeScript type definitions
- `utils.ts` - Helper functions
- `mongodb.ts` - MongoDB connection
- `recipes-data.ts` - Default recipe data
- `auth.ts` - Auth utilities

### **styles/** - Styles
- `globals.css` - Global CSS styles

---

## ⚙️ **backend/** - Express.js Backend

**Trạng thái:** RESTful API đầy đủ chức năng (có thể dùng thay thế Next.js API Routes)

```
backend/
├── src/
│   ├── server.ts              # Entry point
│   ├── config/
│   │   └── database.ts        # MongoDB connection
│   ├── models/                # Mongoose models
│   │   ├── User.ts           # User model
│   │   ├── Recipe.ts         # Recipe model
│   │   └── MealPlan.ts       # Meal plan model
│   ├── routes/                # API routes
│   │   ├── auth.ts           # Authentication routes
│   │   ├── recipes.ts        # Recipe CRUD
│   │   ├── users.ts          # User management
│   │   └── mealPlans.ts      # Meal planning
│   ├── middleware/
│   │   ├── auth.ts           # JWT authentication
│   │   └── errorHandler.ts   # Error handling
│   └── services/
│       └── emailService.ts   # Email service (forgot password)
├── scripts/
│   ├── check-data.js         # Kiểm tra dữ liệu DB
│   ├── clear-database.js     # Xóa database
│   └── create-admin.js       # Tạo admin user
├── docs/                      # 9 documentation files
├── docker-compose.yml         # Docker setup
├── Dockerfile
├── mongo-init.js
└── setup-mongodb-user.js
```

**Xem chi tiết:** [backend/README.md](backend/README.md) và [backend/STRUCTURE.md](backend/STRUCTURE.md)

Xem chi tiết: [backend/STRUCTURE.md](backend/STRUCTURE.md)

---

## 📝 **Config Files**

- `package.json` - Dependencies & scripts
- `tsconfig.json` - TypeScript config (`@/*` → `./client/*`)
- `next.config.mjs` - Next.js config
- `components.json` - shadcn/ui config
- `postcss.config.mjs` - PostCSS config
- `.env.local` - Environment variables

---

## 🔗 Import Paths

Tất cả imports sử dụng alias `@/`:

```typescript
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/lib/auth-store"
import { Recipe } from "@/lib/types"
```

Mapping:
- `@/components/*` → `client/components/*`
- `@/lib/*` → `client/lib/*`

---

## 🚀 Commands

```bash
# Development
npm run dev              # Start Next.js frontend
npm run dev:backend      # Start Express backend
npm run dev:frontend     # Start Next.js frontend

# Build
npm run build            # Build for production
npm run start            # Start production server
```

---

## 📊 Tech Stack

### Frontend:
- **Framework:** Next.js 15.2.4 (App Router)
- **React:** 19
- **TypeScript:** 5
- **Styling:** Tailwind CSS 4.1.9
- **UI Components:** shadcn/ui (Radix UI)
- **State Management:** Zustand
- **Database:** MongoDB 6.20.0
- **Auth:** JWT + bcryptjs

### Backend (chưa dùng):
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose

---

## 📖 Ghi chú

1. **App Router ở root:** Next.js yêu cầu thư mục `app` ở root hoặc `src`
2. **Client folder:** Chứa tất cả frontend code (components, libs)
3. **Backend folder:** Đã tạo nhưng chưa tích hợp vào hệ thống
4. **API Routes:** Hiện dùng Next.js API Routes (trong `app/api`)
