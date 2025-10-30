"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/lib/auth-store"
import { useRecipeStore } from "@/lib/recipe-store"

export function UserDataSync({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore()
  const loadUserData = useRecipeStore((state) => state.loadUserData)

  // Load recipes từ database khi app khởi động (1 lần duy nhất)
  useEffect(() => {
    if (typeof window === "undefined") return

    const loadRecipes = async () => {
      try {
        const res = await fetch('/api/recipes')
        const data = await res.json()
        if (data.success && data.recipes.length > 0) {
          // Update recipes trong store
          useRecipeStore.setState({ recipes: data.recipes })
        }
      } catch (error) {
        console.error('Error loading recipes:', error)
      }
    }

    loadRecipes()
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    // Load dữ liệu của user khi đăng nhập hoặc khi component mount
    if (isAuthenticated && user) {
      loadUserData(user.id)
    } else {
      // Load dữ liệu guest khi chưa đăng nhập
      loadUserData(null)
    }
  }, [user?.id, isAuthenticated, loadUserData])

  return <>{children}</>
}
