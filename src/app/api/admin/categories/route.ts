import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
)

// GET - Fetch all categories
export async function GET() {
  const { data, error } = await supabase.from("categories").select("*").order("name_ar")
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data })
}

// POST - Create a new category
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { data, error } = await supabase.from("categories").insert([body]).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ data }, { status: 201 })
}
