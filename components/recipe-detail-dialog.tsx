"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { X, Clock, Users, ChefHat, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import type { Recipe } from "@/lib/types"

interface RecipeDetailDialogProps {
  recipe: Recipe | null
  onClose: () => void
}

export function RecipeDetailDialog({ recipe, onClose }: RecipeDetailDialogProps) {
  const router = useRouter()
  
  if (!recipe) return null

  const totalTime = recipe.prepTime + recipe.cookTime

  const handleAddToMealPlan = () => {
    onClose()
    router.push("/meal-planner")
  }

  return (
    <Dialog open={!!recipe} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0" showCloseButton={false}>
        <ScrollArea className="max-h-[90vh]">
          <div className="relative aspect-[16/9] w-full">
            <Image src={recipe.image || "/placeholder.svg"} alt={recipe.name} fill className="object-cover" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-background/80 backdrop-blur hover:bg-background z-10"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            <DialogHeader>
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <DialogTitle className="text-3xl font-bold text-balance">{recipe.name}</DialogTitle>
                  <Badge variant="secondary">{recipe.cuisine}</Badge>
                </div>
                <p className="text-muted-foreground text-pretty">{recipe.description}</p>
              </div>
            </DialogHeader>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  <strong>Tổng thời gian:</strong> {totalTime} phút
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  <strong>Khẩu phần:</strong> {recipe.servings} người
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ChefHat className="h-4 w-4 text-muted-foreground" />
                <span>
                  <strong>Độ khó:</strong> {recipe.difficulty}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            <Separator />

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold">Nguyên Liệu</h3>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-1">•</span>
                      <span>
                        <strong>{ingredient.name}:</strong> {ingredient.amount} {ingredient.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {recipe.nutrition && (
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold">Dinh Dưỡng</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Calories</p>
                      <p className="text-lg font-semibold">{recipe.nutrition.calories} kcal</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Protein</p>
                      <p className="text-lg font-semibold">{recipe.nutrition.protein}g</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Carbs</p>
                      <p className="text-lg font-semibold">{recipe.nutrition.carbs}g</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Chất béo</p>
                      <p className="text-lg font-semibold">{recipe.nutrition.fat}g</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="text-xl font-semibold">Cách Làm</h3>
              <ol className="space-y-3">
                {recipe.instructions.map((instruction, index) => (
                  <li key={index} className="flex gap-3 text-sm">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleAddToMealPlan}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm Vào Thực Đơn
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
