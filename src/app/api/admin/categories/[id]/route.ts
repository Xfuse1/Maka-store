import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
)

// GET - Fetch category by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { data, error } = await supabase.from("categories").select("*").eq("id", params.id).single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error("[v0] Error fetching category:", error)
    return NextResponse.json({ error: "Failed to fetch category" }, { status: 500 })
  }
}

// PATCH - Update category
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { data, error } = await supabase
      .from("categories")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error("[v0] Error updating category:", error)
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 })
  }
}

// DELETE - Delete category
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await supabase.from("categories").delete().eq("id", params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
