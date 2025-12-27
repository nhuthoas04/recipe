"use client"

import { useState } from "react"
import Image from "next/image"
import { Search } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Recipe } from "@/lib/types"

interface AddMealDialogProps {
  open: boolean
  onClose: () => void
  onSelect: (recipe: Recipe) => void
  recipes: Recipe[]
}

const categories = [
  { id: null, label: "Tất cả" },
  { id: "món chính", label: "Món Chính" },
  { id: "món phụ", label: "Món Phụ" },
  { id: "canh", label: "Canh" },
  { id: "món tráng miệng", label: "Tráng Miệng" },
]

const cuisines = [
  { id: null, label: "Tất cả vùng" },
  { id: "Bắc", label: "Miền Bắc" },
  { id: "Trung", label: "Miền Trung" },
  { id: "Nam", label: "Miền Nam" },
  { id: "Quốc tế", label: "Quốc Tế" },
]

export function AddMealDialog({ open, onClose, onSelect, recipes }: AddMealDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null)

  const filteredRecipes = recipes.filter((recipe) => {
    const matchesSearch =
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory ? recipe.category === selectedCategory : true
    const matchesCuisine = selectedCuisine ? recipe.cuisine === selectedCuisine : true

    return matchesSearch && matchesCategory && matchesCuisine
  })

  // Debug log
  if (open) {
    console.log('Total recipes:', recipes.length)
    console.log('Filtered recipes:', filteredRecipes.length)
    console.log('Selected category:', selectedCategory)
    console.log('Selected cuisine:', selectedCuisine)
    console.log('Sample recipes:', recipes.slice(0, 2).map(r => ({ 
      name: r.name, 
      category: r.category, 
      cuisine: r.cuisine 
    })))
  }

  const handleSelect = (recipe: Recipe) => {
    onSelect(recipe)
    setSearchQuery("")
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Chọn Món Ăn</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm kiếm món ăn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id || "all"}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.label}
              </Button>
            ))}
          </div>

          {/* Cuisine filters */}
          <div className="flex flex-wrap gap-2">
            {cuisines.map((cuisine) => (
              <Button
                key={cuisine.id || "all"}
                variant={selectedCuisine === cuisine.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCuisine(cuisine.id)}
              >
                {cuisine.label}
              </Button>
            ))}
          </div>
        </div>

        <ScrollArea className="h-[350px] pr-4">
          {filteredRecipes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-2">
              <p className="text-muted-foreground">Không tìm thấy món ăn nào</p>
              <p className="text-sm text-muted-foreground">
                Thử thay đổi bộ lọc hoặc tìm kiếm khác
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRecipes.map((recipe) => (
                <Card
                  key={recipe.id}
                  className="cursor-pointer overflow-hidden transition-all hover:shadow-md"
                  onClick={() => handleSelect(recipe)}
                >
                  <div className="relative aspect-video">
                    <Image src={recipe.image || "/placeholder.svg"} alt={recipe.name} fill className="object-cover" />
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold line-clamp-1">{recipe.name}</h3>
                      <Badge variant="secondary" className="shrink-0">
                        {recipe.cuisine}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
