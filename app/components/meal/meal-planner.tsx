"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format, addDays, startOfWeek } from "date-fns"
import { vi } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MealSlot } from "@/components/meal/meal-slot"
import { AddMealDialog } from "@/components/meal/add-meal-dialog"
import { useRecipeStore } from "@/lib/recipe-store"
import type { Recipe } from "@/lib/types"

const mealTypes = [
  { key: "breakfast" as const, label: "Sáng" },
  { key: "lunch" as const, label: "Trưa" },
  { key: "dinner" as const, label: "Tối" },
  { key: "snack" as const, label: "Phụ" },
]

export function MealPlanner() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [currentWeekStart, setCurrentWeekStart] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; mealType: "breakfast" | "lunch" | "dinner" | "snack" } | null>(null)

  useEffect(() => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
    setMounted(true)
  }, [])

  const { mealPlans, addMealPlan, updateMealPlan, removeMealPlan, addToShoppingList, recipes } = useRecipeStore()

  const weekDays = currentWeekStart 
    ? Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))
    : []

  const handlePreviousWeek = () => {
    if (currentWeekStart) {
      setCurrentWeekStart(addDays(currentWeekStart, -7))
    }
  }

  const handleNextWeek = () => {
    if (currentWeekStart) {
      setCurrentWeekStart(addDays(currentWeekStart, 7))
    }
  }

  if (!mounted || !currentWeekStart) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    )
  }

  const handleAddMeal = (date: string, mealType: "breakfast" | "lunch" | "dinner" | "snack") => {
    setSelectedSlot({ date, mealType })
  }

  const handleSelectRecipe = (recipe: Recipe) => {
    if (!selectedSlot) return

    console.log('Adding recipe:', recipe.name, 'to', selectedSlot.mealType, 'on', selectedSlot.date)
    
    const existingPlan = mealPlans.find((plan) => plan.date === selectedSlot.date)

    if (existingPlan) {
      const currentMeals = existingPlan[selectedSlot.mealType] || []
      console.log('Updating existing plan, current meals:', currentMeals.length)
      
      // Giữ lại TẤT CẢ các meal types khác, chỉ update meal type được chọn
      updateMealPlan(existingPlan.id, {
        breakfast: existingPlan.breakfast || [],
        lunch: existingPlan.lunch || [],
        dinner: existingPlan.dinner || [],
        snack: existingPlan.snack || [],
        [selectedSlot.mealType]: [...currentMeals, recipe],
      })
    } else {
      console.log('Creating new plan for date:', selectedSlot.date)
      addMealPlan({
        id: `${selectedSlot.date}-${Date.now()}`,
        date: selectedSlot.date,
        breakfast: selectedSlot.mealType === 'breakfast' ? [recipe] : [],
        lunch: selectedSlot.mealType === 'lunch' ? [recipe] : [],
        dinner: selectedSlot.mealType === 'dinner' ? [recipe] : [],
        snack: selectedSlot.mealType === 'snack' ? [recipe] : [],
      })
    }

    setSelectedSlot(null)
  }

  const handleRemoveMeal = (date: string, mealType: "breakfast" | "lunch" | "dinner" | "snack", index: number) => {
    const plan = mealPlans.find((p) => p.date === date)
    if (!plan) return

    const currentMeals = plan[mealType] || []
    const updatedMeals = currentMeals.filter((_, i) => i !== index)

    // Giữ lại TẤT CẢ các meal types, chỉ update meal type được xóa
    const updatedPlan = {
      breakfast: plan.breakfast || [],
      lunch: plan.lunch || [],
      dinner: plan.dinner || [],
      snack: plan.snack || [],
      [mealType]: updatedMeals,
    }

    const hasAnyMeals = updatedPlan.breakfast.length || updatedPlan.lunch.length || 
                        updatedPlan.dinner.length || updatedPlan.snack.length

    if (!hasAnyMeals) {
      removeMealPlan(plan.id)
    } else {
      updateMealPlan(plan.id, updatedPlan)
    }
  }

  const getMealsForSlot = (date: string, mealType: "breakfast" | "lunch" | "dinner" | "snack") => {
    const plan = mealPlans.find((p) => p.date === date)
    return plan?.[mealType] || []
  }

  const handleGenerateShoppingListForDate = async (date: string) => {
    const ingredientsMap = new Map<string, { 
      amount: number
      unit: string
      recipeNames: Set<string>
      count: number
      mealInfo: Array<{ date: string; mealType: "breakfast" | "lunch" | "dinner" | "snack"; recipeName: string }>
    }>()

    // Chỉ lấy meal plan của ngày được chọn
    const plan = mealPlans.find(p => p.date === date)
    if (!plan) return

    const mealTypes: Array<"breakfast" | "lunch" | "dinner" | "snack"> = ["breakfast", "lunch", "dinner", "snack"]
    
    mealTypes.forEach((mealType) => {
      const meals = plan[mealType] || []
      
      meals.forEach((meal) => {
        meal.ingredients.forEach((ingredient) => {
          const key = ingredient.name.toLowerCase()
          const existing = ingredientsMap.get(key)
          
          const numAmount = parseFloat(ingredient.amount) || 0

          if (existing) {
            existing.amount += numAmount
            existing.count += 1
            existing.recipeNames.add(meal.name)
            existing.mealInfo.push({
              date: plan.date,
              mealType,
              recipeName: meal.name
            })
          } else {
            ingredientsMap.set(key, {
              amount: numAmount,
              unit: ingredient.unit,
              count: 1,
              recipeNames: new Set([meal.name]),
              mealInfo: [{
                date: plan.date,
                mealType,
                recipeName: meal.name
              }]
            })
          }
        })
      })
    })

    const shoppingItems = Array.from(ingredientsMap.entries()).map(([ingredient, data]) => ({
      ingredient,
      amount: data.count > 1 ? `${data.amount} (x${data.count})` : data.amount.toString(),
      unit: data.unit,
      checked: false,
      recipeNames: Array.from(data.recipeNames),
      mealInfo: data.mealInfo
    }))

    // Thêm vào shopping list và đợi xong
    await addToShoppingList(shoppingItems)
    
    // Chuyển đến trang shopping list bằng Next.js router
    router.push('/shopping-list')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Thực Đơn Tuần</h1>
        <p className="text-muted-foreground">Lập kế hoạch bữa ăn cho cả tuần</p>
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={handlePreviousWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <h2 className="text-lg font-semibold">
          {format(weekDays[0], "dd/MM", { locale: vi })} - {format(weekDays[6], "dd/MM/yyyy", { locale: vi })}
        </h2>

        <Button variant="outline" size="icon" onClick={handleNextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4">
        {weekDays.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd")
          const isToday = format(new Date(), "yyyy-MM-dd") === dateStr

          const hasMeals = mealTypes.some(({ key }) => getMealsForSlot(dateStr, key).length > 0)
          
          return (
            <Card key={dateStr} className={isToday ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="capitalize">{format(day, "EEEE", { locale: vi })}</span>
                  <span className="text-muted-foreground font-normal">{format(day, "dd/MM", { locale: vi })}</span>
                  {isToday && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                      Hôm nay
                    </span>
                  )}
                  {hasMeals && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="ml-auto"
                      onClick={() => handleGenerateShoppingListForDate(dateStr)}
                    >
                      <Download className="mr-2 h-3 w-3" />
                      Tạo Danh Sách Mua Sắm
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {mealTypes.map(({ key, label }) => (
                    <MealSlot
                      key={key}
                      label={label}
                      recipes={getMealsForSlot(dateStr, key)}
                      onAdd={() => handleAddMeal(dateStr, key)}
                      onRemove={(index) => handleRemoveMeal(dateStr, key, index)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <AddMealDialog
        open={!!selectedSlot}
        onClose={() => setSelectedSlot(null)}
        onSelect={handleSelectRecipe}
        recipes={recipes}
      />
    </div>
  )
}
