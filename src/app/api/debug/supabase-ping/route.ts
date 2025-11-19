import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const admin = getAdminClient()

    // Try a lightweight query against a common table. If the table doesn't exist
    // the error will still include network/auth details which are useful for debugging.
    const { data, error, status } = await (admin.from("homepage_sections") as any).select("id").limit(1)

    return NextResponse.json({ ok: true, status, data, error: error ? { message: error.message, details: error } : null })
  } catch (err: any) {
    // Surface the raw error message for diagnostics
    console.error("/api/debug/supabase-ping error:", err)
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
