
import { createClient } from "@/lib/supabase/client";

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
 * 
 * @returns {Promise<HeroSlide[]>} A promise that resolves to an array of hero slides.
 */
export async function getAllHeroSlides(): Promise<HeroSlide[]> {
  const supabase = createClient();
  console.log("[v0] 🚀 Fetching active hero slides from the 'sliders' table...");

  const { data, error } = await supabase
    .from('sliders')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error("[v0] ❌ Error fetching hero slides:", error);
    // In case of an error, return an empty array to prevent breaking the UI.
    return [];
  }

  console.log(`[v0] ✅ Found ${data.length} active hero slides.`);
  return data || [];
}
