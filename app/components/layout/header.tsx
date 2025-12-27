"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  ChefHat,
  Calendar,
  ShoppingCart,
  User,
  LogOut,
  Shield,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRecipeStore } from "@/lib/recipe-store";
import { useAuthStore } from "@/lib/auth-store";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const isAdminPage = pathname === "/admin";
  const shoppingList = useRecipeStore((state) => state.shoppingList);
  const mealPlans = useRecipeStore((state) => state.mealPlans);
  const { user, isAuthenticated, logout } = useAuthStore();
  
  // Local state cho search input để debounce
  const [searchInput, setSearchInput] = useState(useRecipeStore.getState().searchQuery);
  
  // Debounce search - chỉ update store sau 300ms không gõ
  useEffect(() => {
    const timer = setTimeout(() => {
      useRecipeStore.getState().setSearchQuery(searchInput);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-card shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <ChefHat className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-primary">Bếp Nhà</h1>
              <p className="text-xs text-muted-foreground">
                Nấu ăn ngon mỗi ngày
              </p>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Tìm kiếm món ăn, nguyên liệu..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 h-10 text-sm"
              />
            </div>
          </div>

          <nav className="flex items-center gap-2 flex-shrink-0">
            <Button variant="ghost" asChild>
              <Link href="/">
                <ChefHat className="mr-2 h-4 w-4" />
                Công Thức
              </Link>
            </Button>

            {/* Chỉ hiện Thực Đơn và Mua Sắm cho người dùng thường (không phải admin) */}
            {user?.email !== "admin@recipe.com" && (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/meal-planner">
                    <Calendar className="mr-2 h-4 w-4" />
                    Thực Đơn
                    {(() => {
                      const totalMeals = mealPlans.reduce((total, plan) => {
                        const mealsInDay = [
                          ...(plan.breakfast || []),
                          ...(plan.lunch || []),
                          ...(plan.dinner || []),
                          ...(plan.snack || []),
                        ];
                        return total + mealsInDay.length;
                      }, 0);
                      return (
                        totalMeals > 0 && (
                          <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                            {totalMeals}
                          </span>
                        )
                      );
                    })()}
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
              </>
            )}

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
                  {/* Chỉ hiện link Profile cho user thường, không phải admin */}
                  {user.email !== "admin@recipe.com" && (
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/profile">
                        <User className="mr-2 h-4 w-4" />
                        {user.name || "Tài khoản"}
                      </Link>
                    </Button>
                  )}
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
  );
}
