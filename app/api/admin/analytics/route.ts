import { NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient()

    // total revenue (sum of total) and counts
    const [{ data: ordersData, error: ordersError }, { data: productsData, error: productsError }] = await Promise.all([
    supabase.from("orders").select("total"),
    supabase.from("products").select("id, name_ar, base_price")
    ])

    if (ordersError || productsError) {
      return NextResponse.json({ error: ordersError?.message || productsError?.message }, { status: 500 })
    }

    const totalRevenue = (ordersData || []).reduce((s: number, o: any) => s + (Number(o.total) || 0), 0)
    const totalOrders = (ordersData || []).length
    const totalProducts = (productsData || []).length

    // fetch raw order_items and aggregate in JS to avoid PostgREST aggregation/group issues
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
      topProducts = Object.values(map).sort((a, b) => b.sales - a.sales).slice(0, 5)
    }

    const stats = {
      revenue: { current: totalRevenue, previous: 0, change: 0 },
      orders: { current: totalOrders, previous: 0, change: 0 },
      customers: { current: 0, previous: 0, change: 0 },
      products: { current: totalProducts, previous: 0, change: 0 },
    }

    return NextResponse.json({ stats, topProducts })
  } catch (err: any) {
    // return helpful error info during development
    return NextResponse.json({ error: err?.message || String(err), stack: err?.stack }, { status: 500 })
  }
}
