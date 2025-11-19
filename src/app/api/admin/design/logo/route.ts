import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const supabase = getSupabaseAdminClient() as any

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `logo-${Date.now()}.${fileExt}`
    const filePath = fileName

    // Convert File to ArrayBuffer then to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('site-logo')
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) {
      console.error('[API uploadLogo] Storage upload error:', uploadError)
      return NextResponse.json({ 
        error: `فشل رفع الشعار: ${uploadError.message}` 
      }, { status: 400 })
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('site-logo')
      .getPublicUrl(filePath)

    // Update design_settings table using admin client
    const { error: updateError } = await supabase
      .from('design_settings')
      .upsert({
        key: 'site_logo',
        value: {
          url: publicUrl,
          updated_at: new Date().toISOString(),
          filename: fileName
        },
        description: 'Site logo URL and metadata'
      }, {
        onConflict: 'key'
      })

    if (updateError) {
      console.error('[API uploadLogo] Database update error:', updateError)
      return NextResponse.json({ 
        error: `فشل حفظ رابط الشعار: ${updateError.message}` 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      filename: fileName 
    })

  } catch (error: any) {
    console.error('[API uploadLogo] Error:', error)
    return NextResponse.json({ 
      error: error?.message || 'حدث خطأ أثناء رفع الشعار' 
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient() as any

    const { data, error } = await supabase
      .from('design_settings')
      .select('value')
      .eq('key', 'site_logo')
      .maybeSingle()

    if (error) {
      console.error('[API getLogoUrl] Error:', error)
      return NextResponse.json({ url: '/placeholder-logo.svg' })
    }

    if (!data || !data.value) {
      return NextResponse.json({ url: '/placeholder-logo.svg' })
    }

    return NextResponse.json({ url: data.value.url || '/placeholder-logo.svg' })
  } catch (error) {
    console.error('[API getLogoUrl] Error:', error)
    return NextResponse.json({ url: '/placeholder-logo.svg' })
  }
}
