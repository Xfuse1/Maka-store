import { createClient } from "@/lib/supabase/client";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export interface HeroSlide {
    id: string;
    title_ar: string;
    title_en?: string | null;
    subtitle_ar?: string | null;
    subtitle_en?: string | null;
    image_url: string;
    link_url?: string | null;
    display_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

/**
 * Fetches all active hero slides from the 'sliders' table.
 * Uses browser client (RLS applied).
 */
export async function getAllHeroSlides(): Promise<HeroSlide[]> {
  // Returning a hardcoded slide as requested by the user.
  return [
    {
      id: "1",
      title_ar: "مجموعة العيد",
      subtitle_ar: "تشكيلة جديدة ومميزة",
      image_url: "/slaydr-1.png",
      link_url: "/category/all",
      display_order: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      title_en: "Eid Collection",
      subtitle_en: "New and exclusive collection",
    },
  ];
}

/**
 * Fetches ALL hero slides (active and inactive) using Admin client.
 * Bypasses RLS.
 */
export async function getAllHeroSlidesAdmin(): Promise<HeroSlide[]> {
  const supabase = getSupabaseAdminClient();
  
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error("[Admin] Error fetching hero slides:", error);
    throw new Error(error.message);
  }

  return data || [];
}

export async function createHeroSlide(slide: Omit<HeroSlide, "id" | "created_at" | "updated_at">) {
  const supabase = getSupabaseAdminClient() as any;
  
  const { data, error } = await supabase
    .from('hero_slides')
    .insert([slide])
    .select()
    .single();

  if (error) {
    console.error("[Admin] Error creating hero slide:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function updateHeroSlide(id: string, updates: Partial<HeroSlide>) {
  const supabase = getSupabaseAdminClient() as any;
  
  const { data, error } = await supabase
    .from('hero_slides')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("[Admin] Error updating hero slide:", error);
    throw new Error(error.message);
  }

  return data;
}

export async function deleteHeroSlide(id: string) {
  const supabase = getSupabaseAdminClient();
  
  const { error } = await supabase
    .from('hero_slides')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("[Admin] Error deleting hero slide:", error);
    throw new Error(error.message);
  }

  return true;
}
