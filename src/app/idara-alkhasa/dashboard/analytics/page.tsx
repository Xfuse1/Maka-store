"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth-store"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getOrders, getCustomers } from "@/lib/local-db"
import { ShoppingCart, Users, DollarSign, Package, ArrowUp, ArrowDown } from "lucide-react"

export default function AnalyticsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    revenueGrowth: 12.5,
    ordersGrowth: 8.3,
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/idara-alkhasa")
      return
    }

    const orders = getOrders()
    const customers = getCustomers()

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0)
    const pendingOrders = orders.filter((o) => o.orderStatus === "pending").length

    setStats({
      totalOrders: orders.length,
      totalRevenue,
      totalCustomers: customers.length,
      pendingOrders,
      revenueGrowth: 12.5,
      ordersGrowth: 8.3,
    })
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  const statCards = [
    {
      title: "إجمالي المبيعات",
      value: `${stats.totalRevenue.toLocaleString()} ج.م`,
      icon: DollarSign,
      change: stats.revenueGrowth,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "إجمالي الطلبات",
      value: stats.totalOrders,
      icon: ShoppingCart,
      change: stats.ordersGrowth,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "العملاء",
      value: stats.totalCustomers,
      icon: Users,
      change: 15.2,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "طلبات قيد الانتظار",
      value: stats.pendingOrders,
      icon: Package,
      change: -5.1,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  return (
    <AdminLayout title="الإحصائيات والتحليلات" description="عرض شامل لأداء المتجر">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${stat.change >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {stat.change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                  {Math.abs(stat.change)}%
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="border-2">
          <CardHeader>
            <CardTitle>المبيعات الشهرية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between gap-2">
              {[45, 52, 48, 65, 58, 72, 68, 75, 82, 78, 85, 92].map((height, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-primary rounded-t transition-all hover:bg-primary/80"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-muted-foreground">{index + 1}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>أكثر المنتجات مبيعاً</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "عباية كلاسيكية سوداء", sales: 45, revenue: "20,250 ج.م" },
                { name: "عباية مطرزة فاخرة", sales: 38, revenue: "24,700 ج.م" },
                { name: "كارديجان وردي ناعم", sales: 32, revenue: "10,240 ج.م" },
                { name: "بدلة رسمية أنيقة", sales: 28, revenue: "23,800 ج.م" },
                { name: "فستان سهرة راقي", sales: 25, revenue: "19,500 ج.م" },
              ].map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm mb-1">{product.name}</p>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(product.sales / 45) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-left mr-4 min-w-[100px]">
                    <p className="text-sm font-bold">{product.sales} قطعة</p>
                    <p className="text-xs text-muted-foreground">{product.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>نظرة عامة على الطلبات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-3xl font-bold text-blue-600">{stats.pendingOrders}</p>
              <p className="text-sm text-muted-foreground mt-1">قيد الانتظار</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-3xl font-bold text-yellow-600">{Math.floor(stats.totalOrders * 0.3)}</p>
              <p className="text-sm text-muted-foreground mt-1">قيد المعالجة</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-3xl font-bold text-purple-600">{Math.floor(stats.totalOrders * 0.4)}</p>
              <p className="text-sm text-muted-foreground mt-1">تم الشحن</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-3xl font-bold text-green-600">{Math.floor(stats.totalOrders * 0.25)}</p>
              <p className="text-sm text-muted-foreground mt-1">تم التسليم</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  )
}
