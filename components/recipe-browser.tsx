"use client"

import { useState, useEffect } from "react"
import { Search, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RecipeCard } from "@/components/recipe-card"
import { RecipeDetailDialog } from "@/components/recipe-detail-dialog"
import { RecipeFormDialog } from "@/components/recipe-form-dialog"
import { useRecipeStore } from "@/lib/recipe-store"
import { useAuthStore } from "@/lib/auth-store"
import type { Recipe } from "@/lib/types"

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
  const { isAuthenticated } = useAuthStore()
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedCuisine,
    setSelectedCuisine,
    getFilteredRecipes,
  } = useRecipeStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredRecipes = mounted ? getFilteredRecipes() : []

  const handleContributeClose = async () => {
    setIsContributeDialogOpen(false)
    // Reload recipes sau khi đóng góp
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

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm món ăn, nguyên liệu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>

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
      </div>

      {/* Results Count */}
      <div className="text-center text-sm text-muted-foreground">Tìm thấy {filteredRecipes.length} công thức</div>

      {/* Recipe Grid */}
      {filteredRecipes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onClick={() => setSelectedRecipe(recipe)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không tìm thấy công thức nào phù hợp</p>
        </div>
      )}

      {/* Recipe Detail Dialog */}
      <RecipeDetailDialog recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      
      {/* Contribute Recipe Dialog */}
      <RecipeFormDialog 
        open={isContributeDialogOpen} 
        onClose={handleContributeClose} 
      />
    </div>
  )
}
