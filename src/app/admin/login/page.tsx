"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Lock } from "lucide-react"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = getSupabaseBrowserClient()

      // تسجيل الدخول
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      if (!authData.user) {
        throw new Error("فشل تسجيل الدخول")
      }

      console.log("User logged in")

      // التحقق من أن المستخدم admin
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single() as { data: { role: string } | null; error: any }

      console.log("Profile data:", )
      console.log("Profile error:", profileError)

      if (profileError) {
        console.error("Error fetching profile:", profileError)
        await supabase.auth.signOut()
        throw new Error("خطأ في التحقق من الصلاحيات: " + profileError.message)
      }

      if (!profile) {
        await supabase.auth.signOut()
        throw new Error("لم يتم العثور على بيانات المستخدم")
      }

      if (profile.role !== "admin") {
        await supabase.auth.signOut()
        throw new Error("ليس لديك صلاحيات الوصول للوحة التحكم")
      }

      toast({
        title: "تم تسجيل الدخول",
        description: "مرحباً بك في لوحة التحكم",
      })

      router.push("/admin")
      router.refresh()
    } catch (error: any) {
      console.error("Login error:", error)
      toast({
        title: "خطأ",
        description: error.message || "فشل تسجيل الدخول",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-2">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">تسجيل دخول المسؤول</CardTitle>
          <CardDescription>أدخل بيانات الدخول للوصول إلى لوحة التحكم</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                "تسجيل الدخول"
              )}
            </Button>
            <div className="text-center text-sm">
              <span className="text-muted-foreground">ليس لديك حساب؟ </span>
              <a href="/admin/signup" className="text-primary hover:underline">
                إنشاء حساب مسؤول
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
