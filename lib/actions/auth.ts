'use server'

import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

async function getRequestOrigin() {
  const h = await headers()

  const origin = h.get('origin')
  if (origin) return origin

  const host = h.get('x-forwarded-host') || h.get('host') || 'localhost:3001'
  const proto =
    h.get('x-forwarded-proto') ||
    (host.includes('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https')

  return `${proto}://${host}`
}

export async function signInWithMagicLink(formData: FormData) {
  const email = String(formData.get('email') || '').trim()

  if (!email) {
    redirect('/login?error=You must enter an email address')
  }

  const supabase = await createClient()
  const origin = await getRequestOrigin()
  const redirectTo = `${origin}/auth/callback`

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
