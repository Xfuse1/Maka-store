"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, Eye, EyeOff } from "lucide-react"
import { useAuthStore } from "@/lib/auth-store"
import { initializeDatabase } from "@/lib/local-db"

export default function AdminLoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const { isAuthenticated, login } = useAuthStore()

  useEffect(() => {
    // Initialize database on mount
    initializeDatabase()

    // Redirect if already authenticated
    if (isAuthenticated) {
      router.push("/idara-alkhasa/dashboard")
    }
  }, [isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const success = login(username, password)

    if (success) {
      router.push("/idara-alkhasa/dashboard")
    } else {
      setError("اسم المستخدم أو كلمة المرور غير صحيحة")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 shadow-xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">لوحة التحكم</CardTitle>
          <CardDescription className="text-base">
            قم بتسجيل الدخول للوصول إلى لوحة التحكم الخاصة بمتجر مكة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-base">
                اسم المستخدم
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                required
                className="h-12 text-base"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base">
                كلمة المرور
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور"
                  required
                  className="h-12 text-base pl-12"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Eye className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full h-12 text-base font-semibold" disabled={isLoading}>
              {isLoading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
            </Button>

            <div className="text-center text-sm text-muted-foreground pt-4 border-t">
              <p>بيانات الدخول الافتراضية:</p>
              <p className="font-mono mt-1">admin / mecca2025</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
