"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingBag } from "lucide-react"
import { useCartStore } from "@/lib/cart-store"
import { MainNavigation } from "./main-navigation"
import { MobileNavigation } from "./mobile-navigation"

export function Header() {
  const items = useCartStore((state) => state.items)
  const cartCount = items.reduce((total, item) => total + item.quantity, 0)

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

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative p-2 hover:bg-secondary/50 rounded-md transition-colors flex-shrink-0"
            aria-label="Shopping cart"
          >
            <ShoppingBag className="h-6 w-6 text-foreground" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Navigation */}
          <MobileNavigation />
        </div>
      </div>
    </header>
  )
}
