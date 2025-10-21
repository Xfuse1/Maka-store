import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"

// GET - Fetch single product
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = getSupabaseAdminClient()

    const { data, error } = await supabase
      .from("products")
      .select(`
        *,
        category:categories(name_ar, name_en),
        product_images(*),
        product_variants(*)
      `)
      .eq("id", id)
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error("[v0] Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

// PATCH - Update product
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const supabase = getSupabaseAdminClient() as any // <-- fix type error

    // فقط الحقول المسموحة للتحديث
    const allowedFields = [
      "name_ar",
      "name_en",
      "slug",
      "description_ar",
      "description_en",
      "category_id",
      "base_price",
      "is_featured",
      "is_active",
      "sku",
      "inventory_quantity",
      "shipping_type",
      "shipping_cost"
    ]
    const updateData: Record<string, any> = {}
    for (const key of allowedFields) {
      if (key in body) updateData[key] = body[key]
    }

    const { data, error } = await supabase
      .from("products")
      .update({ ...updateData })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error("[v0] Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = getSupabaseAdminClient()

    const { error } = await supabase.from("products").delete().eq("id", id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
