"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { User, Mail, Calendar, Clock, CheckCircle, XCircle, Edit, X, Heart, Bookmark } from "lucide-react"
import type { Recipe } from "@/lib/types"
import toast, { Toaster } from 'react-hot-toast'
import { RecipeCard } from "@/components/recipe/recipe-card"
import { RecipeDetailDialog } from "@/components/recipe/recipe-detail-dialog"

const HEALTH_CONDITIONS = [
  "Tiểu đường",
  "Cao huyết áp",
  "Cholesterol cao",
  "Dị ứng hải sản",
  "Dị ứng đậu phộng",
  "Dị ứng gluten",
  "Bệnh tim",
  "Bệnh thận",
  "Béo phì",
  "Gầy",
  "Người mỡ máu cao",
  "Bệnh Gout",
  "Viêm loét dạ dày",
  "Bệnh gan",
  "Đang dùng thuốc chống đông máu",
  "Trẻ dưới 1 tuổi",
  "Người sau phẫu thuật tiêu hóa",
]

const DIETARY_PREFERENCES = [
  "Ăn chay",
  "Ít đường",
  "Ít muối",
  "Ít dầu mỡ",
  "Giàu protein",
  "Giàu đạm",
  "Giàu chất xơ",
  "Ít đạm",
  "Không cay",
  "Không rượu bia",
  "Ít calo",
  "Giàu calo",
  "Nhiều vitamin",
  "Giàu canxi",
  "Giàu sắt",
  "Giàu omega-3",
  "Không cholesterol",
  "Không lactose",
  "Ít natri",
  "Giàu kali",
  "Giàu chất chống oxy hóa",
]

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, updateUser } = useAuthStore()
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([])
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([])
  const [likedRecipes, setLikedRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditingHealth, setIsEditingHealth] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  
  // Health profile edit state
  const [editAge, setEditAge] = useState<number>(user?.age || 0)
  const [editHealthConditions, setEditHealthConditions] = useState<string[]>(user?.healthConditions || [])
  const [editDietaryPreferences, setEditDietaryPreferences] = useState<string[]>(user?.dietaryPreferences || [])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Redirect admin về trang admin, không cho vào profile
    if (user?.email === "admin@recipe.com") {
      router.push("/admin")
      return
    }

    // Reset edit state when user changes
    if (user) {
      setEditAge(user.age || 0)
      setEditHealthConditions(user.healthConditions || [])
      setEditDietaryPreferences(user.dietaryPreferences || [])
    }

    // Load recipes của user
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token')
        console.log('Profile loading data, token exists:', !!token)
        
        // Load my recipes
        const res = await fetch(`/api/recipes?includeAll=true`)
        const data = await res.json()
        if (data.success) {
          const userRecipes = data.recipes.filter((r: Recipe) => r.authorEmail === user?.email)
          setMyRecipes(userRecipes)
        }

        // Load saved recipes
        if (token) {
          console.log('Loading saved recipes...')
          const savedRes = await fetch('/api/user/saved-recipes', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          const savedData = await savedRes.json()
          console.log('Saved recipes response:', savedData)
          if (savedData.success && savedData.recipes) {
            setSavedRecipes(savedData.recipes)
          }

          // Load liked recipes
          console.log('Loading liked recipes...')
          const likedRes = await fetch('/api/user/liked-recipes', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          const likedData = await likedRes.json()
          console.log('Liked recipes response:', likedData)
          if (likedData.success && likedData.recipes) {
            setLikedRecipes(likedData.recipes)
          }
        } else {
          console.warn('No token found, cannot load saved/liked recipes')
        }
      } catch (error) {
        console.error('Error loading recipes:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [isAuthenticated, user, router])

  const handleSaveHealthProfile = async () => {
    if (!user?.email) return

    if (editAge < 1 || editAge > 120) {
      toast.error("Tuổi phải từ 1 đến 120")
      return
    }

    try {
      // Gọi Next.js API route (sẽ forward đến backend trong Docker)
      const res = await fetch('/api/users/health-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: user.email,
          age: editAge,
          healthConditions: editHealthConditions,
          dietaryPreferences: editDietaryPreferences,
        }),
      })

      const data = await res.json()
      if (data.success) {
        // Cập nhật auth store với thông tin mới
        updateUser({
          ...user,
          age: editAge,
          healthConditions: editHealthConditions,
          dietaryPreferences: editDietaryPreferences,
          hasCompletedHealthProfile: true,
        })
        setIsEditingHealth(false)
        toast.success("Cập nhật thông tin sức khỏe thành công! Gợi ý món ăn sẽ được cập nhật.")
        
        // Chuyển về trang chủ để xem gợi ý mới
        setTimeout(() => {
          router.push("/")
        }, 1500)
      } else {
        toast.error(data.error || "Có lỗi xảy ra")
      }
    } catch (error) {
      console.error('Error updating health profile:', error)
      toast.error("Có lỗi xảy ra khi kết nối server")
    }
  }

  const toggleHealthCondition = (condition: string) => {
    setEditHealthConditions(prev =>
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    )
  }

  const toggleDietaryPreference = (preference: string) => {
    setEditDietaryPreferences(prev =>
      prev.includes(preference)
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const pendingCount = myRecipes.filter(r => r.status === "pending").length
  const approvedCount = myRecipes.filter(r => r.status === "approved").length
  const rejectedCount = myRecipes.filter(r => r.status === "rejected").length

  const getStatusBadge = (status?: string) => {
    if (status === "pending") {
      return (
        <Badge variant="outline" className="bg-yellow-50">
          <Clock className="h-3 w-3 mr-1" />
          Chờ duyệt
        </Badge>
      )
    }
    if (status === "approved") {
      return (
        <Badge variant="outline" className="bg-green-50">
          <CheckCircle className="h-3 w-3 mr-1" />
          Đã duyệt
        </Badge>
      )
    }
    if (status === "rejected") {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Từ chối
        </Badge>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen">
      <Toaster position="top-right" />
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6 max-w-6xl mx-auto">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Trang Cá Nhân</h1>
            <p className="text-muted-foreground">Thông tin tài khoản và lịch sử đóng góp</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Thông tin cá nhân */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Thông Tin Cá Nhân</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{user.name || "Người dùng"}</p>
                      <p className="text-sm text-muted-foreground">Thành viên</p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Tham gia: {new Date(user.createdAt || Date.now()).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full" onClick={() => router.push("/")}>
                      Về Trang Chủ
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Thông tin sức khỏe */}
              {user.hasCompletedHealthProfile && (
                <Card className="mt-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-red-500" />
                        Thông Tin Sức Khỏe
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingHealth(true)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Tuổi */}
                    <div>
                      <p className="text-sm font-medium mb-2">Tuổi</p>
                      <Badge variant="outline" className="text-base">
                        {user.age || "Chưa cập nhật"} tuổi
                      </Badge>
                    </div>

                    {/* Tình trạng sức khỏe */}
                    <div>
                      <p className="text-sm font-medium mb-2">Tình trạng sức khỏe</p>
                      <div className="flex flex-wrap gap-2">
                        {user.healthConditions && user.healthConditions.length > 0 ? (
                          user.healthConditions.map((condition) => (
                            <Badge key={condition} variant="outline" className="bg-green-50">
                              {condition}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">Chưa cập nhật</p>
                        )}
                      </div>
                    </div>

                    {/* Sở thích ăn uống */}
                    <div>
                      <p className="text-sm font-medium mb-2">Sở thích ăn uống</p>
                      <div className="flex flex-wrap gap-2">
                        {user.dietaryPreferences && user.dietaryPreferences.length > 0 ? (
                          user.dietaryPreferences.map((pref) => (
                            <Badge key={pref} variant="outline" className="bg-blue-50">
                              {pref}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">Chưa cập nhật</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Thống kê */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Thống Kê Đóng Góp</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Tổng bài viết</span>
                    <span className="font-semibold">{myRecipes.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Đã duyệt</span>
                    <span className="font-semibold text-green-600">{approvedCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Chờ duyệt</span>
                    <span className="font-semibold text-yellow-600">{pendingCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Từ chối</span>
                    <span className="font-semibold text-red-600">{rejectedCount}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs for recipes */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Công Thức</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="my-recipes" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="my-recipes">
                        Đã đăng ({myRecipes.length})
                      </TabsTrigger>
                      <TabsTrigger value="saved">
                        <Bookmark className="h-4 w-4 mr-1" />
                        Đã lưu ({savedRecipes.length})
                      </TabsTrigger>
                      <TabsTrigger value="liked">
                        <Heart className="h-4 w-4 mr-1" />
                        Đã thích ({likedRecipes.length})
                      </TabsTrigger>
                    </TabsList>

                    {/* My Recipes Tab */}
                    <TabsContent value="my-recipes" className="mt-6">
                      {loading ? (
                        <div className="text-center py-12 text-muted-foreground">
                          Đang tải...
                        </div>
                      ) : myRecipes.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground mb-4">Bạn chưa đăng công thức nào</p>
                          <Button onClick={() => router.push("/")}>
                            Khám Phá Công Thức
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {myRecipes.map((recipe) => (
                            <div
                              key={recipe.id}
                              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                            >
                              <div className="flex items-center gap-4 flex-1">
                                <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center text-2xl">
                                  🍽️
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold">{recipe.name}</h3>
                                    {getStatusBadge(recipe.status)}
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-1">
                                    {recipe.description}
                                  </p>
                                  <div className="flex gap-2 mt-2">
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                      {recipe.category}
                                    </span>
                                    <span className="text-xs bg-secondary px-2 py-1 rounded">
                                      {recipe.cuisine}
                                    </span>
                                  </div>
                                  {recipe.status === "rejected" && recipe.reviewNote && (
                                    <p className="text-sm text-red-600 mt-2">
                                      Lý do: {recipe.reviewNote}
                                    </p>
                                  )}
                                  {recipe.createdAt && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Đăng ngày: {new Date(recipe.createdAt).toLocaleDateString('vi-VN')}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {recipe.status === "rejected" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    toast("Chức năng chỉnh sửa đang được phát triển", {
                                      icon: '🚧',
                                      duration: 3000,
                                    })
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Sửa
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    {/* Saved Recipes Tab */}
                    <TabsContent value="saved" className="mt-6">
                      {loading ? (
                        <div className="text-center py-12 text-muted-foreground">
                          Đang tải...
                        </div>
                      ) : savedRecipes.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground mb-4">Bạn chưa lưu công thức nào</p>
                          <Button onClick={() => router.push("/")}>
                            Khám Phá Công Thức
                          </Button>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                          {savedRecipes.map((recipe) => (
                            <RecipeCard
                              key={recipe.id}
                              recipe={recipe}
                              onClick={() => setSelectedRecipe(recipe)}
                            />
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    {/* Liked Recipes Tab */}
                    <TabsContent value="liked" className="mt-6">
                      {loading ? (
                        <div className="text-center py-12 text-muted-foreground">
                          Đang tải...
                        </div>
                      ) : likedRecipes.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground mb-4">Bạn chưa thích công thức nào</p>
                          <Button onClick={() => router.push("/")}>
                            Khám Phá Công Thức
                          </Button>
                        </div>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                          {likedRecipes.map((recipe) => (
                            <RecipeCard
                              key={recipe.id}
                              recipe={recipe}
                              onClick={() => setSelectedRecipe(recipe)}
                            />
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      {/* Recipe Detail Dialog */}
      {selectedRecipe && (
        <RecipeDetailDialog
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
        />
      )}

      {/* Edit Health Profile Dialog */}
      <Dialog open={isEditingHealth} onOpenChange={setIsEditingHealth}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Chỉnh Sửa Thông Tin Sức Khỏe
            </DialogTitle>
            <DialogDescription>
              Cập nhật thông tin để nhận gợi ý món ăn phù hợp với bạn
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Tuổi */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Tuổi <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="1"
                max="120"
                value={editAge}
                onChange={(e) => setEditAge(Number(e.target.value))}
                className="w-32"
                placeholder="Nhập tuổi"
              />
            </div>

            {/* Tình trạng sức khỏe */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                Tình trạng sức khỏe
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                Chọn tất cả các tình trạng áp dụng cho bạn (có thể chọn nhiều)
              </p>
              <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-1">
                {HEALTH_CONDITIONS.map((condition) => (
                  <div
                    key={condition}
                    onClick={() => toggleHealthCondition(condition)}
                    className={`p-2.5 border rounded-lg cursor-pointer transition-all text-center ${
                      editHealthConditions.includes(condition)
                        ? "bg-green-500 text-white border-green-600 shadow-sm"
                        : "bg-white hover:bg-gray-50 border-gray-200"
                    }`}
                  >
                    <span className="text-xs font-medium">{condition}</span>
                  </div>
                ))}
              </div>
              {editHealthConditions.length > 0 && (
                <p className="text-xs text-green-600 mt-2">
                  Đã chọn: {editHealthConditions.length} tình trạng
                </p>
              )}
            </div>

            {/* Sở thích ăn uống */}
            <div>
              <label className="text-sm font-medium mb-3 block">
                Đặc điểm dinh dưỡng & Sở thích ăn uống
              </label>
              <p className="text-xs text-muted-foreground mb-3">
                Chọn các đặc điểm dinh dưỡng và sở thích ăn uống của bạn
              </p>
              <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto p-1">
                {DIETARY_PREFERENCES.map((pref) => (
                  <div
                    key={pref}
                    onClick={() => toggleDietaryPreference(pref)}
                    className={`p-2.5 border rounded-lg cursor-pointer transition-all text-center ${
                      editDietaryPreferences.includes(pref)
                        ? "bg-blue-500 text-white border-blue-600 shadow-sm"
                        : "bg-white hover:bg-gray-50 border-gray-200"
                    }`}
                  >
                    <span className="text-xs font-medium">{pref}</span>
                  </div>
                ))}
              </div>
              {editDietaryPreferences.length > 0 && (
                <p className="text-xs text-blue-600 mt-2">
                  Đã chọn: {editDietaryPreferences.length} đặc điểm
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditingHealth(false)
                setEditAge(user.age || 0)
                setEditHealthConditions(user.healthConditions || [])
                setEditDietaryPreferences(user.dietaryPreferences || [])
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleSaveHealthProfile}>
              Lưu Thay Đổi
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
