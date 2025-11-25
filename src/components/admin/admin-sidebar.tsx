
"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Home, Package, ShoppingBag, Settings, Palette, BarChart3, FileText, FolderTree, GalleryHorizontal, LogOut, X, Truck, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { SiteLogo } from "@/components/site-logo"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
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
    title: "التقييمات",
    href: "/admin/reviews",
    icon: Star,
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
    title: "تكاليف الشحن",
    href: "/admin/shipping",
    icon: Truck,
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
    <div className="flex flex-col h-full">
       <div className="p-4 border-b border-border flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3">
          <SiteLogo width={40} height={40} />
          <div>
            <h2 className="text-xl font-bold text-primary">مكة</h2>
            <p className="text-xs text-muted-foreground">لوحة التحكم</p>
          </div>
        </Link>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={onLinkClick}>
            <X className="h-6 w-6" />
        </Button>
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

      <div className="p-4 border-t border-border mt-auto space-y-2">
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
    if (isSidebarOpen && window.innerWidth < 768) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isSidebarOpen]);

  return (
    <>
      <div className={cn(
          "fixed inset-0 bg-black/60 z-40 md:hidden",
          isSidebarOpen ? "block" : "hidden"
      )} onClick={() => setSidebarOpen(false)} />

      <aside className={cn(
        "fixed top-0 right-0 h-full bg-background border-l border-border w-64 z-50 transform transition-transform duration-300 ease-in-out",
        "md:relative md:translate-x-0 md:w-64 md:flex-shrink-0",
        isSidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
      )}>
        <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
      </aside>
    </>
  )
}
