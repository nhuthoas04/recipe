"use client"

import Image from "next/image"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Recipe } from "@/lib/types"

interface MealSlotProps {
  label: string
  recipes?: Recipe[]
  onAdd: () => void
  onRemove: (index: number) => void
}

export function MealSlot({ label, recipes = [], onAdd, onRemove }: MealSlotProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <Button variant="ghost" size="sm" onClick={onAdd}>
              <Plus className="h-4 w-4 mr-1" />
              Thêm món
            </Button>
          </div>

          {recipes.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 min-h-[80px] text-muted-foreground">
              <p className="text-xs">Chưa có món ăn</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recipes.map((recipe, index) => {
                if (!recipe) {
                  console.error('Invalid recipe data at index:', index)
                  return null
                }
                
                // Tạo unique key ngay cả khi recipe.id không tồn tại
                const uniqueKey = recipe.id 
                  ? `${recipe.id}-${index}-${Date.now()}` 
                  : `recipe-${index}-${Date.now()}-${Math.random()}`
                
                const recipeName = recipe.name || 'Món ăn'
                const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0)
                const recipeImage = recipe.image || "/placeholder.svg"
                
                return (
                  <Card key={uniqueKey} className="relative overflow-hidden group">
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={() => onRemove(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>

                    <CardContent className="p-0">
                      <div className="flex gap-2 p-2">
                        <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden">
                          <Image 
                            src={recipeImage} 
                            alt={recipeName} 
                            fill 
                            className="object-cover" 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-2">{recipeName}</p>
                          {totalTime > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {totalTime} phút
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
