
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { MainNavigation } from "./main-navigation"
import { MobileNavigation } from "./mobile-navigation"
import { CartIcon } from "./cart-icon"
import { SignOutButton } from "./sign-out-button"
import { Button } from "./ui/button"
import { SiteLogo } from "./site-logo"
import ProfileDropdown from "./profile-dropdown.client"

export async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Load store name from DB so the header title is dynamic
  let storeName = "مكة"
  try {
    const { data: settings } = await supabase.from("store_settings").select("store_name").limit(1).maybeSingle()
    if (settings && (settings as any).store_name) storeName = (settings as any).store_name
  } catch (e) {
    // ignore and fallback to default
    console.error("Failed to load store name:", e)
  }

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <SiteLogo width={80} height={80} />
            <h1 className="text-2xl font-bold text-primary hidden sm:block">{storeName}</h1>
          </Link>

          {/* Desktop Navigation (visible on md screens and up) */}
          <div className="hidden md:flex flex-grow justify-center">
            <MainNavigation />
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* Auth / Profile Dropdown (client) */}
            {user ? (
              // pass profile as null here; header can be extended to fetch profile data if available
              <ProfileDropdown user={user} profile={null} />
            ) : (
              <Button variant="outline" asChild className="hidden sm:inline-flex">
                <Link href="/auth">تسجيل الدخول</Link>
              </Button>
            )}

            {/* Cart Icon */}
            <CartIcon />

            {/* Mobile Navigation (visible on screens smaller than md) */}
            <div className="md:hidden">
              <MobileNavigation user={user} />
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
