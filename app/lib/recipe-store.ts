"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Recipe, MealPlan, ShoppingListItem } from "./types"
import { recipesData } from "./recipes-data"

interface RecipeStore {
  recipes: Recipe[]
  mealPlans: MealPlan[]
  shoppingList: ShoppingListItem[]
  searchQuery: string
  selectedCategory: string | null
  selectedCuisine: string | null
  selectedDifficulty: string | null
  currentUserId: string | null

  // Actions
  setCurrentUser: (userId: string | null) => void
  loadUserData: (userId: string | null) => void
  setSearchQuery: (query: string) => void
  setSelectedCategory: (category: string | null) => void
  setSelectedCuisine: (cuisine: string | null) => void
  setSelectedDifficulty: (difficulty: string | null) => void
  addMealPlan: (mealPlan: MealPlan) => void
  updateMealPlan: (id: string, mealPlan: Partial<MealPlan>) => void
  removeMealPlan: (id: string) => void
  addToShoppingList: (items: ShoppingListItem[]) => void
  toggleShoppingItem: (ingredient: string) => void
  removeFromShoppingList: (ingredient: string) => void
  clearShoppingList: () => void
  getFilteredRecipes: () => Recipe[]
  updateRecipeCommentsCount: (recipeId: string, delta: number) => void
}

// Helper functions để lưu/load data theo userId
const getUserStorageKey = (userId: string | null, dataType: string) => {
  return userId ? `recipe-${dataType}-${userId}` : `recipe-${dataType}-guest`
}

const saveUserData = (userId: string | null, mealPlans: MealPlan[], shoppingList: ShoppingListItem[]) => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(getUserStorageKey(userId, "mealplans"), JSON.stringify(mealPlans))
    localStorage.setItem(getUserStorageKey(userId, "shopping"), JSON.stringify(shoppingList))
  } catch (error) {
    // Nếu localStorage đầy, xóa dữ liệu cũ và thử lại
    console.warn('localStorage quota exceeded, clearing old data...')
    try {
      // Xóa dữ liệu guest cũ
      localStorage.removeItem(getUserStorageKey(null, "mealplans"))
      localStorage.removeItem(getUserStorageKey(null, "shopping"))

      // Thử lưu lại
      localStorage.setItem(getUserStorageKey(userId, "mealplans"), JSON.stringify(mealPlans))
      localStorage.setItem(getUserStorageKey(userId, "shopping"), JSON.stringify(shoppingList))
    } catch (retryError) {
      console.error('Failed to save data even after clearing:', retryError)
      alert('Dung lượng lưu trữ đã đầy. Vui lòng xóa bớt dữ liệu cũ hoặc đăng nhập để lưu vào cơ sở dữ liệu.')
    }
  }
}

const loadUserData = (userId: string | null): { mealPlans: MealPlan[]; shoppingList: ShoppingListItem[] } => {
  if (typeof window === "undefined") return { mealPlans: [], shoppingList: [] }

  const mealPlansStr = localStorage.getItem(getUserStorageKey(userId, "mealplans"))
  const shoppingStr = localStorage.getItem(getUserStorageKey(userId, "shopping"))

  return {
    mealPlans: mealPlansStr ? JSON.parse(mealPlansStr) : [],
    shoppingList: shoppingStr ? JSON.parse(shoppingStr) : [],
  }
}

export const useRecipeStore = create<RecipeStore>()(
  persist(
    (set, get) => ({
      recipes: recipesData,
      mealPlans: [],
      shoppingList: [],
      searchQuery: "",
      selectedCategory: null,
      selectedCuisine: null,
      selectedDifficulty: null,
      currentUserId: null,

      setCurrentUser: (userId) => {
        const userData = loadUserData(userId)
        set({
          currentUserId: userId,
          mealPlans: userData.mealPlans,
          shoppingList: userData.shoppingList,
        })
      },

      loadUserData: async (userId) => {
        // Load recipes từ MongoDB - CHỈ lấy approved recipes cho trang chủ
        try {
          const recipesRes = await fetch('/api/recipes')
          const recipesData = await recipesRes.json()
          if (recipesData.success && recipesData.recipes.length > 0) {
            set({ recipes: recipesData.recipes })
          }
        } catch (error) {
          console.error('Error loading recipes from API:', error)
          // Giữ recipes mặc định nếu load fail
        }

        if (!userId) {
          // Guest user - dùng localStorage
          const userData = loadUserData(userId)
          set({
            currentUserId: userId,
            mealPlans: userData.mealPlans,
            shoppingList: userData.shoppingList,
          })
          return
        }

        // Logged in user - load từ MongoDB API
        try {
          // Load meal plans
          const mealPlansRes = await fetch(`/api/meal-plans?userId=${userId}`)
          const mealPlansData = await mealPlansRes.json()

          // Load shopping list
          const shoppingRes = await fetch(`/api/shopping-list?userId=${userId}`)
          const shoppingData = await shoppingRes.json()

          set({
            currentUserId: userId,
            mealPlans: mealPlansData.success ? mealPlansData.mealPlans : [],
            shoppingList: shoppingData.success ? shoppingData.items : [],
          })
        } catch (error) {
          console.error('Error loading user data from API:', error)
          // Fallback to localStorage nếu API fail
          const userData = loadUserData(userId)
          set({
            currentUserId: userId,
            mealPlans: userData.mealPlans,
            shoppingList: userData.shoppingList,
          })
        }
      },

      setSearchQuery: (query) => set({ searchQuery: query }),

      setSelectedCategory: (category) => set({ selectedCategory: category }),

      setSelectedCuisine: (cuisine) => set({ selectedCuisine: cuisine }),

      setSelectedDifficulty: (difficulty) => set({ selectedDifficulty: difficulty }),

      addMealPlan: async (mealPlan) => {
        const state = get()
        const newMealPlans = [...state.mealPlans, mealPlan]

        // Save to MongoDB nếu user đã đăng nhập
        if (state.currentUserId) {
          try {
            await fetch('/api/meal-plans', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: state.currentUserId, mealPlan }),
            })
          } catch (error) {
            console.error('Error saving meal plan:', error)
          }
        } else {
          // Guest user - save to localStorage
          saveUserData(state.currentUserId, newMealPlans, state.shoppingList)
        }

        set({ mealPlans: newMealPlans })
      },

      updateMealPlan: async (id, updates) => {
        const state = get()
        const newMealPlans = state.mealPlans.map((plan) => (plan.id === id ? { ...plan, ...updates } : plan))

        // Save to MongoDB nếu user đã đăng nhập
        if (state.currentUserId) {
          try {
            await fetch('/api/meal-plans', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: state.currentUserId, mealPlanId: id, updates }),
            })
          } catch (error) {
            console.error('Error updating meal plan:', error)
          }
        } else {
          saveUserData(state.currentUserId, newMealPlans, state.shoppingList)
        }

        set({ mealPlans: newMealPlans })
      },

      removeMealPlan: async (id) => {
        const state = get()
        const newMealPlans = state.mealPlans.filter((plan) => plan.id !== id)

        // Delete from MongoDB nếu user đã đăng nhập
        if (state.currentUserId) {
          try {
            await fetch(`/api/meal-plans?userId=${state.currentUserId}&mealPlanId=${id}`, {
              method: 'DELETE',
            })
          } catch (error) {
            console.error('Error deleting meal plan:', error)
          }
        } else {
          saveUserData(state.currentUserId, newMealPlans, state.shoppingList)
        }

        set({ mealPlans: newMealPlans })
      },

      addToShoppingList: async (items) => {
        const state = get()
        const existingItems = state.shoppingList
        const newItems = items.filter(
          (item) => !existingItems.some((existing) => existing.ingredient === item.ingredient),
        )
        const newShoppingList = [...existingItems, ...newItems]

        // Save to MongoDB nếu user đã đăng nhập
        if (state.currentUserId) {
          try {
            await fetch('/api/shopping-list', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: state.currentUserId, items: newShoppingList }),
            })
          } catch (error) {
            console.error('Error saving shopping list:', error)
          }
        } else {
          saveUserData(state.currentUserId, state.mealPlans, newShoppingList)
        }

        set({ shoppingList: newShoppingList })
      },

      toggleShoppingItem: async (ingredient) => {
        const state = get()
        const newShoppingList = state.shoppingList.map((item) =>
          item.ingredient === ingredient ? { ...item, checked: !item.checked } : item,
        )

        // Save to MongoDB nếu user đã đăng nhập
        if (state.currentUserId) {
          try {
            await fetch('/api/shopping-list', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: state.currentUserId, items: newShoppingList }),
            })
          } catch (error) {
            console.error('Error updating shopping list:', error)
          }
        } else {
          saveUserData(state.currentUserId, state.mealPlans, newShoppingList)
        }

        set({ shoppingList: newShoppingList })
      },

      removeFromShoppingList: async (ingredient) => {
        const state = get()
        const newShoppingList = state.shoppingList.filter((item) => item.ingredient !== ingredient)

        // Save to MongoDB nếu user đã đăng nhập
        if (state.currentUserId) {
          try {
            await fetch('/api/shopping-list', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: state.currentUserId, items: newShoppingList }),
            })
          } catch (error) {
            console.error('Error removing from shopping list:', error)
          }
        } else {
          saveUserData(state.currentUserId, state.mealPlans, newShoppingList)
        }

        set({ shoppingList: newShoppingList })
      },

      clearShoppingList: async () => {
        const state = get()

        // Clear from MongoDB nếu user đã đăng nhập
        if (state.currentUserId) {
          try {
            await fetch(`/api/shopping-list?userId=${state.currentUserId}`, {
              method: 'DELETE',
            })
          } catch (error) {
            console.error('Error clearing shopping list:', error)
          }
        } else {
          saveUserData(state.currentUserId, state.mealPlans, [])
        }

        set({ shoppingList: [] })
      },

      getFilteredRecipes: () => {
        const { recipes, searchQuery, selectedCategory, selectedCuisine, selectedDifficulty } = get()

        // Tối ưu: nếu không có filter nào, trả về tất cả
        if (!searchQuery && !selectedCategory && !selectedCuisine && !selectedDifficulty) {
          return recipes
        }

        // Chuẩn hóa search query một lần
        const normalizedSearch = searchQuery?.toLowerCase().trim()

        return recipes.filter((recipe) => {
          // Check category và cuisine trước (nhanh hơn)
          if (selectedCategory && recipe.category !== selectedCategory) return false
          if (selectedCuisine && recipe.cuisine !== selectedCuisine) return false
          if (selectedDifficulty && recipe.difficulty !== selectedDifficulty) return false

          // Check search cuối cùng (chậm hơn)
          if (normalizedSearch) {
            const nameMatch = recipe.name.toLowerCase().includes(normalizedSearch)
            if (nameMatch) return true

            const descMatch = recipe.description.toLowerCase().includes(normalizedSearch)
            if (descMatch) return true

            const tagMatch = recipe.tags.some((tag) => tag.toLowerCase().includes(normalizedSearch))
            if (tagMatch) return true

            const difficultyMatch = recipe.difficulty.toLowerCase().includes(normalizedSearch)
            if (difficultyMatch) return true

            return false
          }

          return true
        })
      },

      // Update comment count for a specific recipe (real-time update)
      updateRecipeCommentsCount: (recipeId, delta) => {
        const state = get()
        const updatedRecipes = state.recipes.map((recipe) =>
          recipe.id === recipeId
            ? { ...recipe, commentsCount: Math.max(0, (recipe.commentsCount || 0) + delta) }
            : recipe
        )
        set({ recipes: updatedRecipes })
      },
    }),
    {
      name: "recipe-storage",
      // Không persist recipes - luôn fetch từ database
      partialize: (state) => ({
        mealPlans: state.mealPlans,
        shoppingList: state.shoppingList,
        currentUserId: state.currentUserId,
        searchQuery: state.searchQuery,
        selectedCategory: state.selectedCategory,
        selectedCuisine: state.selectedCuisine,
        selectedDifficulty: state.selectedDifficulty,
      }),
    },
  ),
)
