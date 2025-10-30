"use client"

import { MealPlanner } from "@/components/meal-planner"
import { Header } from "@/components/header"
import { AuthGuard } from "@/components/auth-guard"

export default function MealPlannerPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <MealPlanner />
        </main>
      </div>
    </AuthGuard>
  )
}
