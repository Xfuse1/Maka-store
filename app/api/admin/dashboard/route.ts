import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  const supabase = getSupabaseAdminClient()
  // Only fetch summary stats and recent orders for dashboard
  const [{ data: orders, error: ordersError }, { data: products, error: productsError }, { data: customers, error: customersError }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, order_number, customer_name, total, status, created_at")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("products")
      .select("id"),
    supabase
      .from("customers")
      .select("id"),
  ])

  if (ordersError || productsError || customersError) {
    return NextResponse.json({ error: ordersError?.message || productsError?.message || customersError?.message }, { status: 500 })
  }

  // Calculate stats
  const stats = {
    totalProducts: products.length,
    totalOrders: Array.isArray(orders) ? orders.length : 0,
    totalRevenue: Array.isArray(orders) ? orders.reduce((sum, o: any) => sum + (o.total || 0), 0) : 0,
    totalCustomers: Array.isArray(customers) ? customers.length : 0,
    pendingOrders: Array.isArray(orders) ? orders.filter((o: any) => o.status === "pending" || o.status === "قيد المعالجة").length : 0,
    lowStockProducts: 0, // You can add a query for low stock if needed
  }

  return NextResponse.json({ stats, recentOrders: orders })
}
