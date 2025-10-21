"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

const navItems = [
  { title: "الرئيسية", href: "/" },
  { title: "من نحن", href: "/about" },
  { title: "تواصل معنا", href: "/contact" },
] as const

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-secondary/50 rounded-md transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {isOpen && (
        <nav className="absolute top-full left-0 right-0 bg-background border-b border-border flex flex-col gap-1 p-2 rtl">
          {navItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="py-1.5 text-foreground hover:text-primary transition-colors font-medium"
            >
              {item.title}
            </Link>
          ))}
        </nav>
      )}
    </div>
  )
}
