# 📁 Cấu trúc Dự án - Recipe App

## 🏗️ Tổng quan:

```
recipe/
├── app/                  # 📱 Next.js App (Pages, API, Components, Lib)
├── backend/              # ⚙️ Express.js Backend API (Optional)
├── public/               # 🖼️ Static assets
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
- `/api/user/like-recipe/*` - Like/Unlike recipe
- `/api/user/save-recipe/*` - Save/Unsave recipe
- `/api/user/liked-recipes/*` - Get liked recipes
- `/api/user/saved-recipes/*` - Get saved recipes
- `/api/admin/users/*` - Admin user management
- `/api/ai/recommendations/*` - AI meal recommendations

### Components (`app/components/`):

#### `auth/` - Authentication
- `auth-guard.tsx` - Protected route wrapper
- `user-data-sync.tsx` - Sync user data
- `cleanup-localstorage.tsx` - Cleanup localStorage

#### `recipe/` - Recipe Management
- `recipe-browser.tsx` - Browse & filter recipes
- `recipe-card.tsx` - Recipe card with like/save buttons
- `recipe-detail-dialog.tsx` - Recipe details + comments + like/save
- `recipe-form-dialog.tsx` - Create/edit recipe form

#### `meal/` - Meal Planning
- `meal-planner.tsx` - Weekly meal planner
- `meal-slot.tsx` - Individual meal slot
- `add-meal-dialog.tsx` - Add meal to plan dialog

#### `shopping/` - Shopping List
- `shopping-list.tsx` - Shopping list management

#### `layout/` - Layout Components
- `header.tsx` - Navigation header
- `footer.tsx` - Footer
- `theme-provider.tsx` - Dark/Light mode

#### `shared/` - Shared Utilities
- `client-only.tsx` - Client-side only wrapper

#### `ui/` - shadcn/ui Components
- button, card, dialog, input, checkbox, tabs, badge, etc.

#### Standalone Components
- `ai-recommendations.tsx` - AI gợi ý món ăn theo sức khỏe
- `health-profile-dialog.tsx` - Health profile setup dialog

### Libraries (`app/lib/`):

- `auth-store.ts` - Zustand auth state (user, token, login, logout, getToken)
- `recipe-store.ts` - Zustand recipe state management
- `types.ts` - TypeScript type definitions
- `utils.ts` - Helper functions (cn, etc.)
- `mongodb.ts` - MongoDB connection
- `recipes-data.ts` - Default recipe data
- `auth.ts` - Auth utilities

---

## ⚙️ **backend/** - Express.js Backend (Optional)

**Trạng thái:** RESTful API - hầu hết chức năng đã migrate sang Next.js API Routes

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
└── mongo-init.js
```

**Xem chi tiết:** [backend/STRUCTURE.md](backend/STRUCTURE.md)

---

## 📝 **Config Files**

- `package.json` - Dependencies & scripts
- `tsconfig.json` - TypeScript config (`@/*` → `./app/*`)
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
- `@/components/*` → `app/components/*`
- `@/lib/*` → `app/lib/*`

---

## 🚀 Commands

```bash
# Development
pnpm dev                 # Start Next.js frontend (http://localhost:3001)

# Backend (Optional)
cd backend
npm run dev              # Start Express backend (http://localhost:5000)

# Build
pnpm build               # Build for production
pnpm start               # Start production server
```

---

## 📊 Tech Stack

### Frontend:
- **Framework:** Next.js 15 (App Router)
- **React:** 19
- **TypeScript:** 5
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui (Radix UI)
- **State Management:** Zustand (persisted)
- **Database:** MongoDB
- **Auth:** JWT + bcryptjs

### Backend (Optional):
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose
- **Services:** Email service (forgot password)

---

## 📖 Ghi chú

1. **App-based structure:** Tất cả code frontend nằm trong `app/` folder
2. **Import alias:** `@/*` → `app/*`
3. **Backend optional:** Hầu hết API đã migrate sang Next.js API Routes
4. **Token storage:** JWT token được lưu trong Zustand store (persisted)
5. **Real-time updates:** Like/Save counts update ngay lập tức
6. **Docker:** Hỗ trợ deployment với docker-compose

---

## 🔄 Recent Updates

### 2025-12-27: Like/Save Real-time Updates
- Token được lưu trong Zustand store thay vì chỉ localStorage
- `getToken()` function để lấy token
- `onLikeSaveChange` callbacks để update UI real-time
- Split useEffect cho better state sync
