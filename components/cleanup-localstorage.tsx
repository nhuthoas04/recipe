"use client"

import { useEffect } from "react"

export function CleanupLocalStorage() {
  useEffect(() => {
    // Xóa dữ liệu cũ từ localStorage (chỉ chạy 1 lần trên client)
    if (typeof window === "undefined") return
    
    const cleanupKey = "recipe-cleanup-done"
    
    if (!localStorage.getItem(cleanupKey)) {
      // Xóa các key cũ
      const keysToRemove = [
        "recipe-users", // Users cũ
        "recipe-storage", // Recipe store cũ
      ]
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
      })
      
      // Đánh dấu đã cleanup
      localStorage.setItem(cleanupKey, "true")
      console.log("✅ Đã xóa dữ liệu localStorage cũ")
    }
  }, [])

  return null
}
