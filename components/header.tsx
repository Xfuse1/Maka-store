
import Link from "next/link"
import Image from "next/image"

import { createClient } from "@/lib/supabase/server"
import { MainNavigation } from "./main-navigation"
import { MobileNavigation } from "./mobile-navigation"
import { CartIcon } from "./cart-icon"
import { SignOutButton } from "./sign-out-button"

export async function Header() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="border-b border-border bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <Image src="/logo-option-4.jpg" alt="مكة" width={80} height={80} priority />
            <h1 className="text-2xl font-bold text-primary hidden sm:block">مكة</h1>
          </Link>

          {/* Desktop Navigation */}
          <MainNavigation />

          <div className="flex items-center gap-4">
            {/* Cart Icon */}
            <CartIcon />

            {/* Auth Links */}
            {user ? (
              <SignOutButton />
            ) : (
              <Link href="/auth" className="text-sm font-medium hover:text-primary transition-colors">
                تسجيل الدخول
              </Link>
            )}
            
            {/* Mobile Navigation */}
            <MobileNavigation />
          </div>
        </div>
      </div>
    </header>
  )
}
