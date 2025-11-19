import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Test 1: Check connection
    const { data: testData, error: testError } = await supabase
      .from('products')
      .select('id')
      .limit(1)
    
    // Test 2: Check auth config
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    return NextResponse.json({
      status: 'ok',
      connection: testError ? 'failed' : 'success',
      connectionError: testError?.message,
      session: session ? 'active' : 'none',
      sessionError: sessionError?.message,
      env: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasSiteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
      }
    })
  } catch (err) {
    return NextResponse.json({ 
      status: 'error', 
      error: (err as any)?.message,
      stack: process.env.NODE_ENV !== 'production' ? (err as any)?.stack : undefined
    }, { status: 500 })
  }
}
