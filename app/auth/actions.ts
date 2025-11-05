
'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { nanoid } from 'nanoid'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = createClient()

  if (!formData) {
    return redirect('/auth?message=Form data is missing')
  }

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return redirect('/auth?message=Could not authenticate user')
    }
  } catch (error) {
    console.error('Login error:', error)
    return redirect('/auth?message=An unexpected error occurred during login')
  }

  revalidatePath('/', 'layout')
  return redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string | null
  const phone_number = formData.get('phone') as string | null
  let image_url = formData.get('image_url') as string | null
  const image_file = formData.get('image') as File | null

  if (image_file && image_file.size > 0) {
    const fileExt = image_file.name.split('.').pop()
    const fileName = `${nanoid()}.${fileExt}`
    const filePath = `avatars/${fileName}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, image_file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      return redirect('/auth?message=Could not upload image')
    }
    image_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${uploadData.path}`;
  }
  const role = (formData.get('role') as string) || 'user'

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, phone_number, image_url, role },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return redirect('/auth?message=Could not create user')
  }

  revalidatePath('/', 'layout')
  return redirect('/auth?message=Check email to continue sign in process')
}
