import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  const supabase = createAdminClient()

  // Pick a known variant to test with (you should update this ID if needed)
  // For now, we'll just try to find *any* variant with stock > 0
  const { data: variantData, error: fetchError } = await supabase
    .from("product_variants")
    .select("id, inventory_quantity")
    .gt("inventory_quantity", 0)
    .limit(1)
    .single()

  if (fetchError || !variantData) {
    return NextResponse.json({ error: "No variant found with stock > 0", fetchError })
  }

  const variant = variantData as any
  const variantId = variant.id
  const qty = 1
  const initialStock = variant.inventory_quantity

  console.log(`[Debug] Testing decrement for variant ${variantId}. Initial stock: ${initialStock}`)

  // 1. Try RPC
  let rpcSuccess = false
  let rpcErrorResult = null
  try {
    // supabase.rpc generic typings may not include our RPC params, cast to `any` to avoid
    // TS2345 in this debug helper. This is a localized, non-production debug route.
    const params: any = { variant_id: variantId, qty }
    const { data, error } = await supabase.rpc('decrease_inventory', params)
    rpcSuccess = data === true
    rpcErrorResult = error
  } catch (e) {
    rpcErrorResult = e
  }

  // 2. Check new stock
  const { data: refreshedData } = await supabase.from("product_variants").select("inventory_quantity").eq("id", variantId).single()
  const refreshed = refreshedData as any
  const newStock = refreshed?.inventory_quantity

  return NextResponse.json({
    success: true,
    test: {
      variantId,
      initialStock,
      qtyToDecrement: qty,
      rpcResult: {
        success: rpcSuccess,
        error: rpcErrorResult
      },
      finalStock: newStock,
      decremented: newStock === initialStock - qty
    }
  })
}
