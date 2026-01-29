"use server"

import { createClient } from "@supabase/supabase-js"
import { VIDEO_CONFIG, validateVideoFile } from "@/lib/supabase/video-upload"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase environment variables")
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

/**
 * Server action to upload video file to Supabase Storage
 * This is more secure than client-side uploads as it uses service role key
 * 
 * @param formData - FormData containing 'file' and 'productId'
 * @returns { url?: string, error?: string }
 */
export async function uploadProductVideo(formData: FormData): Promise<{ url?: string; error?: string }> {
  try {
    const file = formData.get("file") as File | null
    const productId = formData.get("productId") as string | null

    if (!file || !productId) {
      return { error: "ملف أو معرّف المنتج غير موجود" }
    }

    // Validate file
    const validation = validateVideoFile(file)
    if (!validation.valid) {
      return { error: validation.error }
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split(".").pop() || "mp4"
    const fileName = `${productId}/${timestamp}.${fileExtension}`
    const filePath = `${VIDEO_CONFIG.PUBLIC_PATH}/${fileName}`

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to storage
    const { data, error: uploadError } = await supabase.storage
      .from(VIDEO_CONFIG.BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("[v0] Video upload error:", uploadError)
      return { error: `خطأ في رفع الفيديو: ${uploadError.message}` }
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(VIDEO_CONFIG.BUCKET_NAME)
      .getPublicUrl(filePath)

    return {
      url: publicUrlData.publicUrl,
      error: undefined,
    }
  } catch (error) {
    console.error("[v0] Upload action error:", error)
    const message = error instanceof Error ? error.message : "خطأ غير معروف في رفع الفيديو"
    return { error: message }
  }
}

/**
 * Server action to delete video file from Supabase Storage
 * 
 * @param videoUrl - Full video URL from Supabase Storage
 * @returns { success: boolean, error?: string }
 */
export async function deleteProductVideo(videoUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Only delete if it's a Supabase Storage URL
    if (!videoUrl.includes(supabaseUrl)) {
      return { success: true } // Not a Supabase URL, skip deletion
    }

    // Extract file path from URL
    const urlParts = videoUrl.split(`/storage/v1/object/public/${VIDEO_CONFIG.BUCKET_NAME}/`)
    if (urlParts.length < 2) {
      return { success: true } // Invalid URL format, skip
    }

    const filePath = urlParts[1]

    // Delete from storage
    const { error: deleteError } = await supabase.storage
      .from(VIDEO_CONFIG.BUCKET_NAME)
      .remove([filePath])

    if (deleteError) {
      console.error("[v0] Video delete error:", deleteError)
      return { success: false, error: `خطأ في حذف الفيديو: ${deleteError.message}` }
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Delete action error:", error)
    const message = error instanceof Error ? error.message : "خطأ غير معروف في حذف الفيديو"
    return { success: false, error: message }
  }
}
