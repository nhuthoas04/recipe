"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Upload, Link as LinkIcon } from "lucide-react"
import type { Recipe, Ingredient } from "@/lib/types"
import toast from 'react-hot-toast'

interface RecipeFormDialogProps {
  open: boolean
  onClose: () => void
  recipe?: Recipe | null
}

export function RecipeFormDialog({ open, onClose, recipe }: RecipeFormDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "/placeholder.svg",
    category: "món chính" as Recipe["category"],
    cuisine: "Bắc" as Recipe["cuisine"],
    prepTime: 0,
    cookTime: 0,
    servings: 1,
    difficulty: "Dễ" as Recipe["difficulty"],
    tags: [] as string[],
    healthTags: [] as string[],
    suitableFor: [] as string[],
    notSuitableFor: [] as string[],
    nutrition: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
  })

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", amount: "", unit: "" }
  ])

  const [instructions, setInstructions] = useState<string[]>([""])
  const [tagInput, setTagInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string>("")

  useEffect(() => {
    if (recipe) {
      setFormData({
        name: recipe.name,
        description: recipe.description,
        image: recipe.image,
        category: recipe.category,
        cuisine: recipe.cuisine,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings,
        difficulty: recipe.difficulty,
        tags: recipe.tags || [],
        healthTags: recipe.healthTags || [],
        suitableFor: recipe.suitableFor || [],
        notSuitableFor: recipe.notSuitableFor || [],
        nutrition: recipe.nutrition || {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        },
      })
      setImagePreview(recipe.image)
      setIngredients(recipe.ingredients.length > 0 ? recipe.ingredients : [{ name: "", amount: "", unit: "" }])
      setInstructions(recipe.instructions.length > 0 ? recipe.instructions : [""])
    } else {
      // Reset form
      setFormData({
        name: "",
        description: "",
        image: "/placeholder.svg",
        category: "món chính",
        cuisine: "Bắc",
        prepTime: 0,
        cookTime: 0,
        servings: 1,
        difficulty: "Dễ",
        tags: [],
        healthTags: [],
        suitableFor: [],
        notSuitableFor: [],
        nutrition: {
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
        },
      })
      setImagePreview("")
      setIngredients([{ name: "", amount: "", unit: "" }])
      setInstructions([""])
      setTagInput("")
    }
  }, [recipe, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const recipeData = {
        ...formData,
        id: recipe?.id || `recipe-${Date.now()}`,
        ingredients: ingredients.filter(i => i.name.trim() !== ""),
        instructions: instructions.filter(i => i.trim() !== ""),
      }

      // Lấy thông tin user từ localStorage
      let userId = null
      let userEmail = null
      let isAdmin = false
      
      if (typeof window !== 'undefined') {
        const authData = localStorage.getItem('auth-storage')
        if (authData) {
          const parsed = JSON.parse(authData)
          userId = parsed.state?.user?.id
          userEmail = parsed.state?.user?.email
          isAdmin = userEmail === 'admin@recipe.com'
        }
      }

      const response = await fetch("/api/recipes", {
        method: recipe ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          recipe: recipeData, 
          userId, 
          userEmail, 
          isAdmin 
        }),
      })

      if (response.ok) {
        toast.success(recipe ? "Cập nhật thành công!" : "Thêm công thức thành công!", {
          duration: 3000,
        })
        onClose() // Parent component sẽ reload recipes
      } else {
        toast.error("Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Submit error:", error)
      toast.error("Đã xảy ra lỗi")
    } finally {
      setLoading(false)
    }
  }

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", amount: "", unit: "" }])
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const updated = [...ingredients]
    updated[index][field] = value
    setIngredients(updated)
  }

  const addInstruction = () => {
    setInstructions([...instructions, ""])
  }

  const removeInstruction = (index: number) => {
    setInstructions(instructions.filter((_, i) => i !== index))
  }

  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions]
    updated[index] = value
    setInstructions(updated)
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] })
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Kiểm tra kích thước file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Kích thước ảnh quá lớn! Vui lòng chọn ảnh nhỏ hơn 5MB", {
          duration: 4000,
        })
        return
      }

      // Đọc file và convert sang base64 để hiển thị preview
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setImagePreview(base64String)
        setFormData({ ...formData, image: base64String })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, image: url })
    setImagePreview(url)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{recipe ? "Sửa Công Thức" : "Thêm Công Thức Mới"}</DialogTitle>
          <DialogDescription>
            Điền thông tin chi tiết về món ăn
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label>Tên món ăn</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="col-span-2">
              <Label>Mô tả</Label>
              <Textarea
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                required
              />
            </div>

            {/* Image Upload Section */}
            <div className="col-span-2 space-y-3">
              <Label>Hình ảnh món ăn</Label>
              
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Upload Options */}
              <div className="flex gap-2">
                {/* Upload File */}
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById("image-upload")?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Tải ảnh lên
                  </Button>
                </div>

                {/* Or URL Input */}
                <div className="flex-1">
                  <div className="flex gap-2">
                    <Input
                      type="url"
                      placeholder="Hoặc nhập URL ảnh"
                      value={formData.image.startsWith("/") || formData.image.startsWith("data:") ? "" : formData.image}
                      onChange={(e) => handleImageUrlChange(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const url = prompt("Nhập URL ảnh:")
                        if (url) handleImageUrlChange(url)
                      }}
                    >
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Tải ảnh từ máy (tối đa 5MB) hoặc nhập URL ảnh từ internet
              </p>
            </div>

            <div>
              <Label>Loại món</Label>
              <Select value={formData.category} onValueChange={(value: any) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="món chính">Món chính</SelectItem>
                  <SelectItem value="món phụ">Món phụ</SelectItem>
                  <SelectItem value="canh">Canh</SelectItem>
                  <SelectItem value="món tráng miệng">Món tráng miệng</SelectItem>
                  <SelectItem value="đồ uống">Đồ uống</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Vùng miền</Label>
              <Select value={formData.cuisine} onValueChange={(value: any) => setFormData({ ...formData, cuisine: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bắc">Bắc</SelectItem>
                  <SelectItem value="Trung">Trung</SelectItem>
                  <SelectItem value="Nam">Nam</SelectItem>
                  <SelectItem value="Quốc tế">Quốc tế</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Độ khó</Label>
              <Select value={formData.difficulty} onValueChange={(value: any) => setFormData({ ...formData, difficulty: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dễ">Dễ</SelectItem>
                  <SelectItem value="Trung bình">Trung bình</SelectItem>
                  <SelectItem value="Khó">Khó</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Số người ăn</Label>
              <Input
                type="number"
                value={formData.servings}
                onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) })}
                min={1}
                required
              />
            </div>

            <div>
              <Label>Thời gian chuẩn bị (phút)</Label>
              <Input
                type="number"
                value={formData.prepTime}
                onChange={(e) => setFormData({ ...formData, prepTime: parseInt(e.target.value) })}
                min={0}
                required
              />
            </div>

            <div>
              <Label>Thời gian nấu (phút)</Label>
              <Input
                type="number"
                value={formData.cookTime}
                onChange={(e) => setFormData({ ...formData, cookTime: parseInt(e.target.value) })}
                min={0}
                required
              />
            </div>
          </div>

          {/* Ingredients */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Nguyên liệu</Label>
              <Button type="button" size="sm" onClick={addIngredient}>
                <Plus className="h-4 w-4 mr-1" /> Thêm
              </Button>
            </div>
            <div className="space-y-2">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Tên nguyên liệu"
                    value={ingredient.name}
                    onChange={(e) => updateIngredient(index, "name", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Số lượng (vd: 500g, 2 củ)"
                    value={ingredient.amount}
                    onChange={(e) => {
                      updateIngredient(index, "amount", e.target.value)
                      // Auto set unit to avoid validation issues
                      updateIngredient(index, "unit", "")
                    }}
                    className="w-40"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeIngredient(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Hướng dẫn</Label>
              <Button type="button" size="sm" onClick={addInstruction}>
                <Plus className="h-4 w-4 mr-1" /> Thêm bước
              </Button>
            </div>
            <div className="space-y-2">
              {instructions.map((instruction, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-sm font-medium pt-2">{index + 1}.</span>
                  <Input
                    placeholder={`Bước ${index + 1}`}
                    value={instruction}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeInstruction(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Nhập tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag}>Thêm</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:text-destructive"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Health Tags */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <div>
              <Label className="text-base font-semibold">Thông Tin Sức Khỏe</Label>
            </div>

            {/* Đặc điểm dinh dưỡng */}
            <div>
              <Label className="text-sm font-medium">Đặc điểm dinh dưỡng</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {["Ít đường", "Ít muối", "Ít dầu mỡ", "Giàu protein", "Giàu đạm", "Giàu chất xơ", "Ít đạm", "Không cay", "Không rượu", "Ăn chay", "Ít calo", "Giàu calo", "Nhiều vitamin", "Giàu canxi", "Giàu sắt", "Giàu omega-3", "Không cholesterol", "Không lactose", "Ít natri", "Giàu kali", "Giàu chất chống oxi hóa"].map((tag) => (
                  <span
                    key={tag}
                    onClick={() => {
                      if (formData.healthTags.includes(tag)) {
                        setFormData({ ...formData, healthTags: formData.healthTags.filter(t => t !== tag) })
                      } else {
                        setFormData({ ...formData, healthTags: [...formData.healthTags, tag] })
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                      formData.healthTags.includes(tag)
                        ? "bg-green-500 text-white"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Phù hợp cho */}
            <div>
              <Label className="text-sm font-medium text-green-700">✓ Phù hợp cho</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {["Tiểu đường", "Cao huyết áp", "Cholesterol cao", "Bệnh tim", "Bệnh thận", "Béo phì", "Gầy", "Trẻ em", "Người cao tuổi", "Phụ nữ mang thai", "Phụ nữ cho con bú", "Người ăn chay", "Vận động viên", "Người gầy cần tăng cân", "Người muốn giảm cân", "Người thiếu máu", "Xương khớp yếu", "Tiêu hóa kém", "Suy giảm miễn dịch", "Người đang hồi sức sau bệnh"].map((tag) => (
                  <span
                    key={tag}
                    onClick={() => {
                      if (formData.suitableFor.includes(tag)) {
                        setFormData({ ...formData, suitableFor: formData.suitableFor.filter(t => t !== tag) })
                      } else {
                        setFormData({ ...formData, suitableFor: [...formData.suitableFor, tag] })
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                      formData.suitableFor.includes(tag)
                        ? "bg-green-500 text-white"
                        : "bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Không phù hợp cho */}
            <div>
              <Label className="text-sm font-medium text-red-700">✗ Không phù hợp cho</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {["Dị ứng hải sản", "Dị ứng đậu phộng", "Dị ứng gluten", "Dị ứng sữa", "Dị ứng trứng", "Dị ứng các loại hạt", "Dị ứng đậu nành", "Dị ứng cá", "Dị ứng tôm cua", "Dị ứng gừng", "Tiểu đường", "Béo phì", "Cao huyết áp", "Cholesterol cao", "Người mỡ máu cao", "Bệnh tim", "Người bệnh thận", "Bệnh Gout", "Viêm loét dạ dày", "Bệnh gan", "Đang dùng thuốc chống đông máu", "Trẻ dưới 1 tuổi", "Người sau phẫu thuật tiêu hóa"].map((tag) => (
                  <span
                    key={tag}
                    onClick={() => {
                      if (formData.notSuitableFor.includes(tag)) {
                        setFormData({ ...formData, notSuitableFor: formData.notSuitableFor.filter(t => t !== tag) })
                      } else {
                        setFormData({ ...formData, notSuitableFor: [...formData.notSuitableFor, tag] })
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${
                      formData.notSuitableFor.includes(tag)
                        ? "bg-green-600 text-white"
                        : "bg-green-50 text-green-700 hover:bg-green-100"
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Nutrition */}
          <div>
            <Label className="text-base font-semibold">Dinh Dưỡng</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="calories" className="text-sm">Calories (kcal)</Label>
                <Input
                  id="calories"
                  type="number"
                  min={0}
                  placeholder="650"
                  value={formData.nutrition.calories || ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    nutrition: { 
                      ...formData.nutrition, 
                      calories: parseInt(e.target.value) || 0 
                    } 
                  })}
                />
              </div>

              <div>
                <Label htmlFor="protein" className="text-sm">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  min={0}
                  placeholder="40"
                  value={formData.nutrition.protein || ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    nutrition: { 
                      ...formData.nutrition, 
                      protein: parseInt(e.target.value) || 0 
                    } 
                  })}
                />
              </div>

              <div>
                <Label htmlFor="carbs" className="text-sm">Carbs (g)</Label>
                <Input
                  id="carbs"
                  type="number"
                  min={0}
                  placeholder="70"
                  value={formData.nutrition.carbs || ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    nutrition: { 
                      ...formData.nutrition, 
                      carbs: parseInt(e.target.value) || 0 
                    } 
                  })}
                />
              </div>

              <div>
                <Label htmlFor="fat" className="text-sm">Chất béo (g)</Label>
                <Input
                  id="fat"
                  type="number"
                  min={0}
                  placeholder="22"
                  value={formData.nutrition.fat || ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    nutrition: { 
                      ...formData.nutrition, 
                      fat: parseInt(e.target.value) || 0 
                    } 
                  })}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Đang lưu..." : recipe ? "Cập Nhật" : "Thêm Công Thức"}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
