"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Optionally check for valid session, though reset flow via email link sets the session automatically
    const checkSession = async () => {
      const supabase = getSupabaseBrowserClient()
      const { data } = await supabase.auth.getSession()
      // If no session is present, the user might have accessed this page directly without a link
      // However, we'll let them try or show a hint if we want strict checking.
      // For now, we assume Supabase handles the session via the link redirect.
    }
    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!password || password.length < 6) {
      setError("يجب أن تكون كلمة المرور 6 أحرف على الأقل")
      return
    }

    if (password !== confirmPassword) {
      setError("كلمتا المرور غير متطابقتين")
      return
    }

    setLoading(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        console.error("[Reset Password] Error:", error)
        setError("فشل تحديث كلمة المرور، حاول مرة أخرى.")
      } else {
        setSuccess(true)
      }
    } catch (err) {
      console.error("[Reset Password] Unexpected error:", err)
      setError("حدث خطأ غير متوقع.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4" dir="rtl">
      <div className="w-full max-w-md space-y-6 p-6 border rounded-lg shadow-sm bg-background">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">تعيين كلمة مرور جديدة</h1>
          <p className="text-sm text-muted-foreground">
            أدخل كلمة المرور الجديدة أدناه
          </p>
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm text-center">
              تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول بكلمتك الجديدة.
            </div>
            <Button 
              className="w-full bg-primary hover:bg-primary/90" 
              onClick={() => router.push("/auth")}
            >
              الذهاب لتسجيل الدخول
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور الجديدة</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="text-right"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="text-right"
              />
            </div>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
              {loading ? "جاري التحديث..." : "تحديث كلمة المرور"}
            </Button>
          </form>
        )}
        
        {!success && (
          <div className="text-center mt-4">
            <p className="text-xs text-muted-foreground">
              إذا لم يعمل الرابط، حاول إرسال طلب جديد من صفحة <a href="/auth/forgot-password" className="text-primary underline">نسيت كلمة المرور</a>.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
