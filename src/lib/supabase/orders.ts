import { getSupabaseBrowserClient } from "./client"

export type Order = {
  id: string
  user_id: string
  items: any
  total_price: number
  status: string
  created_at: string
  shipping_address: string
  shipping_city: string
  shipping_state: string
  shipping_postal_code: string
  shipping_country: string
  billing_address: string
  payment_method: string
  payment_status: string
}

export async function createOrder(orderData: Partial<Order>) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.from("orders").insert([orderData]).select().single()
  if (error) {
    const msg = typeof error.message === "string" ? error.message : JSON.stringify(error)
    console.error("[v0] Supabase createOrder error:", error, "->", msg)
    throw new Error(msg)
  }
  return data
}

export async function updateOrderStatus(id: string, status: string) {
  // For admin actions we must use the server-side admin route (service role) because
  // browser client (anon key) may be blocked by RLS. Call the server PATCH route.
  try {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => null)
      const msg = body?.error ?? body?.message ?? `HTTP ${res.status} updating order`
      console.error("[v0] updateOrderStatus server error:", body, "->", msg)
      throw new Error(msg)
    }

    const body = await res.json().catch(() => null)
    // server returns { success: true } on success
    if (body && body.success) return body
    return body
  } catch (err: any) {
    const message = err?.message ?? (typeof err === "string" ? err : JSON.stringify(err))
    console.error("[v0] updateOrderStatus fetch error:", err, "->", message)
    throw new Error(message)
  }
}

export async function getOrderById(id: string) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.from("orders").select("*").eq("id", id).single()
  if (error) {
    const msg = typeof error.message === "string" ? error.message : JSON.stringify(error)
    console.error("[v0] Supabase getOrderById error:", error, "->", msg)
    throw new Error(msg)
  }
  return data as Order
}
