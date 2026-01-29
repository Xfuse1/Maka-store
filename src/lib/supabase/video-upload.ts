import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Video upload configuration
 * Recommendation: Adjust based on your hosting capabilities
 */
export const VIDEO_CONFIG = {
  // Maximum file size: 500MB
  MAX_SIZE: 500 * 1024 * 1024,
  // Supported formats
  SUPPORTED_FORMATS: ["video/mp4", "video/webm", "video/quicktime"],
  // Bucket name for storing product videos
  BUCKET_NAME: "product-videos",
  // Public access path
  PUBLIC_PATH: "public",
}

/**
 * Validate video file before upload
 * @param file - Video file to validate
 * @returns { valid: boolean, error?: string }
 */
export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > VIDEO_CONFIG.MAX_SIZE) {
    return {
      valid: false,
      error: `حجم الفيديو كبير جداً. الحد الأقصى: ${VIDEO_CONFIG.MAX_SIZE / (1024 * 1024)}MB`,
    }
  }

  // Check file type
  if (!VIDEO_CONFIG.SUPPORTED_FORMATS.includes(file.type)) {
    return {
      valid: false,
      error: `صيغة الفيديو غير مدعومة. الصيغ المدعومة: ${VIDEO_CONFIG.SUPPORTED_FORMATS.map((f) => f.split("/")[1]).join(", ")}`,
    }
  }

  return { valid: true }
}

/**
 * Upload video file to Supabase Storage
 * Recommendation: Use this for self-hosted videos. YouTube/Vimeo URLs should be stored directly.
 *
 * @param file - Video file to upload
 * @param productId - Product ID for organizing videos
 * @returns { url: string, error?: string }
 */
export async function uploadVideoToSupabase(
  file: File,
  productId: string
): Promise<{ url: string | null; error?: string }> {
  try {
    // Validate file first
    const validation = validateVideoFile(file)
    if (!validation.valid) {
      return { url: null, error: validation.error }
    }

    // Generate unique filename to avoid conflicts
    const timestamp = Date.now()
    const fileExtension = file.name.split(".").pop() || "mp4"
    const fileName = `${productId}/${timestamp}.${fileExtension}`

    // Upload to Supabase Storage
    const { data, error: uploadError } = await supabase.storage
      .from(VIDEO_CONFIG.BUCKET_NAME)
      .upload(`${VIDEO_CONFIG.PUBLIC_PATH}/${fileName}`, file, {
        cacheControl: "3600", // Cache for 1 hour
        upsert: false,
      })

    if (uploadError) {
      return { url: null, error: `خطأ في رفع الفيديو: ${uploadError.message}` }
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(VIDEO_CONFIG.BUCKET_NAME)
      .getPublicUrl(`${VIDEO_CONFIG.PUBLIC_PATH}/${fileName}`)

    return {
      url: publicUrlData.publicUrl,
      error: undefined,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "خطأ غير معروف في رفع الفيديو"
    return { url: null, error: message }
  }
}

/**
 * Delete video file from Supabase Storage
 * Recommendation: Call this when updating product with new video or deleting product
 *
 * @param videoUrl - Full video URL from Supabase Storage
 * @returns { success: boolean, error?: string }
 */
export async function deleteVideoFromSupabase(videoUrl: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Only delete if it's a Supabase Storage URL
    if (!videoUrl.includes(supabaseUrl)) {
      return { success: true } // Not a Supabase URL, skip deletion
    }

    // Extract file path from URL
    // URL format: https://xxx.supabase.co/storage/v1/object/public/product-videos/public/productId/timestamp.mp4
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
      return { success: false, error: `خطأ في حذف الفيديو: ${deleteError.message}` }
    }

    return { success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "خطأ غير معروف في حذف الفيديو"
    return { success: false, error: message }
  }
}

/**
 * Check if URL is a YouTube URL
 * @param url - URL to check
 * @returns boolean
 */
export function isYouTubeUrl(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be")
}

/**
 * Extract YouTube video ID from various URL formats
 * @param url - YouTube URL
 * @returns Video ID or null
 */
export function extractYouTubeId(url: string): string | null {
  try {
    if (url.includes("v=")) {
      return url.split("v=")[1].split("&")[0]
    }
    if (url.includes("youtu.be/")) {
      return url.split("youtu.be/")[1].split("?")[0]
    }
    return null
  } catch {
    return null
  }
}
