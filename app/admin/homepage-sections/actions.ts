"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export interface HomepageSection {
  id: string
  name_ar: string
  name_en: string | null
  section_type: string
  display_order: number
  is_active: boolean
  max_items: number
  product_ids: string[]
  category_ids: string[]
  layout_type: string
  show_title: boolean
  show_description: boolean
  background_color: string
  custom_content: Record<string, any>
  created_at: string
  updated_at: string
}

export async function getAllSections() {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("homepage_sections")
      .select("*")
      .order("display_order", { ascending: true })

    if (error) throw error

    return { success: true, data: data as HomepageSection[] }
  } catch (error) {
    console.error("Error fetching sections:", error)
    return { success: false, error: "Failed to fetch sections" }
  }
}

export async function createSection(section: Partial<HomepageSection>) {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase.from("homepage_sections").insert([section]).select().single()

    if (error) throw error

    revalidatePath("/")
    revalidatePath("/admin/homepage-sections")

    return { success: true, data }
  } catch (error) {
    console.error("Error creating section:", error)
    return { success: false, error: "Failed to create section" }
  }
}

export async function updateSection(id: string, updates: Partial<HomepageSection>) {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase.from("homepage_sections").update(updates).eq("id", id).select().single()

    if (error) throw error

    revalidatePath("/")
    revalidatePath("/admin/homepage-sections")

    return { success: true, data }
  } catch (error) {
    console.error("Error updating section:", error)
    return { success: false, error: "Failed to update section" }
  }
}

export async function deleteSection(id: string) {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase.from("homepage_sections").delete().eq("id", id)

    if (error) throw error

    revalidatePath("/")
    revalidatePath("/admin/homepage-sections")

    return { success: true }
  } catch (error) {
    console.error("Error deleting section:", error)
    return { success: false, error: "Failed to delete section" }
  }
}

export async function toggleSectionVisibility(id: string, isActive: boolean) {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from("homepage_sections")
      .update({ is_active: isActive })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    revalidatePath("/")
    revalidatePath("/admin/homepage-sections")

    return { success: true, data }
  } catch (error) {
    console.error("Error toggling visibility:", error)
    return { success: false, error: "Failed to toggle visibility" }
  }
}

export async function reorderSections(sectionIds: string[]) {
  try {
    const supabase = createAdminClient()

    // Update display_order for each section
    const updates = sectionIds.map((id, index) =>
      supabase.from("homepage_sections").update({ display_order: index }).eq("id", id),
    )

    await Promise.all(updates)

    revalidatePath("/")
    revalidatePath("/admin/homepage-sections")

    return { success: true }
  } catch (error) {
    console.error("Error reordering sections:", error)
    return { success: false, error: "Failed to reorder sections" }
  }
}
