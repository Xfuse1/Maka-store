import { NextRequest, NextResponse } from "next/server"
import { uploadProductVideo } from "@/app/api/admin/products/video-actions"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    
    const result = await uploadProductVideo(formData)
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      url: result.url,
      success: true,
    })
  } catch (error: any) {
    console.error("[v0] Video upload API error:", error)
    return NextResponse.json(
      { error: error?.message || "خطأ في رفع الفيديو" },
      { status: 500 }
    )
  }
}
