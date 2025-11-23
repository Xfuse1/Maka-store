import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"

const BUCKET_NAME = "products"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Upload route called")

    const formData = await request.formData()
    console.log("[v0] FormData parsed successfully")

    const file = formData.get("file")
    const productId = formData.get("productId")

    //console.log("[v0] File type:", typeof file, "Product ID type:", typeof productId)

    if (!file || !(file instanceof File)) {
      console.error("[v0] Invalid file:", file)
      return NextResponse.json({ error: "Invalid or missing file" }, { status: 400 })
    }

    if (!productId || typeof productId !== "string") {
      console.error("[v0] Invalid productId:", productId)
      return NextResponse.json({ error: "Invalid or missing productId" }, { status: 400 })
    }

   // console.log("[v0] File name:", file.name, "Size:", file.size, "Type:", file.type)

    const supabase = getSupabaseAdminClient()

    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    console.log("[v0] Uploading to")

    const arrayBuffer = await file.arrayBuffer()

    console.log("[v0] ArrayBuffer size")

    // Upload using admin client (bypasses RLS)
    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, arrayBuffer, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    })

    if (error) {
      console.error("[v0] Supabase storage error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[v0] Upload successful")

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path)

    console.log("[v0] Public URL")

    return NextResponse.json({ url: publicUrl })
  } catch (error) {
    console.error("[v0] Upload API error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
