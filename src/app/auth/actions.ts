"use server"

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signUpWithAdmin(formData: FormData) {
  const email = String(formData.get('email') || '').trim()
  const password = String(formData.get('password') || '').trim()
  const name = String(formData.get('name') || '')
  const phone_number = String(formData.get('phone') || '')
  const imageFile = formData.get('image') as File | null
  const role = 'user'

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )

  // Create user first
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, phone_number, role },
  })

  if (error) {
    return { error: error.message }
  }

  let image_url = null

  // Upload profile image if provided
  if (data.user && imageFile && imageFile.size > 0) {
    try {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${data.user.id}/avatar.${fileExt}`
      
      // Convert File to ArrayBuffer
      const arrayBuffer = await imageFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('profile-images')
        .upload(fileName, buffer, {
          contentType: imageFile.type,
          upsert: true,
        })

      if (uploadError) {
        console.error('Image upload error:', uploadError)
      } else {
        // Get public URL
        const { data: urlData } = supabaseAdmin.storage
          .from('profile-images')
          .getPublicUrl(fileName)
        
        image_url = urlData.publicUrl
      }
    } catch (err) {
      console.error('Error processing image:', err)
    }
  }

  // Create profile with image URL
  if (data.user) {
    await supabaseAdmin.from('profiles').upsert({
      id: data.user.id,
      name,
      phone_number,
      image_url,
      role,
    })
  }

  revalidatePath('/auth', 'page')
  // Redirect user to home after successful signup so mobile doesn't stay on login view
  try {
    redirect('/')
  } catch (e) {
    // If redirect isn't usable in this environment, return the data so caller can handle it
    return { data }
  }
}
