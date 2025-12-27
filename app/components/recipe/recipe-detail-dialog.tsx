"use client"

import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
import { X, Clock, Users, ChefHat, Plus, Send, Trash2, Edit2, MessageCircle, Heart, Bookmark, Reply, ThumbsUp, ChevronDown, ChevronUp } from "lucide-react"
import { AddToMealPlanDialog } from "@/components/meal/add-to-meal-plan-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import type { Recipe, Comment } from "@/lib/types"
import { useAuthStore } from "@/lib/auth-store"
import { useRecipeStore } from "@/lib/recipe-store"
import toast from "react-hot-toast"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"

interface RecipeDetailDialogProps {
  recipe: Recipe | null
  onClose: () => void
  onCommentChange?: (delta?: number) => void
  onLikeSaveChange?: (recipeId: string, field: 'likesCount' | 'savesCount', newValue: number) => void
}

export function RecipeDetailDialog({ recipe, onClose, onCommentChange, onLikeSaveChange }: RecipeDetailDialogProps) {
  const router = useRouter()
  const { user, isAuthenticated, updateUser, getToken } = useAuthStore()
  const updateRecipeCommentsCount = useRecipeStore((state) => state.updateRecipeCommentsCount)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [loading, setLoading] = useState(false)
  
  // Reply states
  const [replyingToId, setReplyingToId] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())
  
  // Like and Save states
  const [isLiked, setIsLiked] = useState(user?.likedRecipes?.includes(recipe?.id || '') || false)
  const [isSaved, setIsSaved] = useState(user?.savedRecipes?.includes(recipe?.id || '') || false)
  const [likesCount, setLikesCount] = useState(recipe?.likesCount || 0)
  const [savesCount, setSavesCount] = useState(recipe?.savesCount || 0)
  const [isLiking, setIsLiking] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // Add to meal plan dialog state
  const [showMealPlanDialog, setShowMealPlanDialog] = useState(false)

  // Load comments and update like/save states
  useEffect(() => {
    if (recipe?.id) {
      loadComments()
      setIsLiked(user?.likedRecipes?.includes(recipe.id) || false)
      setIsSaved(user?.savedRecipes?.includes(recipe.id) || false)
    }
  }, [recipe?.id, user?.likedRecipes, user?.savedRecipes])

  // Sync likesCount and savesCount with recipe prop (from parent)
  useEffect(() => {
    if (recipe) {
      setLikesCount(recipe.likesCount || 0)
      setSavesCount(recipe.savesCount || 0)
    }
  }, [recipe?.id, recipe?.likesCount, recipe?.savesCount])

  const loadComments = async () => {
    if (!recipe?.id) return
    console.log('[RecipeDetailDialog] Loading comments for recipeId:', recipe.id)
    try {
      const res = await fetch(`/api/comments?recipeId=${recipe.id}`)
      const data = await res.json()
      console.log('[RecipeDetailDialog] Comments response:', data)
      if (data.success) {
        setComments(data.comments)
      }
    } catch (error) {
      console.error("Error loading comments:", error)
    }
  }

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để thích công thức')
      return
    }

    if (isLiking) return
    setIsLiking(true)

    try {
      const token = getToken()
      console.log('[Dialog] Like request - recipeId:', recipe?.id, 'token exists:', !!token)
      
      const response = await fetch('/api/user/like-recipe', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipeId: recipe?.id }),
      })

      const data = await response.json()
      console.log('[Dialog] Like response:', data)
      
      if (data.success) {
        console.log('[Dialog] Updating likesCount to:', data.likesCount)
        setIsLiked(data.isLiked)
        setLikesCount(data.likesCount)
        
        if (user) {
          updateUser({
            ...user,
            likedRecipes: data.likedRecipes
          })
        }
        
        // Update parent component (AI Recommendations)
        if (recipe?.id) {
          onLikeSaveChange?.(recipe.id, 'likesCount', data.likesCount)
        }
        
        toast.success(data.isLiked ? 'Đã thích công thức' : 'Đã bỏ thích')
      } else {
        toast.error(data.error || 'Có lỗi xảy ra')
      }
    } catch (error) {
      console.error('Like error:', error)
      toast.error('Có lỗi xảy ra')
    } finally {
      setIsLiking(false)
    }
  }

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập để lưu công thức')
      return
    }

    if (isSaving) return
    setIsSaving(true)

    try {
      const token = getToken()
      const response = await fetch('/api/user/save-recipe', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ recipeId: recipe?.id }),
      })

      const data = await response.json()
      
      if (data.success) {
        setIsSaved(data.isSaved)
        setSavesCount(data.savesCount)
        
        if (user) {
          updateUser({
            ...user,
            savedRecipes: data.savedRecipes
          })
        }
        
        // Update parent component (AI Recommendations)
        if (recipe?.id) {
          onLikeSaveChange?.(recipe.id, 'savesCount', data.savesCount)
        }
        
        toast.success(data.isSaved ? 'Đã lưu công thức' : 'Đã bỏ lưu')
      } else {
        toast.error(data.error || 'Có lỗi xảy ra')
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Có lỗi xảy ra')
    } finally {
      setIsSaving(false)
    }
  }
  
  if (!recipe) return null

  const totalTime = recipe.prepTime + recipe.cookTime

  const handleAddToMealPlan = () => {
    setShowMealPlanDialog(true)
  }

  // Like comment handler
  const handleLikeComment = async (commentId: string, isReply: boolean = false, parentId?: string) => {
    if (!isAuthenticated || !user) {
      toast.error("Vui lòng đăng nhập để thích bình luận")
      return
    }

    try {
      const res = await fetch("/api/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId,
          userId: user.id,
        }),
      })

      const data = await res.json()
      if (data.success) {
        // Update comments state
        setComments(prevComments => 
          prevComments.map(comment => {
            if (comment.id === commentId) {
              // Update parent comment
              const newLikes = data.isLiked 
                ? [...(comment.likes || []), user.id]
                : (comment.likes || []).filter(id => id !== user.id)
              return { ...comment, likes: newLikes, likesCount: data.likesCount }
            }
            if (comment.replies) {
              // Update reply in parent comment
              return {
                ...comment,
                replies: comment.replies.map(reply => 
                  reply.id === commentId 
                    ? { 
                        ...reply, 
                        likes: data.isLiked 
                          ? [...(reply.likes || []), user.id]
                          : (reply.likes || []).filter(id => id !== user.id),
                        likesCount: data.likesCount 
                      }
                    : reply
                )
              }
            }
            return comment
          })
        )
      }
    } catch (error) {
      console.error("Like error:", error)
      toast.error("Có lỗi xảy ra")
    }
  }

  // Reply to comment handler
  const handleSubmitReply = async (parentId: string) => {
    if (!isAuthenticated || !user) {
      toast.error("Vui lòng đăng nhập để trả lời")
      return
    }

    if (!replyContent.trim()) {
      toast.error("Vui lòng nhập nội dung trả lời")
      return
    }

    setLoading(true)
    const loadingToast = toast.loading("Đang gửi trả lời...")

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId: recipe.id,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          content: replyContent,
          parentId: parentId,
        }),
      })

      const data = await res.json()
      if (data.success) {
        // Add reply to parent comment
        setComments(prevComments =>
          prevComments.map(comment =>
            comment.id === parentId
              ? { ...comment, replies: [...(comment.replies || []), data.comment] }
              : comment
          )
        )
        setReplyContent("")
        setReplyingToId(null)
        // Auto expand replies
        setExpandedReplies(prev => new Set(prev).add(parentId))
        toast.success("Đã gửi trả lời!", { id: loadingToast })
        // Update comment count in store for real-time UI update
        if (recipe?.id) {
          updateRecipeCommentsCount(recipe.id, 1)
        }
        // Trigger refresh for parent component
        onCommentChange?.(1)
      } else {
        toast.error(data.error || "Lỗi khi gửi trả lời", { id: loadingToast })
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi", { id: loadingToast })
    } finally {
      setLoading(false)
    }
  }

  // Toggle replies visibility
  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })
  }

  const handleSubmitComment = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Vui lòng đăng nhập để bình luận")
      return
    }

    if (!newComment.trim()) {
      toast.error("Vui lòng nhập nội dung bình luận")
      return
    }

    setLoading(true)
    const loadingToast = toast.loading("Đang gửi bình luận...")

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId: recipe.id,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          content: newComment,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setComments([{ ...data.comment, replies: [] }, ...comments])
        setNewComment("")
        toast.success("Đã gửi bình luận!", { id: loadingToast })
        // Update comment count in store for real-time UI update
        if (recipe?.id) {
          updateRecipeCommentsCount(recipe.id, 1)
        }
        // Trigger refresh for parent component
        onCommentChange?.(1)
      } else {
        toast.error(data.error || "Lỗi khi gửi bình luận", { id: loadingToast })
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi", { id: loadingToast })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Bạn có chắc muốn xóa bình luận này?")) return

    const loadingToast = toast.loading("Đang xóa...")

    try {
      const isAdmin = user?.email === "admin@recipe.com"
      console.log("Delete comment attempt:", { 
        commentId, 
        userId: user?.id, 
        userEmail: user?.email,
        isAdmin 
      })
      
      const res = await fetch(`/api/comments?id=${commentId}&userId=${user?.id}&userEmail=${user?.email}`, {
        method: "DELETE",
      })

      const data = await res.json()
      console.log("Delete response:", data)
      
      if (data.success) {
        // Remove comment or reply from state
        setComments(prevComments => 
          prevComments
            .filter((c) => c.id !== commentId) // Remove parent comment
            .map(comment => ({
              ...comment,
              replies: comment.replies?.filter(r => r.id !== commentId) // Remove reply
            }))
        )
        toast.success("Đã xóa bình luận!", { id: loadingToast })
        // Update comment count in store for real-time UI update
        if (recipe?.id) {
          updateRecipeCommentsCount(recipe.id, -1)
        }
        // Trigger refresh for parent component with delta -1 (delete)
        onCommentChange?.(-1)
      } else {
        toast.error(data.error || "Lỗi khi xóa bình luận", { id: loadingToast })
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast.error("Đã xảy ra lỗi", { id: loadingToast })
    }
  }

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) {
      toast.error("Vui lòng nhập nội dung")
      return
    }

    const loadingToast = toast.loading("Đang cập nhật...")

    try {
      const res = await fetch("/api/comments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId,
          userId: user?.id,
          content: editContent,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setComments(
          comments.map((c) =>
            c.id === commentId ? { ...c, content: editContent, updatedAt: new Date() } : c
          )
        )
        setEditingCommentId(null)
        setEditContent("")
        toast.success("Đã cập nhật bình luận!", { id: loadingToast })
      } else {
        toast.error(data.error || "Lỗi khi cập nhật", { id: loadingToast })
      }
    } catch (error) {
      toast.error("Đã xảy ra lỗi", { id: loadingToast })
    }
  }

  return (
    <Dialog open={!!recipe} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] w-[90vw] max-h-[90vh] p-0 gap-0" showCloseButton={false}>
        <div className="grid grid-cols-[minmax(600px,1fr)_400px] h-[90vh]">
          {/* Left: Recipe Details - Minimum 600px width */}
          <div className="overflow-hidden border-r bg-background">
            <ScrollArea className="h-full">
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
                
                {/* Like and Save buttons */}
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    variant="outline"
                    size="default"
                    onClick={handleLike}
                    disabled={isLiking}
                    className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  >
                    <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span className="font-medium">{likesCount} Thích</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="default"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="gap-2 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                  >
                    <Bookmark className={`h-5 w-5 ${isSaved ? 'fill-blue-500 text-blue-500' : ''}`} />
                    <span className="font-medium">{savesCount} Lưu</span>
                  </Button>
                </div>
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

            {/* Thông tin sức khỏe */}
            {(recipe.healthTags || recipe.suitableFor || recipe.notSuitableFor) && (
              <div className="rounded-lg border bg-purple-50/50 p-4 space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  Thông Tin Sức Khỏe
                </h3>

                {/* Đặc điểm dinh dưỡng */}
                {recipe.healthTags && recipe.healthTags.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Đặc điểm dinh dưỡng
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recipe.healthTags.map((tag) => (
                        <Badge key={tag} variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Phù hợp cho */}
                {recipe.suitableFor && recipe.suitableFor.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-green-700 mb-2">
                      ✓ Phù hợp cho
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recipe.suitableFor.map((tag) => (
                        <Badge key={tag} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Không phù hợp cho */}
                {recipe.notSuitableFor && recipe.notSuitableFor.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-green-700 mb-2">
                      ✗ Không phù hợp cho
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {recipe.notSuitableFor.map((tag) => (
                        <Badge key={tag} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

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
          </div>

          {/* Right: Comments Section - Fixed 400px */}
          <div className="flex flex-col bg-background">
            <div className="p-4 border-b bg-muted/30">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Bình luận ({comments.length + comments.reduce((acc, c) => acc + (c.replies?.length || 0), 0)})
              </h3>
            </div>

            {/* Comments List */}
            <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12">
                  <MessageCircle className="h-16 w-16 mb-3 opacity-20" />
                  <p className="text-sm font-medium">Chưa có bình luận nào</p>
                  <p className="text-xs mt-1">Hãy là người đầu tiên bình luận!</p>
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                            {comment.userName.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{comment.userName}</p>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.createdAt), {
                                addSuffix: true,
                                locale: vi,
                              })}
                              {comment.updatedAt && <span className="ml-1">(đã sửa)</span>}
                            </span>
                          </div>
                        </div>
                      </div>

                      {isAuthenticated && user && (
                        <>
                          {/* Chỉ chủ comment mới thấy nút sửa */}
                          {comment.userId === user.id && (
                            <div className="flex gap-1 shrink-0">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 hover:bg-primary/10"
                                onClick={() => {
                                  setEditingCommentId(comment.id)
                                  setEditContent(comment.content)
                                }}
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteComment(comment.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          )}
                          
                          {/* Admin thấy nút xóa cho tất cả comment (nhưng không sửa được) */}
                          {comment.userId !== user.id && user.email === "admin@recipe.com" && (
                            <div className="flex gap-1 shrink-0">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteComment(comment.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {editingCommentId === comment.id ? (
                      <div className="mt-2 space-y-2">
                        <Input
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          placeholder="Sửa bình luận..."
                          className="text-sm"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleEditComment(comment.id)}
                          >
                            Lưu
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingCommentId(null)
                              setEditContent("")
                            }}
                          >
                            Hủy
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm mt-2 break-words">{comment.content}</p>
                        
                        {/* Like and Reply buttons */}
                        <div className="flex items-center gap-3 mt-2 pt-2 border-t border-muted">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-7 gap-1 text-xs ${
                              comment.likes?.includes(user?.id || '') 
                                ? 'text-blue-600' 
                                : 'text-muted-foreground'
                            }`}
                            onClick={() => handleLikeComment(comment.id)}
                          >
                            <ThumbsUp className={`h-3.5 w-3.5 ${
                              comment.likes?.includes(user?.id || '') ? 'fill-blue-600' : ''
                            }`} />
                            <span>Thích</span>
                            {(comment.likesCount || 0) > 0 && (
                              <span className="ml-0.5">({comment.likesCount})</span>
                            )}
                          </Button>
                          
                          {isAuthenticated && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 text-xs text-muted-foreground"
                              onClick={() => {
                                setReplyingToId(replyingToId === comment.id ? null : comment.id)
                                setReplyContent("")
                              }}
                            >
                              <Reply className="h-3.5 w-3.5" />
                              <span>Trả lời</span>
                            </Button>
                          )}
                          
                          {/* Show replies toggle */}
                          {comment.replies && comment.replies.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 gap-1 text-xs text-primary"
                              onClick={() => toggleReplies(comment.id)}
                            >
                              {expandedReplies.has(comment.id) ? (
                                <>
                                  <ChevronUp className="h-3.5 w-3.5" />
                                  <span>Ẩn {comment.replies.length} phản hồi</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-3.5 w-3.5" />
                                  <span>Xem {comment.replies.length} phản hồi</span>
                                </>
                              )}
                            </Button>
                          )}
                        </div>

                        {/* Reply Input */}
                        {replyingToId === comment.id && (
                          <div className="mt-2 pl-4 border-l-2 border-primary/30">
                            <div className="flex gap-2">
                              <Input
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder={`Trả lời ${comment.userName}...`}
                                className="text-sm h-8"
                                onKeyPress={(e) => {
                                  if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSubmitReply(comment.id)
                                  }
                                }}
                              />
                              <Button
                                size="sm"
                                className="h-8 px-3"
                                onClick={() => handleSubmitReply(comment.id)}
                                disabled={loading || !replyContent.trim()}
                              >
                                <Send className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Nested Replies */}
                        {expandedReplies.has(comment.id) && comment.replies && comment.replies.length > 0 && (
                          <div className="mt-3 pl-4 border-l-2 border-muted space-y-2">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="p-2 rounded-lg bg-background/50">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-xs font-bold">
                                      {reply.userName.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-xs">{reply.userName}</p>
                                      <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(reply.createdAt), {
                                          addSuffix: true,
                                          locale: vi,
                                        })}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Delete button for reply owner or admin */}
                                  {isAuthenticated && user && (
                                    (reply.userId === user.id || user.email === "admin@recipe.com") && (
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6 text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDeleteComment(reply.id)}
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    )
                                  )}
                                </div>
                                
                                <p className="text-sm mt-1 break-words">{reply.content}</p>
                                
                                {/* Like reply button and Reply button */}
                                <div className="flex items-center gap-2 mt-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-6 gap-1 text-xs ${
                                      reply.likes?.includes(user?.id || '') 
                                        ? 'text-blue-600' 
                                        : 'text-muted-foreground'
                                    }`}
                                    onClick={() => handleLikeComment(reply.id, true, comment.id)}
                                  >
                                    <ThumbsUp className={`h-3 w-3 ${
                                      reply.likes?.includes(user?.id || '') ? 'fill-blue-600' : ''
                                    }`} />
                                    <span>Thích</span>
                                    {(reply.likesCount || 0) > 0 && (
                                      <span className="ml-0.5">({reply.likesCount})</span>
                                    )}
                                  </Button>
                                  
                                  {/* Reply to reply button - mention user name */}
                                  {isAuthenticated && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 gap-1 text-xs text-muted-foreground"
                                      onClick={() => {
                                        setReplyingToId(comment.id)
                                        setReplyContent(`@${reply.userName} `)
                                      }}
                                    >
                                      <Reply className="h-3 w-3" />
                                      <span>Trả lời</span>
                                    </Button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))
              )}
              </div>
            </ScrollArea>

            {/* Comment Input */}
            <div className="p-4 border-t bg-background">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Viết bình luận..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmitComment()
                      }
                    }}
                    disabled={loading}
                  />
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={handleSubmitComment}
                    disabled={loading || !newComment.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Gửi
                  </Button>
                </div>
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  <p>Vui lòng đăng nhập để bình luận</p>
                  <Button
                    size="sm"
                    variant="link"
                    onClick={() => {
                      onClose()
                      router.push("/login")
                    }}
                  >
                    Đăng nhập
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
      
      {/* Add to Meal Plan Dialog */}
      <AddToMealPlanDialog
        open={showMealPlanDialog}
        onClose={() => setShowMealPlanDialog(false)}
        recipe={recipe}
      />
    </Dialog>
  )
}
