import { supabase } from "../supabase"
import { getAdminClient } from "./admin"

export type HomepageSection = {
  id: string
  section_type: string
  // optional fields used by hero slides / custom content
  image_url?: string | null
  title_ar?: string | null
  subtitle_ar?: string | null
  description_ar?: string | null
  button_text_ar?: string | null
  button_link?: string | null
  name_ar: string | null
  name_en: string | null
  layout_type: string | null
  background_color: string | null
  show_title: boolean
  show_description: boolean
  product_ids: any
  category_ids: any
  custom_content: any
  max_items: number | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function getAllHomepageSections(): Promise<HomepageSection[]> {
  const { data, error } = await supabase
    .from("homepage_sections")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching homepage sections:", error)
    throw error
  }

  return data || []
}

export async function getAllHomepageSectionsAdmin(): Promise<HomepageSection[]> {
  const adminClient = getAdminClient()
  const { data, error } = await (adminClient.from("homepage_sections") as any)
    .select("*")
    .order("display_order", { ascending: true })

  if (error) {
    console.error("[v0] Error fetching homepage sections (admin):", error)
    throw error
  }

  return data || []
}

export async function createHomepageSection(section: Omit<HomepageSection, "id" | "created_at" | "updated_at">) {
  const adminClient = getAdminClient()
  const { data, error } = await (adminClient.from("homepage_sections") as any).insert(section as any).select().single()

  if (error) {
    console.error("[v0] Error creating homepage section:", error)
    throw error
  }

  return data
}

export async function updateHomepageSection(id: string, updates: Partial<HomepageSection>) {
  const adminClient = getAdminClient()
  const { data, error } = await (adminClient.from("homepage_sections") as any)
    .update({ ...(updates as any), updated_at: new Date().toISOString() } as any)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[v0] Error updating homepage section:", error)
    throw error
  }

  return data
}

export async function deleteHomepageSection(id: string) {
  const adminClient = getAdminClient()
  const { error } = await (adminClient.from("homepage_sections") as any).delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting homepage section:", error)
    throw error
  }
}
