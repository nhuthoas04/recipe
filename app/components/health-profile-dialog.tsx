"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import toast from "react-hot-toast"
import { useAuthStore } from "@/lib/auth-store"

interface HealthProfileDialogProps {
  open: boolean
  onComplete: () => void
}

const HEALTH_CONDITIONS = [
  "Tiểu đường",
  "Cao huyết áp",
  "Cholesterol cao",
  "Dị ứng hải sản",
  "Dị ứng đậu phộng",
  "Dị ứng gluten",
  "Bệnh tim",
  "Bệnh thận",
  "Béo phì",
  "Gầy",
  "Người mỡ máu cao",
  "Bệnh Gout",
  "Viêm loét dạ dày",
  "Bệnh gan",
  "Người thiếu máu",
  "Suy giảm miễn dịch",
]

const DIETARY_PREFERENCES = [
  "Ăn chay",
  "Ít đường",
  "Ít muối",
  "Ít dầu mỡ",
  "Nhiều protein",
  "Ít đạm",
  "Không cay",
  "Không rượu bia",
  "Giàu chất xơ",
  "Ít calo",
  "Giàu canxi",
  "Giàu sắt",
  "Không lactose",
]

export function HealthProfileDialog({ open, onComplete }: HealthProfileDialogProps) {
  const { user, updateUser } = useAuthStore()
  const [age, setAge] = useState(user?.age?.toString() || "")
  const [selectedHealthConditions, setSelectedHealthConditions] = useState<string[]>(user?.healthConditions || [])
  const [selectedDietaryPreferences, setSelectedDietaryPreferences] = useState<string[]>(user?.dietaryPreferences || [])
  const [loading, setLoading] = useState(false)

  // Update state khi user thay đổi (để pre-fill khi mở dialog lần sau)
  useEffect(() => {
    if (user && open) {
      console.log("Pre-filling health profile dialog with user data:", user)
      setAge(user.age?.toString() || "")
      setSelectedHealthConditions(user.healthConditions || [])
      setSelectedDietaryPreferences(user.dietaryPreferences || [])
    }
  }, [user, open])

  const toggleHealthCondition = (condition: string) => {
    setSelectedHealthConditions(prev =>
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    )
  }

  const toggleDietaryPreference = (pref: string) => {
    setSelectedDietaryPreferences(prev =>
      prev.includes(pref)
        ? prev.filter(p => p !== pref)
        : [...prev, pref]
    )
  }

  const handleSubmit = async () => {
    if (!age || isNaN(parseInt(age)) || parseInt(age) < 1 || parseInt(age) > 120) {
      toast.error("Vui lòng nhập tuổi hợp lệ (1-120)")
      return
    }

    if (!user?.id) {
      toast.error("Không tìm thấy thông tin người dùng")
      return
    }

    setLoading(true)
    const loadingToast = toast.loading("Đang lưu thông tin...")

    console.log("Saving health profile for user:", {
      userId: user.id,
      userObject: user,
      age: parseInt(age),
      healthConditions: selectedHealthConditions,
      dietaryPreferences: selectedDietaryPreferences
    })

    try {
      const response = await fetch('/api/users/health-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          age: parseInt(age),
          healthConditions: selectedHealthConditions,
          dietaryPreferences: selectedDietaryPreferences,
        }),
      })

      const data = await response.json()
      console.log("Health profile response:", data)

      if (data.success) {
        // Cập nhật user trong store - Zustand persist sẽ tự động lưu vào localStorage
        const updatedUser = {
          ...user!,
          age: parseInt(age),
          healthConditions: selectedHealthConditions,
          dietaryPreferences: selectedDietaryPreferences,
          hasCompletedHealthProfile: true,
        }
        
        console.log("Updating user with health profile:", updatedUser)
        updateUser(updatedUser)

        toast.success("Đã lưu thông tin sức khỏe!", { id: loadingToast })
        
        // Delay onComplete để đảm bảo state được update
        setTimeout(() => {
          onComplete()
        }, 100)
      } else {
        console.error("Save health profile error:", data.error)
        toast.error(data.error || "Có lỗi xảy ra", { id: loadingToast })
      }
    } catch (error) {
      console.error("Save health profile error:", error)
      toast.error("Đã xảy ra lỗi", { id: loadingToast })
    } finally {
      setLoading(false)
    }
  }

  const canClose = user?.hasCompletedHealthProfile || false

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen && canClose) onComplete() }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" showCloseButton={canClose}>
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {canClose ? "Cập Nhật Thông Tin Sức Khỏe" : "Thông Tin Sức Khỏe"}
          </DialogTitle>
          <DialogDescription>
            Giúp chúng tôi hiểu về bạn để gợi ý các công thức nấu ăn phù hợp nhất với tình trạng sức khỏe của bạn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Tuổi */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Tuổi của bạn *</label>
            <Input
              type="number"
              placeholder="Nhập tuổi"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              min="1"
              max="120"
            />
          </div>

          {/* Tình trạng sức khỏe */}
          <div className="space-y-3">
            <label className="text-sm font-semibold">
              Tình trạng sức khỏe (nếu có)
            </label>
            <p className="text-xs text-muted-foreground">
              Chọn các vấn đề sức khỏe mà bạn đang gặp phải
            </p>
            <div className="flex flex-wrap gap-2">
              {HEALTH_CONDITIONS.map((condition) => (
                <Badge
                  key={condition}
                  variant={selectedHealthConditions.includes(condition) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/90 transition-colors"
                  onClick={() => toggleHealthCondition(condition)}
                >
                  {condition}
                  {selectedHealthConditions.includes(condition) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Chế độ ăn */}
          <div className="space-y-3">
            <label className="text-sm font-semibold">
              Chế độ ăn uống
            </label>
            <p className="text-xs text-muted-foreground">
              Chọn các sở thích hoặc hạn chế trong chế độ ăn của bạn
            </p>
            <div className="flex flex-wrap gap-2">
              {DIETARY_PREFERENCES.map((pref) => (
                <Badge
                  key={pref}
                  variant={selectedDietaryPreferences.includes(pref) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary/90 transition-colors"
                  onClick={() => toggleDietaryPreference(pref)}
                >
                  {pref}
                  {selectedDietaryPreferences.includes(pref) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button
            onClick={handleSubmit}
            disabled={loading || !age}
            className="px-8"
          >
            Lưu và Tiếp tục
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
