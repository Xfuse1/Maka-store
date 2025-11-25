"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MainNavigation } from "./main-navigation"
import { MobileNavigation } from "./mobile-navigation"
import { CartIcon } from "./cart-icon"
import { Button } from "./ui/button"
import { SiteLogo } from "./site-logo"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { User as UserIcon } from "lucide-react"

export function SiteHeader() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <SiteLogo width={80} height={80} className="w-10 h-10 sm:w-20 sm:h-20" />
            <h1 className="text-lg sm:text-2xl font-bold text-primary block">مكة</h1>
          </Link>

          {/* Desktop Navigation */}
          <MainNavigation />

          <div className="flex items-center gap-4">
            {/* Cart Icon */}
            <CartIcon />

            {/* Auth Links */}
            <div className="hidden md:block">
              {user ? (
                <Button variant="ghost" asChild>
                  <Link href="/account" className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    <span>حسابي</span>
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" asChild>
                  <Link href="/auth">
                    تسجيل الدخول
                  </Link>
                </Button>
              )}
            </div>
            
            {/* Mobile Navigation */}
            <MobileNavigation user={user} />
          </div>
        </div>
      </div>
    </header>
  )
}
