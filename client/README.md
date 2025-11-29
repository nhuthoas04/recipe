# 💻 Client Folder - Frontend Code

Thư mục này chứa **tất cả code frontend** của ứng dụng Recipe App (components, libs, styles).

## 📁 Cấu trúc chi tiết:

```
client/
├── components/                    # React Components (chia theo feature)
│   ├── auth/                     # 🔐 Authentication
│   │   ├── auth-guard.tsx        # Protected route wrapper
│   │   ├── user-data-sync.tsx    # Sync user data với server
│   │   └── cleanup-localstorage.tsx
│   │
│   ├── recipe/                   # 🍳 Recipe Management
│   │   ├── recipe-browser.tsx    # Browse & filter recipes
│   │   ├── recipe-card.tsx       # Recipe card display
│   │   ├── recipe-detail-dialog.tsx  # Chi tiết + comments
│   │   └── recipe-form-dialog.tsx    # Create/edit form
│   │
│   ├── meal/                     # 📅 Meal Planning
│   │   ├── meal-planner.tsx      # Weekly planner
│   │   ├── meal-slot.tsx         # Individual meal slot
│   │   └── add-meal-dialog.tsx   # Add meal dialog
│   │
│   ├── shopping/                 # 🛒 Shopping List
│   │   └── shopping-list.tsx     # Shopping list manager
│   │
│   ├── layout/                   # 🎨 Layout Components
│   │   ├── header.tsx            # Navigation header
│   │   ├── footer.tsx            # Footer
│   │   └── theme-provider.tsx    # Dark/Light mode
│   │
│   ├── shared/                   # 🔧 Shared Utilities
│   │   └── client-only.tsx       # Client-side only wrapper
│   │
│   ├── ui/                       # 🎭 shadcn/ui Components (12 files)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── ... (8 more)
│   │
│   ├── health-profile-dialog.tsx # 💪 Health Profile
│   └── ai-recommendations.tsx    # 🤖 AI Recommendations
│
├── lib/                          # 📚 Utilities & Logic
│   ├── auth-store.ts            # Zustand auth state
│   ├── recipe-store.ts          # Zustand recipe state
│   ├── auth.ts                  # Auth utilities
│   ├── api-client.ts            # API client wrapper
│   ├── types.ts                 # TypeScript definitions
│   ├── utils.ts                 # Helper functions (cn, etc.)
│   ├── mongodb.ts               # MongoDB connection
│   └── recipes-data.ts          # Default recipe data
│
└── styles/                       # 🎨 Styles
    └── globals.css              # Global CSS + Tailwind
```

## 🔗 Liên kết với App Router:

Thư mục `app/` (pages & API routes) nằm ở **root level** để Next.js App Router có thể tự động nhận diện routing.

```
recipe/
├── app/           # ← Next.js pages & API routes
└── client/        # ← Frontend components & libs
```

## 📦 Import Paths:

Tất cả imports sử dụng alias `@/` trỏ đến `client/`:

```typescript
// ✅ Correct imports
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/auth-store'
import { Recipe } from '@/lib/types'
import { cn } from '@/lib/utils'
```

Cấu hình trong `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./client/*"]
    }
  }
}
```

## 🧩 Component Organization:

### 1. **Feature-based** (auth/, recipe/, meal/, shopping/)
- Nhóm components theo chức năng
- Dễ maintain và scale

### 2. **Layout** (layout/)
- Shared layout components
- Header, Footer, Theme provider

### 3. **UI Library** (ui/)
- shadcn/ui components
- Reusable, customizable
- Built on Radix UI

### 4. **Shared** (shared/)
- Common utilities
- Cross-feature components

## 🗂️ State Management:

### Zustand Stores:
- **auth-store.ts**: User authentication state
- **recipe-store.ts**: Recipe filtering & management

### Local State:
- React useState cho component state
- React Hook Form cho forms

## 🎨 Styling:

- **Tailwind CSS**: Utility-first CSS
- **CSS Variables**: Theme customization
- **globals.css**: Base styles + Tailwind directives

## 📝 TypeScript Types:

Centralized trong `lib/types.ts`:
```typescript
- User
- Recipe  
- MealPlan
- ShoppingList
- Comment
- HealthProfile
```

## 🔄 Data Flow:

```
User Action → Component → Store/API
                ↓
         Update State
                ↓
         Re-render UI
```

## 🚀 Best Practices:

1. **Component Naming**: PascalCase (RecipeCard.tsx)
2. **File Organization**: Feature-based folders
3. **Import Order**: React → 3rd party → Internal
4. **Type Safety**: Always use TypeScript types
5. **Reusability**: Extract common logic to utils/

## 📖 Related Documentation:

- [../app/README.md](../app/) - Next.js App Router
- [../PROJECT_STRUCTURE.md](../PROJECT_STRUCTURE.md) - Overall structure
- [../INDEX.md](../INDEX.md) - Navigation guide
