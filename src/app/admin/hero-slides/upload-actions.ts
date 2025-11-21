"use server"

import { getSupabaseAdminClient } from "@/lib/supabase/admin"

export async function uploadHeroSlideImage(formData: FormData) {
  try {
    const file = formData.get("file") as File
    if (!file) {
      return { success: false, error: "No file provided" }
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "File must be an image" }
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: "File size must be less than 5MB" }
    }

    const supabase = getSupabaseAdminClient()

    // Create unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    const filePath = `hero-slides/${fileName}`

    // Convert File to ArrayBuffer then to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("hero-slides")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error("Upload error:", error)
      return { success: false, error: error.message }
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("hero-slides").getPublicUrl(filePath)

    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath,
    }
  } catch (error: any) {
    console.error("Error uploading hero slide image:", error)
    return { success: false, error: error?.message || "Failed to upload image" }
  }
}

export async function deleteHeroSlideImage(filePath: string) {
  try {
    const supabase = getSupabaseAdminClient()

    const { error } = await supabase.storage.from("hero-slides").remove([filePath])

    if (error) {
      console.error("Delete error:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error deleting hero slide image:", error)
    return { success: false, error: error?.message || "Failed to delete image" }
  }
}
