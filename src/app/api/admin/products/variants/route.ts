import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

// POST - Create product variant
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()
    console.log("[v0] Creating variant with data:", body)

    const { data, error } = await supabase
      .from("product_variants")
      .insert([
        {
          product_id: body.product_id,
          name_ar: body.name_ar,
          name_en: body.name_en,
          size: body.size,
          color: body.color,
          color_hex: body.color_hex,
          price: body.price,
          inventory_quantity: body.inventory_quantity,
          sku: body.sku,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("[v0] Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log("[v0] Variant created successfully:", data)
    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error("[v0] Error:", err)
    const message = err instanceof Error ? err.message : "Failed to create variant"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
