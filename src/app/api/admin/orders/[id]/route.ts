import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { status } = await request.json()
  const supabase = getSupabaseAdminClient() as any // service-role client

  // Return the updated row so callers can confirm the change.
  const { data, error } = await supabase.from("orders").update({ status }).eq("id", id).select().maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message ?? JSON.stringify(error) }, { status: 400 })
  }

  if (!data) {
    return NextResponse.json({ error: `Order not found for id=${id}` }, { status: 404 })
  }

  return NextResponse.json({ success: true, order: data })
}
