"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Palette,
  FileText,
  Tag,
  LogOut,
  TrendingUp,
  ShoppingBag,
} from "lucide-react"
import Link from "next/link"

export default function AdminDashboardPage() {
  const router = useRouter()
  const { isAuthenticated, logout } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/idara-alkhasa")
    }
  }, [isAuthenticated, router])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!isAuthenticated) {
    return null
  }

  const menuItems = [
    {
      title: "إحصائيات",
      icon: TrendingUp,
      href: "/idara-alkhasa/dashboard/analytics",
      description: "عرض الإحصائيات والرسوم البيانية",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "المنتجات",
      icon: Package,
      href: "/idara-alkhasa/dashboard/products",
      description: "إدارة المنتجات وإضافة منتجات جديدة",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "الطلبات",
      icon: ShoppingCart,
      href: "/idara-alkhasa/dashboard/orders",
      description: "عرض وإدارة الطلبات",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "العملاء",
      icon: Users,
      href: "/idara-alkhasa/dashboard/customers",
      description: "إدارة بيانات العملاء",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "كوبونات الخصم",
      icon: Tag,
      href: "/idara-alkhasa/dashboard/coupons",
      description: "إنشاء وإدارة كوبونات الخصم",
      color: "text-primary",
      bgColor: "bg-primary/5",
    },
    {
      title: "تصميم الموقع",
      icon: Palette,
      href: "/idara-alkhasa/dashboard/design",
      description: "تخصيص ألوان وخطوط الموقع",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "إدارة المحتوى",
      icon: FileText,
      href: "/idara-alkhasa/dashboard/content",
      description: "إضافة وتعديل صفحات الموقع",
      color: "text-teal-600",
      bgColor: "bg-teal-50",
    },
    {
      title: "الإعدادات",
      icon: Settings,
      href: "/idara-alkhasa/dashboard/settings",
      description: "إعدادات الموقع ومعلومات الاتصال",
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">لوحة التحكم</h1>
                <p className="text-sm text-muted-foreground">متجر مكة للأزياء</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button asChild variant="outline">
                <Link href="/">
                  <ShoppingBag className="w-4 h-4 ml-2" />
                  عرض الموقع
                </Link>
              </Button>
              <Button variant="destructive" onClick={handleLogout}>
                <LogOut className="w-4 h-4 ml-2" />
                تسجيل الخروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">مرحباً بك في لوحة التحكم</h2>
          <p className="text-muted-foreground text-lg">اختر أحد الأقسام أدناه لإدارة متجرك</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="h-full hover:shadow-lg transition-all hover:border-primary cursor-pointer group">
                <CardHeader>
                  <div
                    className={`w-14 h-14 rounded-lg ${item.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <item.icon className={`w-7 h-7 ${item.color}`} />
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
