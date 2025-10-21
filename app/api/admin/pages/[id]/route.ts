import { type NextRequest, NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase/admin"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminClient = getAdminClient()
    const body = await request.json()

    const { data, error } = await adminClient.from("page_content").update(body).eq("id", params.id).select().single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[v0] Error updating page:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const adminClient = getAdminClient()

    const { error } = await adminClient.from("page_content").delete().eq("id", params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[v0] Error deleting page:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
