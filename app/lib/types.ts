export interface Recipe {
  id: string
  name: string
  description: string
  image: string
  category: "món chính" | "món phụ" | "canh" | "món tráng miệng" | "đồ uống"
  cuisine: "Bắc" | "Trung" | "Nam" | "Quốc tế"
  prepTime: number // phút
  cookTime: number // phút
  servings: number
  difficulty: "Dễ" | "Trung bình" | "Khó"
  ingredients: Ingredient[]
  instructions: string[]
  nutrition?: {
    calories: number
    protein: number
    carbs: number
    fat: number
  }
  tags: string[]
  // Tags sức khỏe
  healthTags?: string[] // ["ít đường", "ít muối", "không gluten", "giàu protein", ...]
  suitableFor?: string[] // ["tiểu đường", "cao huyết áp", "ăn chay", ...]
  notSuitableFor?: string[] // ["dị ứng hải sản", "dị ứng đậu phộng", ...]
  status?: "pending" | "approved" | "rejected" // Trạng thái kiểm duyệt
  authorId?: string // ID người đăng
  authorEmail?: string // Email người đăng
  createdAt?: Date
  reviewedAt?: Date
  reviewNote?: string // Ghi chú từ admin khi từ chối
  isDeleted?: boolean // Trong thùng rác
  deletedAt?: Date
  likesCount?: number // Số lượt thích
  savesCount?: number // Số lượt lưu
  commentsCount?: number // Số bình luận
}

export interface Ingredient {
  name: string
  amount: string
  unit: string
}

export interface MealPlan {
  id: string
  date: string
  breakfast?: Recipe[]
  lunch?: Recipe[]
  dinner?: Recipe[]
  snack?: Recipe[]
}

export interface ShoppingListItem {
  ingredient: string
  amount: string
  unit: string
  checked: boolean
  recipeNames: string[]
  mealInfo?: Array<{
    date: string
    mealType: "breakfast" | "lunch" | "dinner" | "snack"
    recipeName: string
  }>
}

export interface User {
  id: string
  email: string
  name: string
  role: "user" | "admin"
  isActive: boolean
  createdAt: Date
  lastLogin?: Date
  // Thông tin sức khỏe
  age?: number
  healthConditions?: string[] // ["tiểu đường", "cao huyết áp", "dị ứng hải sản", ...]
  dietaryPreferences?: string[] // ["ăn chay", "ít đường", "ít muối", ...]
  hasCompletedHealthProfile?: boolean // Đã hoàn thành profile chưa
  savedRecipes?: string[] // Danh sách ID recipes đã lưu
  likedRecipes?: string[] // Danh sách ID recipes đã thích
}

export interface Comment {
  id: string
  recipeId: string
  userId: string
  userName: string
  userEmail: string
  content: string
  createdAt: Date
  updatedAt?: Date
  // Like functionality
  likes?: string[] // Array of user IDs who liked
  likesCount?: number
  // Reply functionality  
  parentId?: string // Parent comment ID for replies
  replies?: Comment[] // Nested replies
}
