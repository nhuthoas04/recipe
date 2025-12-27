"use client"

import { useState, useEffect } from "react"
import { format, addDays } from "date-fns"
import { vi } from "date-fns/locale"
import { Calendar as CalendarIcon, Sun, Moon, Coffee, UtensilsCrossed } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import type { Recipe } from "@/lib/types"
import { useRecipeStore } from "@/lib/recipe-store"
import { useAuthStore } from "@/lib/auth-store"
import toast from "react-hot-toast"

interface AddToMealPlanDialogProps {
  open: boolean
  onClose: () => void
  recipe: Recipe | null
}

const mealTypes = [
  { 
    key: "breakfast" as const, 
    label: "Sáng", 
    icon: Coffee,
    color: "text-orange-500",
    bgColor: "bg-orange-50 hover:bg-orange-100 border-orange-200"
  },
  { 
    key: "lunch" as const, 
    label: "Trưa", 
    icon: Sun,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50 hover:bg-yellow-100 border-yellow-200"
  },
  { 
    key: "dinner" as const, 
    label: "Tối", 
    icon: Moon,
    color: "text-blue-500",
    bgColor: "bg-blue-50 hover:bg-blue-100 border-blue-200"
  },
  { 
    key: "snack" as const, 
    label: "Phụ", 
    icon: UtensilsCrossed,
    color: "text-purple-500",
    bgColor: "bg-purple-50 hover:bg-purple-100 border-purple-200"
  },
]

export function AddToMealPlanDialog({ open, onClose, recipe }: AddToMealPlanDialogProps) {
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"))
  const [selectedMealType, setSelectedMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack" | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  
  const { mealPlans, addMealPlan, updateMealPlan } = useRecipeStore()
  const { isAuthenticated } = useAuthStore()

  // Format ngày đã chọn
  const selectedDateStr = selectedDate
  const isToday = format(new Date(), "yyyy-MM-dd") === selectedDateStr

  // Reset khi mở dialog
  useEffect(() => {
    if (open) {
      setSelectedDate(format(new Date(), "yyyy-MM-dd"))
      setSelectedMealType(null)
    }
  }, [open])

  // Lấy các món đã có trong ngày được chọn
  const selectedDayPlan = mealPlans.find((plan) => plan.date === selectedDateStr)

  const getMealsForType = (mealType: "breakfast" | "lunch" | "dinner" | "snack") => {
    return selectedDayPlan?.[mealType] || []
  }

  // Nhanh chóng chọn ngày
  const quickDates = [
    { label: "Hôm nay", date: format(new Date(), "yyyy-MM-dd") },
    { label: "Ngày mai", date: format(addDays(new Date(), 1), "yyyy-MM-dd") },
    { label: "Ngày kia", date: format(addDays(new Date(), 2), "yyyy-MM-dd") },
  ]

  const handleAddToMealPlan = async () => {
    if (!selectedMealType || !recipe) return

    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để thêm vào thực đơn")
      return
    }

    setIsAdding(true)

    try {
      if (selectedDayPlan) {
        // Cập nhật meal plan đã có
        const currentMeals = selectedDayPlan[selectedMealType] || []
        
        // Kiểm tra xem món này đã có trong bữa ăn chưa
        const isDuplicate = currentMeals.some((meal) => meal.id === recipe.id)
        if (isDuplicate) {
          toast.error("Món này đã có trong bữa ăn này rồi")
          setIsAdding(false)
          return
        }

        await updateMealPlan(selectedDayPlan.id, {
          breakfast: selectedDayPlan.breakfast || [],
          lunch: selectedDayPlan.lunch || [],
          dinner: selectedDayPlan.dinner || [],
          snack: selectedDayPlan.snack || [],
          [selectedMealType]: [...currentMeals, recipe],
        })
      } else {
        // Tạo meal plan mới
        await addMealPlan({
          id: `${selectedDateStr}-${Date.now()}`,
          date: selectedDateStr,
          breakfast: selectedMealType === "breakfast" ? [recipe] : [],
          lunch: selectedMealType === "lunch" ? [recipe] : [],
          dinner: selectedMealType === "dinner" ? [recipe] : [],
          snack: selectedMealType === "snack" ? [recipe] : [],
        })
      }

      const mealLabel = mealTypes.find((m) => m.key === selectedMealType)?.label || ""
      const dateLabel = isToday ? "hôm nay" : selectedDate
      toast.success(`Đã thêm "${recipe.name}" vào bữa ${mealLabel} ${dateLabel}`)
      onClose()
    } catch (error) {
      console.error("Error adding to meal plan:", error)
      toast.error("Có lỗi xảy ra khi thêm vào thực đơn")
    } finally {
      setIsAdding(false)
    }
  }

  if (!recipe) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Thêm Vào Thực Đơn
          </DialogTitle>
          <DialogDescription>
            Chọn ngày và bữa ăn để thêm món <span className="font-semibold text-foreground">{recipe.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Chọn ngày */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Chọn ngày</label>
            
            {/* Quick date buttons */}
            <div className="flex gap-2 mb-2">
              {quickDates.map(({ label, date }) => {
                const isSelected = selectedDateStr === date
                return (
                  <Button
                    key={label}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedDate(date)}
                  >
                    {label}
                  </Button>
                )
              })}
            </div>
            
            {/* Date picker - simple input */}
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex-1"
              />
              {isToday && (
                <Badge variant="secondary">Hôm nay</Badge>
              )}
            </div>
          </div>

          {/* Các lựa chọn bữa ăn */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Chọn bữa ăn</label>
            <div className="grid grid-cols-2 gap-3">
              {mealTypes.map(({ key, label, icon: Icon, color, bgColor }) => {
                const existingMeals = getMealsForType(key)
                const isSelected = selectedMealType === key

                return (
                  <Card
                    key={key}
                    className={`cursor-pointer transition-all ${bgColor} ${
                      isSelected ? "ring-2 ring-primary shadow-md" : ""
                    }`}
                    onClick={() => setSelectedMealType(key)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full bg-white ${color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{label}</p>
                          <p className="text-xs text-muted-foreground">
                            {existingMeals.length > 0 
                              ? `${existingMeals.length} món` 
                              : "Chưa có món"}
                          </p>
                        </div>
                      </div>

                      {/* Hiển thị các món đã có */}
                      {existingMeals.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-dashed">
                          <div className="flex flex-wrap gap-1">
                            {existingMeals.slice(0, 2).map((meal, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs truncate max-w-[100px]">
                                {meal.name}
                              </Badge>
                            ))}
                            {existingMeals.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{existingMeals.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Nút thêm */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Hủy
            </Button>
            <Button
              className="flex-1"
              onClick={handleAddToMealPlan}
              disabled={!selectedMealType || isAdding}
            >
              {isAdding ? "Đang thêm..." : "Thêm vào thực đơn"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
