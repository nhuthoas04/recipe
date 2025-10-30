"use client"

import { useState, useMemo } from "react"
import { Trash2, Check, ShoppingCart, Download, Printer, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useRecipeStore } from "@/lib/recipe-store"
import { format, parseISO } from "date-fns"
import { vi } from "date-fns/locale"

const mealTypeLabels: Record<string, string> = {
  breakfast: "Sáng",
  lunch: "Trưa",
  dinner: "Tối",
  snack: "Phụ"
}

export function ShoppingList() {
  const { shoppingList, toggleShoppingItem, removeFromShoppingList, clearShoppingList } = useRecipeStore()

  const [showChecked, setShowChecked] = useState(true)
  const [viewMode, setViewMode] = useState<"grouped" | "flat">("grouped")

  const uncheckedItems = shoppingList.filter((item) => !item.checked)
  const checkedItems = shoppingList.filter((item) => item.checked)

  // Nhóm nguyên liệu theo ngày và buổi ăn (bao gồm cả checked và unchecked)
  const groupedItems = useMemo(() => {
    const groups: Record<string, Record<string, Array<typeof shoppingList[0]>>> = {}
    
    // Hiển thị TẤT CẢ items, không chỉ unchecked
    shoppingList.forEach((item) => {
      if (item.mealInfo && item.mealInfo.length > 0) {
        item.mealInfo.forEach((info) => {
          if (!groups[info.date]) {
            groups[info.date] = {}
          }
          if (!groups[info.date][info.mealType]) {
            groups[info.date][info.mealType] = []
          }
          // Chỉ thêm nếu chưa có
          if (!groups[info.date][info.mealType].some(i => i.ingredient === item.ingredient)) {
            groups[info.date][info.mealType].push(item)
          }
        })
      }
    })
    
    return groups
  }, [shoppingList])

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    const text = shoppingList
      .map((item) => `${item.checked ? "✓" : "○"} ${item.ingredient} - ${item.amount} ${item.unit}`)
      .join("\n")

    const blob = new Blob([text], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "danh-sach-mua-sam.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  if (shoppingList.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Danh Sách Mua Sắm</h1>
          <p className="text-muted-foreground">Quản lý nguyên liệu cần mua</p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <ShoppingCart className="h-16 w-16 text-muted-foreground" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Danh sách trống</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Hãy tạo thực đơn tuần và nhấn "Tạo Danh Sách Mua Sắm" để tự động tạo danh sách nguyên liệu cần mua
              </p>
            </div>
            <Button asChild>
              <a href="/meal-planner">Đi đến Thực Đơn</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Danh Sách Mua Sắm</h1>
          <p className="text-muted-foreground">
            {uncheckedItems.length} nguyên liệu cần mua, {checkedItems.length} đã mua
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            variant={viewMode === "grouped" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setViewMode("grouped")}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Theo ngày
          </Button>
          <Button 
            variant={viewMode === "flat" ? "default" : "outline"} 
            size="sm" 
            onClick={() => setViewMode("flat")}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            Tất cả
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            In
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Xuất
          </Button>
          <Button variant="destructive" size="sm" onClick={clearShoppingList}>
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa tất cả
          </Button>
        </div>
      </div>

      {viewMode === "grouped" ? (
        <div className="space-y-6">
          {Object.keys(groupedItems).sort().map((date) => (
            <Card key={date}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {format(parseISO(date), "EEEE, dd/MM/yyyy", { locale: vi })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(groupedItems[date]).map(([mealType, items]) => {
                  // Nhóm items theo món ăn
                  const itemsByRecipe: Record<string, typeof items> = {}
                  items.forEach(item => {
                    const recipeForThisMeal = item.mealInfo?.find(
                      info => info.date === date && info.mealType === mealType
                    )?.recipeName || 'Khác'
                    
                    if (!itemsByRecipe[recipeForThisMeal]) {
                      itemsByRecipe[recipeForThisMeal] = []
                    }
                    itemsByRecipe[recipeForThisMeal].push(item)
                  })

                  return (
                    <div key={mealType} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sm font-semibold">
                          {mealTypeLabels[mealType]}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {items.length} nguyên liệu
                        </span>
                      </div>
                      
                      {/* Mỗi món ăn có khung riêng */}
                      <div className="space-y-2">
                        {Object.entries(itemsByRecipe).map(([recipeName, recipeItems]) => (
                          <div key={recipeName} className="border rounded-lg p-3 space-y-2 bg-muted/30">
                            <div className="font-medium text-sm text-primary mb-2">
                              {recipeName}
                            </div>
                            <div className="space-y-1.5">
                              {recipeItems.map((item) => (
                                <div 
                                  key={`${date}-${mealType}-${item.ingredient}`} 
                                  className={`flex items-center gap-2 p-1.5 rounded ${
                                    item.checked ? 'opacity-60' : ''
                                  }`}
                                >
                                  <Checkbox
                                    checked={item.checked}
                                    onCheckedChange={() => toggleShoppingItem(item.ingredient)}
                                  />
                                  <div className="flex-1 flex items-center gap-2">
                                    <p className={`text-sm capitalize ${item.checked ? 'line-through' : ''}`}>
                                      {item.ingredient}
                                    </p>
                                    <span className="text-xs text-muted-foreground">
                                      {item.amount}
                                    </span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 shrink-0"
                                    onClick={() => removeFromShoppingList(item.ingredient)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {Object.keys(groupedItems[date]).indexOf(mealType) < Object.keys(groupedItems[date]).length - 1 && (
                        <Separator className="my-2" />
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Cần Mua ({uncheckedItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {uncheckedItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Check className="h-12 w-12 mx-auto mb-2" />
                  <p>Đã mua hết rồi!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {uncheckedItems.map((item) => (
                    <div key={item.ingredient} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                      <Checkbox
                        checked={item.checked}
                        onCheckedChange={() => toggleShoppingItem(item.ingredient)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium capitalize">{item.ingredient}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => removeFromShoppingList(item.ingredient)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.amount} {item.unit}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {item.recipeNames.map((recipeName) => (
                            <Badge key={recipeName} variant="secondary" className="text-xs">
                              {recipeName}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {showChecked && checkedItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="h-5 w-5" />
                  Đã Mua ({checkedItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {checkedItems.map((item) => (
                    <div
                      key={item.ingredient}
                      className="flex items-start gap-3 p-3 rounded-lg border bg-muted/50 opacity-60"
                    >
                      <Checkbox
                        checked={item.checked}
                        onCheckedChange={() => toggleShoppingItem(item.ingredient)}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium capitalize line-through">{item.ingredient}</p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 shrink-0"
                            onClick={() => removeFromShoppingList(item.ingredient)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {item.amount} {item.unit}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <Card className="print:block hidden">
        <CardHeader>
          <CardTitle>Danh Sách In</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {shoppingList.map((item, index) => (
              <div key={item.ingredient} className="flex gap-2">
                <span>{index + 1}.</span>
                <span className="capitalize">{item.ingredient}</span>
                <span>-</span>
                <span>
                  {item.amount} {item.unit}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
