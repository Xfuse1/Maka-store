import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types"

export function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("Missing Supabase environment variables for admin client")
    // Return a dummy client that will fail at runtime if actually used
    // This allows the build to complete
    return createClient<Database>("https://placeholder.supabase.co", "placeholder-key", {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

export const getAdminClient = getSupabaseAdminClient

export const createAdminClient = getSupabaseAdminClient

// Backwards-compatible aliases used across the codebase
export const createSupabaseAdmin = getSupabaseAdminClient
export const createSupabaseAdminClient = getSupabaseAdminClient
export const getSupabaseAdmin = getSupabaseAdminClient
