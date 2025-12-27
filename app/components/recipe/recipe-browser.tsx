"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Search, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RecipeCard } from "@/components/recipe/recipe-card"
import { RecipeDetailDialog } from "@/components/recipe/recipe-detail-dialog"
import { RecipeFormDialog } from "@/components/recipe/recipe-form-dialog"
import { AIRecommendations } from "@/components/ai-recommendations"
import { useRecipeStore } from "@/lib/recipe-store"
import { useAuthStore } from "@/lib/auth-store"
import type { Recipe } from "@/lib/types"
import { Toaster } from 'react-hot-toast'

const categories = [
  { value: null, label: "Tất cả" },
  { value: "món chính", label: "Món Chính" },
  { value: "món phụ", label: "Món Phụ" },
  { value: "canh", label: "Canh" },
  { value: "món tráng miệng", label: "Tráng Miệng" },
]

const cuisines = [
  { value: null, label: "Tất cả vùng" },
  { value: "Bắc", label: "Miền Bắc" },
  { value: "Trung", label: "Miền Trung" },
  { value: "Nam", label: "Miền Nam" },
  { value: "Quốc tế", label: "Quốc Tế" },
]

export function RecipeBrowser() {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [mounted, setMounted] = useState(false)
  const [isContributeDialogOpen, setIsContributeDialogOpen] = useState(false)
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true)
  const [commentRefreshKey, setCommentRefreshKey] = useState(0) // Force re-render when comments change
  const [likeSaveRefreshKey, setLikeSaveRefreshKey] = useState(0) // Force re-render when likes/saves change
  const { isAuthenticated, user } = useAuthStore()
  
  // Chỉ lấy những giá trị cần thiết từ store để tránh re-render
  const recipes = useRecipeStore((state) => state.recipes)
  const searchQuery = useRecipeStore((state) => state.searchQuery)
  const selectedCategory = useRecipeStore((state) => state.selectedCategory)
  const selectedCuisine = useRecipeStore((state) => state.selectedCuisine)
  const setSelectedCategory = useRecipeStore((state) => state.setSelectedCategory)
  const setSelectedCuisine = useRecipeStore((state) => state.setSelectedCuisine)
  const getFilteredRecipes = useRecipeStore((state) => state.getFilteredRecipes)

  // Load recipes từ database khi component mount
  useEffect(() => {
    setMounted(true)
    
    const loadRecipes = async () => {
      try {
        setIsLoadingRecipes(true)
        console.log('Loading recipes from API...')
        const res = await fetch('/api/recipes')
        const data = await res.json()
        console.log('Recipes loaded:', data.recipes?.length)
        if (data.success && data.recipes) {
          useRecipeStore.setState({ recipes: data.recipes })
        }
      } catch (error) {
        console.error('Error loading recipes:', error)
      } finally {
        setIsLoadingRecipes(false)
      }
    }
    
    loadRecipes()
  }, [])

  // Sử dụng useMemo để cache filtered recipes
  const filteredRecipes = useMemo(() => {
    if (!mounted) return [];
    return getFilteredRecipes();
  }, [mounted, recipes, searchQuery, selectedCategory, selectedCuisine, getFilteredRecipes]);

  // Handle like/save changes from dialog - update recipe in store
  const handleLikeSaveChange = useCallback((recipeId: string, field: 'likesCount' | 'savesCount', newValue: number) => {
    console.log('[RecipeBrowser] handleLikeSaveChange:', { recipeId, field, newValue })
    
    // Update recipes in store
    const currentRecipes = useRecipeStore.getState().recipes
    const updatedRecipes = currentRecipes.map(recipe => 
      recipe.id === recipeId 
        ? { ...recipe, [field]: newValue }
        : recipe
    )
    useRecipeStore.setState({ recipes: updatedRecipes })
    
    // Also update selectedRecipe if it's the same recipe
    setSelectedRecipe(prev => 
      prev?.id === recipeId 
        ? { ...prev, [field]: newValue }
        : prev
    )
    
    // Force re-render of cards
    setLikeSaveRefreshKey(prev => prev + 1)
  }, [])

  const handleContributeClose = async () => {
    setIsContributeDialogOpen(false)
    // Reload recipes sau khi đóng góp - CHỈ lấy approved
    try {
      const res = await fetch('/api/recipes')
      const data = await res.json()
      if (data.success) {
        useRecipeStore.setState({ recipes: data.recipes })
      }
    } catch (error) {
      console.error('Error reloading recipes:', error)
    }
  }

  return (
    <div className="space-y-8">
      <Toaster position="top-right" />
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-balance">Khám Phá Công Thức Nấu Ăn</h2>
        <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
          Tìm kiếm và lưu lại những công thức nấu ăn yêu thích cho gia đình bạn
        </p>
        {isAuthenticated && (
          <div className="pt-2">
            <Button onClick={() => setIsContributeDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Đóng Góp Công Thức
            </Button>
          </div>
        )}
      </div>

      {/* AI Recommendations - Chỉ hiển thị khi KHÔNG tìm kiếm */}
      {isAuthenticated && user && !searchQuery && (
        <>
          {user.hasCompletedHealthProfile ? (
            <AIRecommendations
              userId={user.id}
              age={user.age}
              healthConditions={user.healthConditions}
              dietaryPreferences={user.dietaryPreferences}
            />
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              Vui lòng hoàn thành thông tin sức khỏe để nhận gợi ý món ăn phù hợp
            </div>
          )}
        </>
      )}

      {/* Filters - Moved below AI Recommendations */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.label}
              variant={selectedCategory === category.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.value)}
            >
              {category.label}
            </Button>
          ))}
        </div>

        <div className="w-px h-6 bg-border" />

        <div className="flex flex-wrap gap-2">
          {cuisines.map((cuisine) => (
            <Button
              key={cuisine.label}
              variant={selectedCuisine === cuisine.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCuisine(cuisine.value)}
            >
              {cuisine.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div id="all-recipes" className="text-center text-sm text-muted-foreground">
        {isLoadingRecipes ? 'Đang tải...' : `Tìm thấy ${filteredRecipes.length} công thức`}
      </div>

      {/* Recipe Grid */}
      {isLoadingRecipes ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.map((recipe) => (
            <RecipeCard 
              key={`${recipe.id}-${commentRefreshKey}-${likeSaveRefreshKey}`} 
              recipe={recipe} 
              onClick={() => setSelectedRecipe(recipe)} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không tìm thấy công thức nào phù hợp</p>
        </div>
      )}

      {/* Recipe Detail Dialog */}
      <RecipeDetailDialog 
        recipe={selectedRecipe} 
        onClose={() => setSelectedRecipe(null)}
        onCommentChange={() => setCommentRefreshKey(prev => prev + 1)}
        onLikeSaveChange={handleLikeSaveChange}
      />
      
      {/* Contribute Recipe Dialog */}
      <RecipeFormDialog 
        open={isContributeDialogOpen} 
        onClose={handleContributeClose} 
      />
    </div>
  )
}
