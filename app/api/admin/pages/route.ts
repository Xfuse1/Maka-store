import { type NextRequest, NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const adminClient = getAdminClient()

    // Only return static pages
    const STATIC_PAGE_PATHS = ["/about", "/contact", "/terms", "/privacy", "/return-policy", "/faq"]

    const { data, error } = await adminClient
      .from("page_content")
      .select("*")
      .in("page_path", STATIC_PAGE_PATHS)
      .order("page_path")

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error: any) {
    console.error("[v0] Error fetching pages:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminClient = getAdminClient()
    const body = await request.json()

    const { data, error } = await adminClient.from("page_content").insert([body]).select().single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[v0] Error creating page:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
