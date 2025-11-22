"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Package, ShoppingBag, Settings, Palette, BarChart3, FileText, FolderTree, GalleryHorizontal, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { SiteLogo } from "@/components/site-logo"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

const menuItems = [
  {
    title: "لوحة التحكم",
    href: "/admin",
    icon: Home,
  },
  {
    title: "الصفحة الرئيسية",
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

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      const supabase = getSupabaseBrowserClient()
      await supabase.auth.signOut()
      
      toast({
        title: "تم تسجيل الخروج",
        description: "تم تسجيل خروجك بنجاح",
      })
      
      router.push("/admin/login")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "خطأ",
        description: "فشل تسجيل الخروج",
        variant: "destructive",
      })
    }
  }

  return (
    <aside className="w-64 border-l border-border bg-background flex-shrink-0 h-screen sticky top-0">
      <div className="p-6 border-b border-border">
        <Link href="/" className="flex items-center gap-3">
          <SiteLogo width={40} height={40} />
          <div>
            <h2 className="text-xl font-bold text-primary">مكة</h2>
            <p className="text-xs text-muted-foreground">لوحة التحكم</p>
          </div>
        </Link>
      </div>

      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href + "/"))

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-foreground hover:bg-primary/10 hover:text-primary",
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

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-background space-y-2">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full flex items-center justify-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">تسجيل الخروج</span>
        </Button>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-muted hover:bg-muted/80 transition-all text-foreground font-medium"
        >
          <Home className="h-4 w-4" />
          <span className="text-sm">العودة للموقع</span>
        </Link>
      </div>
    </aside>
  )
}
