import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, DollarSign, ShoppingBag, Users, Package } from "lucide-react"

async function fetchAnalytics() {
  const supabase = getSupabaseAdminClient()

  const [{ data: ordersData, error: ordersError }, { data: productsData, error: productsError }] = await Promise.all([
    supabase.from("orders").select("total"),
    supabase.from("products").select("id, name_ar, base_price")
  ])

  if (ordersError || productsError) {
    throw new Error(ordersError?.message || productsError?.message)
  }

  const totalRevenue = (ordersData || []).reduce((s: number, o: any) => s + (Number(o.total) || 0), 0)
  const totalOrders = (ordersData || []).length
  const totalProducts = (productsData || []).length

  const { data: orderItems, error: orderItemsError } = await supabase
    .from("order_items")
    .select("product_id, product_name_ar, product_name_en, quantity, total_price")

  let topProducts: Array<{ name: string; sales: number; revenue: number }> = []
  if (!orderItemsError && Array.isArray(orderItems)) {
    const map: Record<string, { name: string; sales: number; revenue: number }> = {}
    for (const it of orderItems as any[]) {
      const id = it.product_id || "unknown"
      const name = it.product_name_ar || it.product_name_en || id
      const qty = Number(it.quantity) || 0
      const rev = Number(it.total_price) || 0
      if (!map[id]) map[id] = { name, sales: 0, revenue: 0 }
      map[id].sales += qty
      map[id].revenue += rev
    }
    topProducts = Object.values(map).sort((a, b) => b.sales - a.sales).slice(0, 10)
  }

  const stats = {
    revenue: { current: totalRevenue, previous: 0, change: 0 },
    orders: { current: totalOrders, previous: 0, change: 0 },
    customers: { current: 0, previous: 0, change: 0 },
    products: { current: totalProducts, previous: 0, change: 0 },
  }

  return { stats, topProducts }
}

export default async function AdminAnalyticsPage() {
  let stats = {
    revenue: { current: 0, previous: 0, change: 0 },
    orders: { current: 0, previous: 0, change: 0 },
    customers: { current: 0, previous: 0, change: 0 },
    products: { current: 0, previous: 0, change: 0 },
  }
  let topProducts: Array<{ name: string; sales: number; revenue: number }> = []

  try {
    const data = await fetchAnalytics()
    stats = data.stats
    topProducts = data.topProducts
  } catch (err: any) {
    // server-side render should avoid throwing for admin pages; show zeroed stats instead
    console.error("Failed to load analytics:", err)
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">التحليلات والإحصائيات</h1>
        <p className="text-muted-foreground text-base">تقارير الأداء والمبيعات</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="border-2 border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-2">
              {Number(stats.revenue.current || 0).toLocaleString('en-US')} ج.م
            </div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600" />

              <span className="text-muted-foreground">عن الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">عدد الطلبات</CardTitle>
            <ShoppingBag className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-2">{Number(stats.orders.current || 0).toLocaleString('en-US')}</div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-medium">+{stats.orders.change}%</span>
              <span className="text-muted-foreground">عن الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">العملاء الجدد</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-2">{Number(stats.customers.current || 0).toLocaleString('en-US')}</div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-medium">+{stats.customers.change}%</span>
              <span className="text-muted-foreground">عن الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">المنتجات النشطة</CardTitle>
            <Package className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground mb-2">{Number(stats.products.current || 0).toLocaleString('en-US')}</div>
            <div className="flex items-center gap-1 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-green-600 font-medium">+{stats.products.change}%</span>
              <span className="text-muted-foreground">عن الشهر الماضي</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-border">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground">المنتجات الأكثر مبيعاً</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">#{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.sales} عملية بيع</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-xl font-bold text-primary">{Number(product.revenue || 0).toLocaleString('en-US')} ج.م</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
