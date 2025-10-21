"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"

export async function getHeroSlides() {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("homepage_sections")
    .select("*")
    .eq("section_type", "hero")
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Error fetching hero slides:", error)
    return []
  }

  return data || []
}

export async function createHeroSlide(formData: FormData) {
  const supabase = createAdminClient()

  const slideData = {
    section_type: "hero",
    name_ar: formData.get("name_ar") as string,
    title_ar: formData.get("title_ar") as string,
    subtitle_ar: formData.get("subtitle_ar") as string,
    description_ar: formData.get("description_ar") as string,
    button_text_ar: formData.get("button_text_ar") as string,
    button_link: formData.get("button_link") as string,
    image_url: formData.get("image_url") as string,
    display_order: Number.parseInt(formData.get("display_order") as string) || 1,
    is_active: formData.get("is_active") === "true",
    show_title: true,
    show_description: true,
  }

  const { error } = await supabase.from("homepage_sections").insert(slideData)

  if (error) {
    console.error("Error creating hero slide:", error)
    throw new Error("Failed to create hero slide")
  }

  revalidatePath("/")
  revalidatePath("/admin/hero-slides")
}

export async function updateHeroSlide(id: string, formData: FormData) {
  const supabase = createAdminClient()

  const slideData = {
    name_ar: formData.get("name_ar") as string,
    title_ar: formData.get("title_ar") as string,
    subtitle_ar: formData.get("subtitle_ar") as string,
    description_ar: formData.get("description_ar") as string,
    button_text_ar: formData.get("button_text_ar") as string,
    button_link: formData.get("button_link") as string,
    image_url: formData.get("image_url") as string,
    display_order: Number.parseInt(formData.get("display_order") as string) || 1,
    is_active: formData.get("is_active") === "true",
  }

  const { error } = await supabase.from("homepage_sections").update(slideData).eq("id", id)

  if (error) {
    console.error("Error updating hero slide:", error)
    throw new Error("Failed to update hero slide")
  }

  revalidatePath("/")
  revalidatePath("/admin/hero-slides")
}

export async function deleteHeroSlide(id: string) {
  const supabase = createAdminClient()

  const { error } = await supabase.from("homepage_sections").delete().eq("id", id)

  if (error) {
    console.error("Error deleting hero slide:", error)
    throw new Error("Failed to delete hero slide")
  }

  revalidatePath("/")
  revalidatePath("/admin/hero-slides")
}

export async function toggleHeroSlideStatus(id: string, isActive: boolean) {
  const supabase = createAdminClient()

  const { error } = await supabase.from("homepage_sections").update({ is_active: !isActive }).eq("id", id)

  if (error) {
    console.error("Error toggling hero slide status:", error)
    throw new Error("Failed to toggle hero slide status")
  }

  revalidatePath("/")
  revalidatePath("/admin/hero-slides")
}
