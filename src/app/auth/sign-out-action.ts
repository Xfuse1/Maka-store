
'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export async function signOut() {
  // createClient is async and manages cookies internally in the server helper.
  const supabase = await createClient()

  const { error } = await supabase.auth.signOut()

  if (error) {
    return redirect('/?message=Could not sign out')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
