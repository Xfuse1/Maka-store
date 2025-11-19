import { supabase } from "../supabase"
import { getAdminClient } from "./admin"

export type HomepageSection = {
  id: string
  section_type: string
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

export type HeroSlide = {
  id: string
  title_ar: string
  title_en?: string | null
  subtitle_ar?: string | null
  subtitle_en?: string | null
  image_url: string
  link_url?: string | null
  display_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export async function getAllHomepageSections(): Promise<HomepageSection[]> {
  try {
    const { data, error } = await supabase
      .from("homepage_sections")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })

    if (error) {
      // Log useful error information without throwing to avoid client runtime crashes
      try {
        console.error("Error fetching homepage sections:", error?.message ?? JSON.stringify(error))
      } catch (e) {
        console.error("Error fetching homepage sections: (unable to stringify error)", error)
      }

      // Return empty array so client components (like HeroSlider) can render safely
      return []
    }

    return data || []
  } catch (err: any) {
    // Catch network-level or unexpected exceptions (e.g. fetch failing)
    try {
      console.error("Error fetching homepage sections (exception):", err?.message ?? String(err))
    } catch (e) {
      console.error("Error fetching homepage sections (exception):", err)
    }

    return []
  }
}

export async function getAllHeroSlides(): Promise<HeroSlide[]> {
  try {
    const tryTable = async (tableName: string) => {
      return supabase.from(tableName).select("*").eq("is_active", true).order("display_order", { ascending: true })
    }

    let res = await tryTable("hero_slides")
    // If table not found (PGRST205) or message mentions missing table, try legacy/table named `sliders`
    if (res.error && (res.error.code === "PGRST205" || String(res.error.message).includes("Could not find the table 'public.hero_slides'"))) {
      res = await tryTable("sliders")
    }

    const { data, error } = res

    if (error) {
      try {
        console.error("Error fetching hero slides:", error?.message ?? JSON.stringify(error))
      } catch (e) {
        console.error("Error fetching hero slides: (unable to stringify error)", error)
      }

      return []
    }

    return data || []
  } catch (err: any) {
    try {
      console.error("Error fetching hero slides (exception):", err?.message ?? String(err))
    } catch (e) {
      console.error("Error fetching hero slides (exception):", err)
    }

    return []
  }
}

export async function getAllHomepageSectionsAdmin(): Promise<HomepageSection[]> {
  const adminClient = getAdminClient()
  const { data, error } = await (adminClient.from("homepage_sections") as any)
    .select("*")
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Error fetching homepage sections (admin):", error)
    throw error
  }

  return data || []
}

export async function getAllHeroSlidesAdmin(): Promise<HeroSlide[]> {
  const adminClient = getAdminClient()
  const tryTable = async (tableName: string) => (adminClient.from(tableName) as any).select("*").order("display_order", { ascending: true })

  let res = await tryTable("hero_slides")
  if (res.error && (res.error.code === "PGRST205" || String(res.error.message).includes("Could not find the table 'public.hero_slides'"))) {
    res = await tryTable("sliders")
  }

  const { data, error } = res

  if (error) {
    console.error("Error fetching hero slides (admin):", error)
    throw error
  }

  return data || []
}

export async function createHomepageSection(section: Omit<HomepageSection, "id" | "created_at" | "updated_at">) {
  const adminClient = getAdminClient()
  const { data, error } = await (adminClient.from("homepage_sections") as any).insert(section as any).select().single()

  if (error) {
    console.error("Error creating homepage section:", error)
    throw error
  }

  return data
}

export async function createHeroSlide(slide: Omit<HeroSlide, "id" | "created_at" | "updated_at">) {
  const adminClient = getAdminClient()
  // Try to insert into hero_slides; if table missing, fall back to sliders
  const tryInsert = async (tableName: string) => (adminClient.from(tableName) as any).insert(slide as any).select().single()

  let res = await tryInsert("hero_slides")
  if (res.error && (res.error.code === "PGRST205" || String(res.error.message).includes("Could not find the table 'public.hero_slides'"))) {
    res = await tryInsert("sliders")
  }

  const { data, error } = res

  if (error) {
    console.error("Error creating hero slide:", error)
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
    console.error("Error updating homepage section:", error)
    throw error
  }

  return data
}

export async function updateHeroSlide(id: string, updates: Partial<HeroSlide>) {
  const adminClient = getAdminClient()
  const tryUpdate = async (tableName: string) => (adminClient.from(tableName) as any)
    .update({ ...(updates as any), updated_at: new Date().toISOString() } as any)
    .eq("id", id)
    .select()
    .single()

  let res = await tryUpdate("hero_slides")
  if (res.error && (res.error.code === "PGRST205" || String(res.error.message).includes("Could not find the table 'public.hero_slides'"))) {
    res = await tryUpdate("sliders")
  }

  const { data, error } = res

  if (error) {
    console.error("Error updating hero slide:", error)
    throw error
  }

  return data
}

export async function deleteHomepageSection(id: string) {
  const adminClient = getAdminClient()
  const { error } = await (adminClient.from("homepage_sections") as any).delete().eq("id", id)

  if (error) {
    console.error("Error deleting homepage section:", error)
    throw error
  }
}

export async function deleteHeroSlide(id: string) {
  const adminClient = getAdminClient()
  const tryDelete = async (tableName: string) => (adminClient.from(tableName) as any).delete().eq("id", id)

  let res = await tryDelete("hero_slides")
  if (res.error && (res.error.code === "PGRST205" || String(res.error.message).includes("Could not find the table 'public.hero_slides'"))) {
    res = await tryDelete("sliders")
  }

  const { error } = res

  if (error) {
    console.error("Error deleting hero slide:", error)
    throw error
  }
}
