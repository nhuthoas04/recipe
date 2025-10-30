"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Calendar, Clock, CheckCircle, XCircle, Edit } from "lucide-react"
import type { Recipe } from "@/lib/types"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuthStore()
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Load recipes của user
    const loadMyRecipes = async () => {
      try {
        const res = await fetch(`/api/recipes?includeAll=true`)
        const data = await res.json()
        if (data.success) {
          // Filter recipes của user hiện tại
          const userRecipes = data.recipes.filter((r: Recipe) => r.authorEmail === user?.email)
          setMyRecipes(userRecipes)
        }
      } catch (error) {
        console.error('Error loading recipes:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMyRecipes()
  }, [isAuthenticated, user, router])

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

            {/* Lịch sử đăng bài */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Lịch Sử Đăng Bài</CardTitle>
                  <CardDescription>
                    {myRecipes.length} công thức đã đóng góp
                  </CardDescription>
                </CardHeader>
                <CardContent>
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
                                // TODO: Có thể thêm chức năng chỉnh sửa và gửi lại
                                alert("Chức năng chỉnh sửa đang được phát triển")
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
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
