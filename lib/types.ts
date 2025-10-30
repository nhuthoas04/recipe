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
  status?: "pending" | "approved" | "rejected" // Trạng thái kiểm duyệt
  authorId?: string // ID người đăng
  authorEmail?: string // Email người đăng
  createdAt?: Date
  reviewedAt?: Date
  reviewNote?: string // Ghi chú từ admin khi từ chối
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
