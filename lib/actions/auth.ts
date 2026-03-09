'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function getURL() {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    'http://localhost:3001'

  url = url.startsWith('http') ? url : `https://${url}`
  url = url.endsWith('/') ? url : `${url}/`

  return url
}

export async function signInWithMagicLink(formData: FormData) {
  const email = String(formData.get('email') || '').trim()

  if (!email) {
    redirect('/login?error=You must enter an email address')
  }

  const supabase = await createClient()
  const redirectTo = `${getURL()}auth/callback`

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
    },
  })

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  redirect('/login?success=Check your email for the sign-in link')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
