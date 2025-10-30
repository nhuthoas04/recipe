"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface User {
  id: string
  email: string
  name: string
  createdAt: string
}

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  
  // Actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        // Validate input
        if (!email || !password) {
          return { success: false, error: "Vui lòng nhập đầy đủ thông tin" }
        }

        try {
          // Call API
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          })

          const data = await response.json()

          if (!data.success) {
            return { success: false, error: data.error }
          }

          // Set user
          set({
            user: data.user,
            isAuthenticated: true,
          })

          return { success: true }
        } catch (error) {
          console.error('Login error:', error)
          return { success: false, error: "Đã xảy ra lỗi khi đăng nhập" }
        }
      },

      register: async (email: string, password: string, name: string) => {
        // Validate input
        if (!email || !password || !name) {
          return { success: false, error: "Vui lòng nhập đầy đủ thông tin" }
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
          return { success: false, error: "Email không hợp lệ" }
        }

        // Validate password length
        if (password.length < 6) {
          return { success: false, error: "Mật khẩu phải có ít nhất 6 ký tự" }
        }

        try {
          // Call API
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name }),
          })

          const data = await response.json()

          if (!data.success) {
            return { success: false, error: data.error }
          }

          // Set user
          set({
            user: data.user,
            isAuthenticated: true,
          })

          return { success: true }
        } catch (error) {
          console.error('Register error:', error)
          return { success: false, error: "Đã xảy ra lỗi khi đăng ký" }
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        })
        // Dữ liệu sẽ được load lại tự động bởi UserDataSync component
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)
