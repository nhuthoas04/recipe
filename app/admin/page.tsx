"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Search, CheckCircle, XCircle, Clock, Users } from "lucide-react"
import { RecipeFormDialog } from "@/components/recipe-form-dialog"
import { useRecipeStore } from "@/lib/recipe-store"
import type { Recipe } from "@/lib/types"

type TabType = "all" | "pending" | "approved" | "rejected" | "users"

export default function AdminPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const { recipes } = useRecipeStore()
  
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>("all")
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([])
  const [usersList, setUsersList] = useState<any[]>([])

  // Load ALL recipes (including pending) từ API khi component mount
  useEffect(() => {
    const loadRecipes = async () => {
      try {
        const res = await fetch('/api/recipes?includeAll=true')
        const data = await res.json()
        if (data.success) {
          setAllRecipes(data.recipes)
          useRecipeStore.setState({ recipes: data.recipes })
        }
      } catch (error) {
        console.error('Error loading recipes:', error)
      } finally {
        setLoading(false)
      }
    }
    loadRecipes()
  }, [])

  // Load users khi chuyển sang tab users
  useEffect(() => {
    if (activeTab === "users") {
      const loadUsers = async () => {
        try {
          const res = await fetch('/api/users')
          const data = await res.json()
          if (data.success) {
            setUsersList(data.users)
          }
        } catch (error) {
          console.error('Error loading users:', error)
        }
      }
      loadUsers()
    }
  }, [activeTab])

  // Redirect if not authenticated or not admin
  if (!isAuthenticated || user?.email !== "admin@recipe.com") {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Truy cập bị từ chối</CardTitle>
              <CardDescription>Bạn không có quyền truy cập trang này</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/")} className="w-full">
                Về trang chủ
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  // Filter recipes theo tab và search
  const filteredRecipes = allRecipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (activeTab === "all") return matchesSearch
    if (activeTab === "pending") return matchesSearch && recipe.status === "pending"
    if (activeTab === "approved") return matchesSearch && (recipe.status === "approved" || !recipe.status)
    if (activeTab === "rejected") return matchesSearch && recipe.status === "rejected"
    
    return matchesSearch
  })

  const pendingCount = allRecipes.filter(r => r.status === "pending").length
  const approvedCount = allRecipes.filter(r => r.status === "approved" || !r.status).length
  const rejectedCount = allRecipes.filter(r => r.status === "rejected").length

  const handleAddRecipe = () => {
    setEditingRecipe(null)
    setIsDialogOpen(true)
  }

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe(recipe)
    setIsDialogOpen(true)
  }

  const handleDeleteRecipe = async (recipeId: string) => {
    if (!confirm("Bạn có chắc muốn xóa công thức này?")) return

    try {
      const response = await fetch(`/api/recipes?id=${recipeId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        // Update store để xóa recipe khỏi danh sách
        const updatedRecipes = recipes.filter(r => r.id !== recipeId)
        useRecipeStore.setState({ recipes: updatedRecipes })
        alert("Đã xóa công thức thành công!")
      } else {
        alert("Lỗi khi xóa công thức")
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert("Đã xảy ra lỗi")
    }
  }

  const handleDialogClose = async () => {
    setIsDialogOpen(false)
    setEditingRecipe(null)
    
    // Reload recipes từ API sau khi thêm/sửa
    try {
      const res = await fetch('/api/recipes?includeAll=true')
      const data = await res.json()
      if (data.success) {
        setAllRecipes(data.recipes)
        useRecipeStore.setState({ recipes: data.recipes })
      }
    } catch (error) {
      console.error('Error reloading recipes:', error)
    }
  }

  const handleReviewRecipe = async (recipeId: string, action: "approve" | "reject") => {
    const note = action === "reject" ? prompt("Lý do từ chối (tùy chọn):") : ""
    
    try {
      const response = await fetch('/api/recipes/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeId, action, note }),
      })

      if (response.ok) {
        alert(action === "approve" ? "Đã duyệt công thức!" : "Đã từ chối công thức!")
        // Reload recipes
        const res = await fetch('/api/recipes?includeAll=true')
        const data = await res.json()
        if (data.success) {
          setAllRecipes(data.recipes)
        }
      } else {
        alert("Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Review error:", error)
      alert("Đã xảy ra lỗi")
    }
  }

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, updates: { isActive: !isActive } }),
      })

      if (response.ok) {
        alert(isActive ? "Đã khóa tài khoản!" : "Đã mở khóa tài khoản!")
        // Reload users
        const res = await fetch('/api/users')
        const data = await res.json()
        if (data.success) {
          setUsersList(data.users)
        }
      } else {
        alert("Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Toggle user error:", error)
      alert("Đã xảy ra lỗi")
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Bạn có chắc muốn xóa người dùng này?")) return

    try {
      const response = await fetch(`/api/users?userId=${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert("Đã xóa người dùng!")
        // Reload users
        const res = await fetch('/api/users')
        const data = await res.json()
        if (data.success) {
          setUsersList(data.users)
        }
      } else {
        const data = await response.json()
        alert(data.error || "Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Delete user error:", error)
      alert("Đã xảy ra lỗi")
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Quản Trị Hệ Thống</h1>
            <p className="text-muted-foreground">
              Quản lý công thức, kiểm duyệt bài viết và người dùng
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b">
            <Button
              variant={activeTab === "all" ? "default" : "ghost"}
              onClick={() => setActiveTab("all")}
              className="rounded-b-none"
            >
              Tất Cả ({allRecipes.length})
            </Button>
            <Button
              variant={activeTab === "pending" ? "default" : "ghost"}
              onClick={() => setActiveTab("pending")}
              className="rounded-b-none"
            >
              <Clock className="h-4 w-4 mr-2" />
              Chờ Duyệt ({pendingCount})
            </Button>
            <Button
              variant={activeTab === "approved" ? "default" : "ghost"}
              onClick={() => setActiveTab("approved")}
              className="rounded-b-none"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Đã Duyệt ({approvedCount})
            </Button>
            <Button
              variant={activeTab === "rejected" ? "default" : "ghost"}
              onClick={() => setActiveTab("rejected")}
              className="rounded-b-none"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Từ Chối ({rejectedCount})
            </Button>
            <Button
              variant={activeTab === "users" ? "default" : "ghost"}
              onClick={() => setActiveTab("users")}
              className="rounded-b-none"
            >
              <Users className="h-4 w-4 mr-2" />
              Người Dùng
            </Button>
          </div>

          {/* Search (chỉ hiện khi không phải tab users) */}
          {activeTab !== "users" && (
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm công thức..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Recipe List hoặc User List */}
          {activeTab === "users" ? (
            <Card>
              <CardHeader>
                <CardTitle>Quản Lý Người Dùng</CardTitle>
                <CardDescription>
                  {usersList.length} người dùng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usersList.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold">{user.email}</h3>
                        <p className="text-sm text-muted-foreground">
                          Đăng ký: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                        {user.isActive === false && (
                          <Badge variant="destructive" className="mt-1">Đã khóa</Badge>
                        )}
                      </div>
                      {user.email !== "admin@recipe.com" && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleUserStatus(user.id, user.isActive !== false)}
                          >
                            {user.isActive !== false ? "Khóa" : "Mở khóa"}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  {usersList.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      Chưa có người dùng nào
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Danh Sách Công Thức</CardTitle>
                <CardDescription>
                  {filteredRecipes.length} công thức
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredRecipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center text-2xl">
                          🍽️
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{recipe.name}</h3>
                            {recipe.status === "pending" && (
                              <Badge variant="outline" className="bg-yellow-50">
                                <Clock className="h-3 w-3 mr-1" />
                                Chờ duyệt
                              </Badge>
                            )}
                            {recipe.status === "approved" && (
                              <Badge variant="outline" className="bg-green-50">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Đã duyệt
                              </Badge>
                            )}
                            {recipe.status === "rejected" && (
                              <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
                                Từ chối
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {recipe.description}
                          </p>
                          {recipe.authorEmail && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Đăng bởi: {recipe.authorEmail}
                            </p>
                          )}
                          <div className="flex gap-2 mt-1">
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                              {recipe.category}
                            </span>
                            <span className="text-xs bg-secondary px-2 py-1 rounded">
                              {recipe.cuisine}
                            </span>
                            <span className="text-xs bg-muted px-2 py-1 rounded">
                              {recipe.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {recipe.status === "pending" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              onClick={() => handleReviewRecipe(recipe.id, "approve")}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Duyệt
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => handleReviewRecipe(recipe.id, "reject")}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Từ chối
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditRecipe(recipe)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteRecipe(recipe.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {filteredRecipes.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      Không tìm thấy công thức nào
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <RecipeFormDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        recipe={editingRecipe}
      />
    </div>
  )
}
