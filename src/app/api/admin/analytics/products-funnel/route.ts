import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fromParam = searchParams.get("from")
    const toParam = searchParams.get("to")

    const to = toParam ? new Date(toParam) : new Date()
    const from = fromParam ? new Date(fromParam) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const supabase = getSupabaseAdminClient()

    // 1. Fetch Analytics Events (Views, AddToCart, Checkout)
    const { data: events, error: eventsError } = await supabase
      .from("analytics_events")
      .select("event_name, product_id")
      .gte("created_at", from.toISOString())
      .lte("created_at", to.toISOString())
      .not("product_id", "is", null)

    if (eventsError) throw eventsError

    // 2. Fetch Actual Purchases from order_items
    const { data: purchaseItems, error: purchasesError } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .gte("created_at", from.toISOString())
      .lte("created_at", to.toISOString())

    if (purchasesError) throw purchasesError

    // 3. Fetch Product Details
    // We get unique product IDs from both sources to fetch names
    const productIds = new Set([
      ...((events as any[])?.map(e => e.product_id) || []),
      ...((purchaseItems as any[])?.map(i => i.product_id) || [])
    ].filter(Boolean) as string[])

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name_ar, name_en")
      .in("id", Array.from(productIds))

    if (productsError) throw productsError

    const productMap = new Map((products as any[])?.map(p => [p.id, p]))

    // 4. Aggregate Stats
    const statsMap: Record<string, {
      productId: string
      productName: string | null
      views: number
      addToCart: number
      checkout: number
      purchases: number
    }> = {}

    // Initialize with known products
    productIds.forEach(id => {
      const p = productMap.get(id)
      statsMap[id] = {
        productId: id,
        productName: p ? (p.name_ar || p.name_en) : "Unknown Product",
        views: 0,
        addToCart: 0,
        checkout: 0,
        purchases: 0
      }
    })

    // Count Events
    ;(events as any[])?.forEach((e: any) => {
      const id = e.product_id
      if (statsMap[id]) {
        if (e.event_name === "ViewContent") statsMap[id].views++
        else if (e.event_name === "AddToCart") statsMap[id].addToCart++
        else if (e.event_name === "InitiateCheckout") statsMap[id].checkout++
      }
    })

    // Count Purchases
    ;(purchaseItems as any[])?.forEach((item: any) => {
      const id = item.product_id
      if (statsMap[id]) {
        statsMap[id].purchases += (Number(item.quantity) || 1)
      }
    })

    // Calculate Rates and Format
    const funnel = Object.values(statsMap).map(item => ({
      ...item,
      viewToPurchaseRate: item.views > 0 ? (item.purchases / item.views) * 100 : 0
    })).sort((a, b) => b.purchases - a.purchases) // Sort by purchases desc

    return NextResponse.json({ products: funnel })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
