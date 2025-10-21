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
  if (error) throw error
  return data
}

export async function updateOrderStatus(id: string, status: string) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.from("orders").update({ status }).eq("id", id).select().single()
  if (error) throw error
  return data
}

export async function getOrderById(id: string) {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase.from("orders").select("*").eq("id", id).single()
  if (error) throw error
  return data as Order
}
