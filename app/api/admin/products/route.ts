import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
)

// GET - Fetch all products
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(name_ar, name_en),
        product_images(id, image_url, alt_text_ar, display_order, is_primary),
        product_variants(id, name_ar, name_en, size, color, color_hex, price, inventory_quantity, sku)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch products"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("[v0] Creating product with data:", body)

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name_ar: body.name_ar,
          name_en: body.name_en,
          slug: body.slug,
          description_ar: body.description_ar,
          description_en: body.description_en,
          category_id: body.category_id,
          base_price: body.base_price,
          is_featured: body.is_featured,
          is_active: body.is_active,
          sku: body.sku,
          inventory_quantity: body.inventory_quantity,
          shipping_type: body.shipping_type,
          shipping_cost: body.shipping_cost,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error("[v0] Supabase error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log("[v0] Product created successfully:", data)
    return NextResponse.json({ data }, { status: 201 })
  } catch (err) {
    console.error("[v0] Error:", err)
    const message = err instanceof Error ? err.message : "Failed to create product"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
