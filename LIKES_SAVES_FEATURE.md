# Chức năng Like và Save Recipes

## Tổng quan
Đã thêm chức năng cho phép người dùng:
- ❤️ **Thích (Like)** công thức yêu thích - cập nhật real-time
- 🔖 **Lưu (Save)** công thức để xem sau - cập nhật real-time
- 📊 Xem số lượng likes và saves trên mỗi công thức
- 📱 Quản lý danh sách recipes đã thích và đã lưu trong trang cá nhân

## Kiến trúc

### Token Storage (Updated 2025-12-27)
- JWT token được lưu trong **Zustand store** (persisted) thay vì chỉ localStorage
- `getToken()` function để lấy token từ store hoặc fallback localStorage
- Điều này đảm bảo token được persist cùng với user data

### State Flow
```
User clicks Like → API call with token → Update local state
                                       → Call onLikeSaveChange callback
                                       → Parent updates store/state
                                       → Cards re-render with new count
```

## API Routes (Next.js)

Các API routes trong `app/api/user/` sử dụng MongoDB trực tiếp:

| Route | Method | Mô tả |
|-------|--------|-------|
| `/api/user/like-recipe` | POST | Like/Unlike recipe |
| `/api/user/save-recipe` | POST | Save/Unsave recipe |
| `/api/user/liked-recipes` | GET | Lấy danh sách recipes đã thích |
| `/api/user/saved-recipes` | GET | Lấy danh sách recipes đã lưu |

### Request/Response Format

**Like Recipe:**
```typescript
// Request
POST /api/user/like-recipe
Headers: { Authorization: "Bearer <token>" }
Body: { recipeId: string }

// Response
{
  success: true,
  isLiked: boolean,
  likesCount: number,
  likedRecipes: string[]
}
```

**Save Recipe:**
```typescript
// Request
POST /api/user/save-recipe
Headers: { Authorization: "Bearer <token>" }
Body: { recipeId: string }

// Response
{
  success: true,
  isSaved: boolean,
  savesCount: number,
  savedRecipes: string[]
}
```

## Components

### Recipe Card (`app/components/recipe/recipe-card.tsx`)
- Nút Like với icon trái tim ❤️
- Nút Save với icon bookmark 🔖
- Hiển thị số lượt like và save
- Animation khi click (fill color)
- Toast notifications khi like/save thành công
- Sử dụng `getToken()` từ auth-store

### Recipe Detail Dialog (`app/components/recipe/recipe-detail-dialog.tsx`)
- Like/Save buttons trong dialog
- Real-time count updates
- Gọi `onLikeSaveChange` callback để notify parent
- Separate useEffect để sync counts từ parent

### Recipe Browser (`app/components/recipe/recipe-browser.tsx`)
- `handleLikeSaveChange` callback để update recipes trong store
- `likeSaveRefreshKey` để force re-render cards
- Pass `onLikeSaveChange` prop vào RecipeDetailDialog

### AI Recommendations (`app/components/ai-recommendations.tsx`)
- `handleLikeSaveChange` callback để update recommendations state
- Real-time sync với RecipeDetailDialog

### Profile Page (`app/profile/page.tsx`)
- Tab "Đã lưu" 🔖 - Recipes đã save
- Tab "Đã thích" ❤️ - Recipes đã like
- `handleLikeSaveChange` callback để update local state

## Auth Store (`app/lib/auth-store.ts`)

### New Fields
```typescript
interface AuthStore {
  token: string | null           // JWT token (persisted)
  getToken: () => string | null  // Get token from store or localStorage
}
```

### Token Flow
1. User login → token saved to store + localStorage
2. API calls → `getToken()` returns token from store
3. User logout → token cleared from store + localStorage

## Database Schema

```typescript
User {
  savedRecipes: ObjectId[]  // Array of Recipe IDs
  likedRecipes: ObjectId[]  // Array of Recipe IDs
}

Recipe {
  likesCount: number  // Counter for likes
  savesCount: number  // Counter for saves
}
```

## Troubleshooting

### Lỗi 401 Unauthorized
- ✅ **Fixed:** Token giờ được lưu trong Zustand store
- Nếu vẫn lỗi: đăng xuất và đăng nhập lại
- Check token: `useAuthStore.getState().token`

### Số likes/saves không cập nhật real-time
- ✅ **Fixed:** Added `onLikeSaveChange` callbacks
- ✅ **Fixed:** Split useEffect để sync counts từ parent
- Refresh page nếu cần (F5)

### Tabs không hiển thị recipes
- Kiểm tra đã có recipes đã like/save chưa
- Check Network tab xem API có trả về data không
- Verify token được gửi đúng trong header

## Files Modified (2025-12-27)

| File | Changes |
|------|---------|
| `app/lib/auth-store.ts` | Added `token` field, `getToken()` function |
| `app/components/recipe/recipe-detail-dialog.tsx` | Use `getToken()`, split useEffect, add `onLikeSaveChange` calls |
| `app/components/recipe/recipe-card.tsx` | Use `getToken()` instead of localStorage |
| `app/components/recipe/recipe-browser.tsx` | Added `handleLikeSaveChange`, `likeSaveRefreshKey` |
| `app/components/ai-recommendations.tsx` | Added `handleLikeSaveChange` |
| `app/profile/page.tsx` | Added `handleLikeSaveChange` |

## Future Enhancements
- [ ] Real-time updates khi có người khác like/save (WebSocket)
- [ ] Thông báo khi recipe được like nhiều
- [ ] Filter/Sort recipes trong tabs
- [ ] Export saved recipes
- [ ] Share liked recipes với bạn bè
