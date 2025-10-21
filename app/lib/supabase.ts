// lib/supabase/client.ts
import { createClient } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url) throw new Error("❌ Missing NEXT_PUBLIC_SUPABASE_URL")
if (!anon) throw new Error("❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY")

// عميل عام للواجهة (Frontend) — RLS شغّالة
export const supabase = createClient(url, anon, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
