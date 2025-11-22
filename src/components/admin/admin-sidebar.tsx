
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Package, ShoppingBag, Settings, Palette, BarChart3, FileText, FolderTree, GalleryHorizontal, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { SiteLogo } from "@/components/site-logo"
import { Button } from "./ui/button"
import { useEffect } from "react"

const menuItems = [
  {
    title: "الرئيسية",
    href: "/admin/homepage",
    icon: Home,
  },
  {
    title: "شرائح العرض",
    href: "/admin/hero-slides",
    icon: GalleryHorizontal,
  },
  {
    title: "المنتجات",
    href: "/admin/products",
    icon: Package,
  },
  {
    title: "الفئات",
    href: "/admin/categories",
    icon: FolderTree,
  },
  {
    title: "الطلبات",
    href: "/admin/orders",
    icon: ShoppingBag,
  },
  {
    title: "التحليلات",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "التصميم",
    href: "/admin/design",
    icon: Palette,
  },
  {
    title: "الصفحات",
    href: "/admin/pages",
    icon: FileText,
  },
  {
    title: "الإعدادات",
    href: "/admin/settings",
    icon: Settings,
  },
]

interface AdminSidebarProps {
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

function SidebarContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname()
  return (
    <div className="flex flex-col h-full">
       <div className="p-4 border-b border-border">
        <Link href="/" className="flex items-center gap-3">
          <SiteLogo width={40} height={40} />
          <div>
            <h2 className="text-xl font-bold text-primary">مكة</h2>
            <p className="text-xs text-muted-foreground">لوحة التحكم</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href + "/"))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onLinkClick}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.title}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-border mt-auto">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-muted hover:bg-muted/80 transition-all text-foreground font-medium"
        >
          <Home className="h-4 w-4" />
          <span className="text-sm">العودة للموقع</span>
        </Link>
      </div>
    </div>
  )
}

export function AdminSidebar({ isSidebarOpen, setSidebarOpen }: AdminSidebarProps) {
    useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isSidebarOpen]);

  return (
    <>
      {/* Mobile Sidebar (Overlay and sliding content) */}
      <div className={cn("md:hidden fixed inset-0 z-40", isSidebarOpen ? "block" : "hidden")}>
        {/* Overlay */}
        <div 
          className="absolute inset-0 bg-black/60" 
          onClick={() => setSidebarOpen(false)}
        ></div>
        {/* Sliding Content */}
        <div className={cn(
          "fixed top-0 bottom-0 bg-background w-72 max-w-[calc(100%-3rem)] transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "right-0" : "-right-full"
        )}>
           <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-l border-border flex-shrink-0 h-screen sticky top-0">
         <SidebarContent />
      </aside>
    </>
  )
}
