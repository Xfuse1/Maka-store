import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

// GET - Fetch all categories
export async function GET() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("categories").select("*").order("name_ar")
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

// POST - Create a new category
export async function POST(request: NextRequest) {
  const supabase = createAdminClient()
  const body = await request.json()
  const { data, error } = await (supabase.from("categories") as any).insert([body]).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data }, { status: 201 })
}
