import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { status } = await request.json()
  const supabase = getSupabaseAdminClient() as any // service-role client

  // Return the updated row so callers can confirm the change.
  const { data, error } = await supabase.from("orders").update({ status }).eq("id", id).select().maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message ?? JSON.stringify(error) }, { status: 400 })
  }

  if (!data) {
    return NextResponse.json({ error: `Order not found for id=${id}` }, { status: 404 })
  }

  return NextResponse.json({ success: true, order: data })
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = getSupabaseAdminClient() as any

  // fetch order row
  const { data: order, error: orderError } = await supabase.from('orders').select('*').eq('id', id).maybeSingle()
  if (orderError) {
    return NextResponse.json({ error: orderError.message ?? JSON.stringify(orderError) }, { status: 500 })
  }
  if (!order) {
    return NextResponse.json({ error: `Order not found for id=${id}` }, { status: 404 })
  }

  // fetch order items separately
  const { data: items, error: itemsError } = await supabase.from('order_items').select('*').eq('order_id', id)
  if (itemsError) {
    // return order even if items fetch fails
    return NextResponse.json({ order, items: [], error: itemsError.message ?? JSON.stringify(itemsError) }, { status: 200 })
  }

  return NextResponse.json({ order: { ...order, items } })
}
