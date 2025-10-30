"use client"

import { ShoppingList } from "@/components/shopping-list"
import { Header } from "@/components/header"
import { AuthGuard } from "@/components/auth-guard"

export default function ShoppingListPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <ShoppingList />
        </main>
      </div>
    </AuthGuard>
  )
}
