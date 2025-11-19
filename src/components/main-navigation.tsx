"use client"

import Link from "next/link"

const navItems = [
  { title: "الرئيسية", href: "/" },
  { title: "من نحن", href: "/about" },
  { title: "تواصل معنا", href: "/contact" },
] as const

export function MainNavigation() {
  return (
    <nav className="hidden md:flex items-center gap-0.5 rtl">
      {navItems.map((item) => (
        <Link
          key={item.title}
          href={item.href}
          className="px-3 py-1.5 text-foreground hover:text-primary transition-colors font-medium rounded-md hover:bg-secondary/50"
        >
          {item.title}
        </Link>
      ))}
    </nav>
  )
}
