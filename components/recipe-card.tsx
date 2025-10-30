"use client"

import Image from "next/image"
import { Clock, Users, ChefHat } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Recipe } from "@/lib/types"

interface RecipeCardProps {
  recipe: Recipe
  onClick: () => void
}

export function RecipeCard({ recipe, onClick }: RecipeCardProps) {
  const totalTime = recipe.prepTime + recipe.cookTime

  return (
    <Card className="cursor-pointer overflow-hidden transition-all hover:shadow-lg" onClick={onClick}>
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={recipe.image || "/placeholder.svg"}
          alt={recipe.name}
          fill
          className="object-cover transition-transform hover:scale-105"
        />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur">
            {recipe.cuisine}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-2">
        <h3 className="font-semibold text-lg line-clamp-1">{recipe.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>{totalTime} phút</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>{recipe.servings} người</span>
          </div>
          <div className="flex items-center gap-1">
            <ChefHat className="h-3.5 w-3.5" />
            <span>{recipe.difficulty}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex flex-wrap gap-1">
          {recipe.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardFooter>
    </Card>
  )
}
