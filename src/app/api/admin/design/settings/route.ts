import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient() as any

    const { data, error } = await supabase
      .from('design_settings')
      .select('key, value')
      .in('key', ['colors', 'fonts', 'layout'])

    if (error) {
      console.error('[API getDesignSettings] Error:', error)
      return NextResponse.json({ settings: {} })
    }

    // Convert array to object
    const settings: any = {}
    data?.forEach((item: any) => {
      settings[item.key] = item.value
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('[API getDesignSettings] Error:', error)
    return NextResponse.json({ settings: {} })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { key, value } = await request.json()

    if (!key || !value) {
      return NextResponse.json({ error: 'Missing key or value' }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient() as any

    const { error } = await supabase
      .from('design_settings')
      .upsert({
        key,
        value,
        description: `Site ${key} settings`
      }, {
        onConflict: 'key'
      })

    if (error) {
      console.error('[API saveDesignSettings] Error:', error)
      return NextResponse.json({ 
        error: `فشل حفظ الإعدادات: ${error.message}` 
      }, { status: 400 })
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('[API saveDesignSettings] Error:', error)
    return NextResponse.json({ 
      error: error?.message || 'حدث خطأ أثناء حفظ الإعدادات' 
    }, { status: 500 })
  }
}
