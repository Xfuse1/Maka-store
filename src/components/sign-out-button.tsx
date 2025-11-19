
import { signOut } from "@/app/auth/sign-out-action"
import { Button } from "./ui/button"

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button type="submit" variant="ghost">تسجيل الخروج</Button>
    </form>
  )
}
