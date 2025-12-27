"use client"

import { memo, useState, useEffect } from "react"
import Image from "next/image"
import { Clock, Users, ChefHat, Heart, Bookmark, MessageCircle } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Recipe } from "@/lib/types"
import { useAuthStore } from "@/lib/auth-store"
import toast from "react-hot-toast"

interface RecipeCardProps {
  recipe: Recipe
  onClick: () => void
}

function RecipeCardComponent({ recipe, onClick }: RecipeCardProps) {
  const totalTime = recipe.prepTime + recipe.cookTime
  const { user, isAuthenticated, updateUser, getToken } = useAuthStore()
  
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [likesCount, setLikesCount] = useState(recipe.likesCount || 0)
  const [savesCount, setSavesCount] = useState(recipe.savesCount || 0)
  const [commentsCount, setCommentsCount] = useState(recipe.commentsCount || 0)
  const [isLiking, setIsLiking] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Sync state with user's liked/saved recipes
  useEffect(() => {
    if (user && recipe.id) {
      setIsLiked(user.likedRecipes?.includes(recipe.id) || false)
      setIsSaved(user.savedRecipes?.includes(recipe.id) || false)
    }
  }, [user, recipe.id, user?.likedRecipes, user?.savedRecipes])

  // Update counts when recipe changes
  useEffect(() => {
    setLikesCount(recipe.likesCount || 0)
    setSavesCount(recipe.savesCount || 0)
    setCommentsCount(recipe.commentsCount || 0)
  }, [recipe.likesCount, recipe.savesCount, recipe.commentsCount])

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thích công thức')
      return
    }

    if (isLiking) return
    setIsLiking(true)

    try {
      const token = getToken()
      console.log('Like recipe - token exists:', !!token, 'recipeId:', recipe.id)
      
      const response = await fetch('/api/user/like-recipe', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipeId: recipe.id }),
      })

      const data = await response.json()
      console.log('Like response:', data)
      
      if (data.success) {
        setIsLiked(data.isLiked)
        setLikesCount(data.likesCount)
        
        // Update user's liked recipes
        if (user) {
          updateUser({
            ...user,
            likedRecipes: data.likedRecipes
          })
        }
        
        toast.success(data.isLiked ? 'Đã thích công thức' : 'Đã bỏ thích')
      } else {
        console.error('Like error:', data.error)
        toast.error(data.error || 'Có lỗi xảy ra')
      }
    } catch (error) {
      console.error('Like error:', error)
      toast.error('Có lỗi xảy ra')
    } finally {
      setIsLiking(false)
    }
  }

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để lưu công thức')
      return
    }

    if (isSaving) return
    setIsSaving(true)

    try {
      const token = getToken()
      console.log('Save recipe - token exists:', !!token, 'recipeId:', recipe.id)
      
      const response = await fetch('/api/user/save-recipe', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipeId: recipe.id }),
      })

      const data = await response.json()
      console.log('Save response:', data)
      
      if (data.success) {
        setIsSaved(data.isSaved)
        setSavesCount(data.savesCount)
        
        // Update user's saved recipes
        if (user) {
          updateUser({
            ...user,
            savedRecipes: data.savedRecipes
          })
        }
        
        toast.success(data.isSaved ? 'Đã lưu công thức' : 'Đã bỏ lưu')
      } else {
        console.error('Save error:', data.error)
        toast.error(data.error || 'Có lỗi xảy ra')
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Có lỗi xảy ra')
    } finally {
      setIsSaving(false)
    }
  }

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

        {/* Like, Save and Comment buttons */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={isLiking}
            className="h-9 gap-1.5 hover:bg-red-50 hover:text-red-600"
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            <span className="text-sm font-medium">{likesCount}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-9 gap-1.5 hover:bg-blue-50 hover:text-blue-600"
          >
            <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-blue-500 text-blue-500' : ''}`} />
            <span className="text-sm font-medium">{savesCount}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClick}
            className="h-9 gap-1.5 hover:bg-primary/10 hover:text-primary"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{commentsCount}</span>
          </Button>
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

// Sử dụng memo để tránh re-render không cần thiết
export const RecipeCard = memo(RecipeCardComponent, (prevProps, nextProps) => {
  // Re-render khi recipe.id hoặc likesCount/savesCount/commentsCount thay đổi
  return prevProps.recipe.id === nextProps.recipe.id &&
         prevProps.recipe.likesCount === nextProps.recipe.likesCount &&
         prevProps.recipe.savesCount === nextProps.recipe.savesCount &&
         prevProps.recipe.commentsCount === nextProps.recipe.commentsCount
})

RecipeCard.displayName = 'RecipeCard'
