"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChefHat, Calendar, ShoppingCart, User, LogOut, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRecipeStore } from "@/lib/recipe-store"
import { useAuthStore } from "@/lib/auth-store"

export function Header() {
  const router = useRouter()
  const shoppingList = useRecipeStore((state) => state.shoppingList)
  const mealPlans = useRecipeStore((state) => state.mealPlans)
  const { user, isAuthenticated, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <ChefHat className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-primary">Bếp Nhà</h1>
              <p className="text-xs text-muted-foreground">Nấu ăn ngon mỗi ngày</p>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/">
                <ChefHat className="mr-2 h-4 w-4" />
                Công Thức
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/meal-planner">
                <Calendar className="mr-2 h-4 w-4" />
                Thực Đơn
                {mealPlans.length > 0 && (
                  <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {mealPlans.length}
                  </span>
                )}
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/shopping-list">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Mua Sắm
                {shoppingList.length > 0 && (
                  <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {shoppingList.length}
                  </span>
                )}
              </Link>
            </Button>

            {/* Admin Link - Chỉ hiện cho admin */}
            {isAuthenticated && user?.email === "admin@recipe.com" && (
              <Button variant="ghost" asChild>
                <Link href="/admin">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin
                </Link>
              </Button>
            )}

            <div className="ml-4 pl-4 border-l flex items-center gap-2">
              {isAuthenticated && user ? (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/profile">
                      <User className="mr-2 h-4 w-4" />
                      {user.name || "Tài khoản"}
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">Đăng nhập</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/register">Đăng ký</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
}
