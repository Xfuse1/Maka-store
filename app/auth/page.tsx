
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login, signup } from "./actions"

export default function AuthPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-lg space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
          </form>

          <form action={signup} className="space-y-4 p-6 border rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-center text-foreground">إنشاء حساب جديد</h2>
            <div className="space-y-2">
              <Label htmlFor="signup-email">البريد الإلكتروني</Label>
              <Input id="signup-email" name="email" type="email" placeholder="m@example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">كلمة المرور</Label>
              <Input id="signup-password" name="password" type="password" required />
            </div>
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
              إنشاء حساب
            </Button>
          </form>
        </div>
        {searchParams?.message && (
          <p className="mt-4 p-4 bg-muted text-foreground text-center rounded-lg">
            {searchParams.message}
          </p>
        )}
      </div>
    </div>
  )
}
