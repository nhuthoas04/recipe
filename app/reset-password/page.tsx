"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ChefHat, Lock, KeyRound, ArrowLeft, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import toast, { Toaster } from "react-hot-toast"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  useEffect(() => {
    const emailParam = searchParams.get("email")
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
  }, [searchParams])

  const handleResendCode = async () => {
    if (!email) {
      toast.error("Vui lòng nhập email")
      return
    }

    setResendLoading(true)
    try {
      const response = await fetch("/api/auth/resend-reset-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
      } else {
        toast.error(data.error || "Không thể gửi lại mã")
      }
    } catch (error) {
      console.error("Resend code error:", error)
      toast.error("Không thể kết nối đến server")
    } finally {
      setResendLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !code || !newPassword || !confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin")
      return
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          email, 
          code: code.trim(), 
          newPassword 
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(data.message)
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        toast.error(data.error || "Có lỗi xảy ra")
      }
    } catch (error) {
      console.error("Reset password error:", error)
      toast.error("Không thể kết nối đến server")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Toaster position="top-right" />
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <ChefHat className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Đặt Lại Mật Khẩu</CardTitle>
          <CardDescription>
            Nhập mã xác thực từ email và mật khẩu mới
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                readOnly={!!searchParams.get("email")}
                className={searchParams.get("email") ? "bg-muted" : ""}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium">
                Mã xác thực (6 số)
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="pl-10 text-center text-2xl tracking-widest font-bold"
                  maxLength={6}
                  required
                />
              </div>
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResendCode}
                  disabled={resendLoading || !email}
                  className="text-xs"
                >
                  <RefreshCw className={`mr-1 h-3 w-3 ${resendLoading ? "animate-spin" : ""}`} />
                  {resendLoading ? "Đang gửi..." : "Gửi lại mã"}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">
                Mật khẩu mới
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Đang xử lý..." : "Đặt Lại Mật Khẩu"}
            </Button>
          </form>

          <div className="mt-6 space-y-2">
            <div className="text-center">
              <Link 
                href="/forgot-password" 
                className="inline-flex items-center text-sm text-primary hover:underline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại nhập email
              </Link>
            </div>
            <div className="text-center">
              <Link 
                href="/login" 
                className="inline-flex items-center text-sm text-muted-foreground hover:text-primary"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          </div>

          <div className="mt-6 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
            <p className="text-xs text-blue-800 dark:text-blue-200">
              💡 <strong>Lưu ý:</strong> Mã xác thực có hiệu lực trong 1 phút. 
              Kiểm tra hộp thư spam nếu không thấy email.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
