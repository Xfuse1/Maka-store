"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login, signup } from "./actions"

export default function AuthPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [isLoginView, setIsLoginView] = useState(true)
  const searchParams = useSearchParams()
  const message = searchParams.get("message")

  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md space-y-8">
        {isLoginView ? (
          <form action={login} className="space-y-4 p-6 border rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-center text-foreground">تسجيل الدخول</h2>
            <div className="space-y-2">
              <Label htmlFor="login-email">البريد الإلكتروني</Label>
              <Input id="login-email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">كلمة المرور</Label>
              <Input id="login-password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              تسجيل الدخول
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              ليس لديك حساب؟{" "}
              <button
                type="button"
                onClick={() => setIsLoginView(false)}
                className="underline font-semibold text-primary hover:text-primary/90"
              >
                إنشاء حساب
              </button>
            </p>
          </form>
        ) : (
          <form action={signup} className="space-y-4 p-6 border rounded-lg shadow-sm" encType="multipart/form-data">
            <h2 className="text-2xl font-bold text-center text-foreground">إنشاء حساب جديد</h2>
            <div className="space-y-2">
              <Label htmlFor="signup-email">البريد الإلكتروني</Label>
              <Input id="signup-email" name="email" type="email" placeholder="m@example.com" required />
            </div>
 <div className="space-y-2">
 <Label htmlFor="signup-name">الاسم</Label>
 <Input id="signup-name" name="name" type="text" required />
 </div>
 <div className="space-y-2">
 <Label htmlFor="signup-phone">رقم الهاتف</Label>
 <Input id="signup-phone" name="phone" type="tel" />
 </div> {/* Changed 'رابط الصورة' to 'Upload Image' and added file input styling */}
          <div className="space-y-2">
 <Label htmlFor="signup-image">Upload Image</Label>
 <input
 id="signup-image"
 name="image_file" // Changed name to image_file to match actions.ts
 type="file"
 className="hidden" // Hide the default file input
 accept="image/*"
 onChange={(e) => setSelectedImage(e.target.files ? e.target.files[0] : null)} />
 <label htmlFor="signup-image" className="flex items-center gap-2 cursor-pointer border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
 {selectedImage ? selectedImage.name : "Choose File"}
 </label>
 </div>
            <input name="role" type="hidden" value="user" />
            <div className="space-y-2">
              <Label htmlFor="signup-password">كلمة المرور</Label>
              <Input id="signup-password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              إنشاء حساب
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              لديك حساب بالفعل؟{" "}
              <button
                type="button"
                onClick={() => setIsLoginView(true)}
                className="underline font-semibold text-primary hover:text-primary/90"
              >
                تسجيل الدخول
              </button>
            </p>
          </form>
        )}
        {message && (
          <p className="mt-4 p-4 bg-muted text-foreground text-center rounded-lg">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}
