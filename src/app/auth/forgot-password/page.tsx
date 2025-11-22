// [ANALYSIS] This file is part of forgot/reset password flow.
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { APP_URL } from "@/lib/env"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!email) {
      setError("الرجاء إدخال البريد الإلكتروني")
      return
    }

    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("الرجاء إدخال بريد إلكتروني صحيح")
      return
    }

    setLoading(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${APP_URL}/auth/update-password`,
      })

      if (error) {
        console.error("[Forgot Password] Error:", error)
        // Translated basic error messages or fallback
        if (error.message.includes("Rate limit")) {
          setError("تم تجاوز عدد المحاولات المسموح به. يرجى المحاولة لاحقًا.")
        } else {
          setError("حدث خطأ أثناء إرسال الرابط. تأكد من صحة البريد الإلكتروني وحاول مرة أخرى.")
        }
      } else {
        setSuccess(true)
      }
    } catch (err) {
      console.error("[Forgot Password] Unexpected error:", err)
      setError("حدث خطأ غير متوقع.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4" dir="rtl">
      <div className="w-full max-w-md space-y-6 p-6 border rounded-lg shadow-sm bg-card">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">إعادة تعيين كلمة المرور</h1>
          <p className="text-sm text-muted-foreground">
            أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة التعيين
          </p>
        </div>

        {success ? (
          <div className="bg-primary/10 text-primary p-4 rounded-lg text-sm text-center">
            تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني (إن كان مسجلاً لدينا). يرجى فحص البريد الوارد والرسائل غير المرغوب فيها.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="text-right"
              />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
              {loading ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
