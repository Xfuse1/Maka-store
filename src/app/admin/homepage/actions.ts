"use server"

import { revalidatePath } from "next/cache"
import {
  getAllHomepageSectionsAdmin,
  createHomepageSection,
  updateHomepageSection,
  deleteHomepageSection,
  type HomepageSection,
} from "@/lib/supabase/homepage"

export async function getHomepageSectionsAction() {
  try {
    const sections = await getAllHomepageSectionsAdmin()
    return { success: true, data: sections }
  } catch (error) {
    console.error("[v0] Error in getHomepageSectionsAction:", error)
    return { success: false, error: "Failed to load homepage sections" }
  }
}

export async function createHomepageSectionAction(section: Omit<HomepageSection, "id" | "created_at" | "updated_at">) {
  try {
    const data = await createHomepageSection(section)
    revalidatePath("/")
    revalidatePath("/admin/homepage")
    return { success: true, data }
  } catch (error) {
    console.error("[v0] Error in createHomepageSectionAction:", error)
    return { success: false, error: "Failed to create homepage section" }
  }
}

export async function updateHomepageSectionAction(id: string, updates: Partial<HomepageSection>) {
  try {
    const data = await updateHomepageSection(id, updates)
    revalidatePath("/")
    revalidatePath("/admin/homepage")
    return { success: true, data }
  } catch (error) {
    console.error("[v0] Error in updateHomepageSectionAction:", error)
    return { success: false, error: "Failed to update homepage section" }
  }
}

export async function deleteHomepageSectionAction(id: string) {
  try {
    await deleteHomepageSection(id)
    revalidatePath("/")
    revalidatePath("/admin/homepage")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error in deleteHomepageSectionAction:", error)
    return { success: false, error: "Failed to delete homepage section" }
  }
}
