'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

type LoginMode = 'signin' | 'signup' | 'forgot' | 'magic'

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function redirectToLogin({
  error,
  success,
  mode = 'signin',
}: {
  error?: string
  success?: string
  mode?: LoginMode
}) {
  const params = new URLSearchParams()

  if (error) params.set('error', error)
  if (success) params.set('success', success)
  params.set('mode', mode)

  redirect(`/login?${params.toString()}`)
}

function redirectToReset(error: string) {
  redirect(`/reset-password?error=${encodeURIComponent(error)}`)
}

function mapAuthErrorMessage(
  message: string | undefined,
  action: 'signin' | 'signup' | 'magic' | 'reset' | 'update'
) {
  const normalized = String(message || '').toLowerCase()

  if (action === 'signin') {
    if (normalized.includes('invalid login credentials')) {
      return 'Invalid email or password.'
    }

    if (normalized.includes('email not confirmed')) {
      return 'Confirm your email first, then sign in.'
    }

    return message || 'Could not sign you in.'
  }

  if (action === 'signup') {
    if (
      normalized.includes('user already registered') ||
      normalized.includes('already been registered')
    ) {
      return 'This email is already registered. Try signing in instead.'
    }

    if (normalized.includes('password')) {
      return 'Your password must be at least 8 characters.'
    }

    return message || 'Could not create your account.'
  }

  if (action === 'magic' || action === 'reset') {
    if (normalized.includes('rate limit')) {
      return 'Please wait a minute before requesting another email.'
    }

    return message || 'Could not send the email.'
  }

  if (action === 'update') {
    if (normalized.includes('password')) {
      return 'Choose a stronger password with at least 8 characters.'
    }

    return message || 'Could not update your password.'
  }

  return message || 'Something went wrong.'
}

async function getRequestOrigin() {
  const envOrigin = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (envOrigin) return envOrigin

  const headerStore = await headers()
  const origin = headerStore.get('origin')
  if (origin) return origin

  const host =
    headerStore.get('x-forwarded-host') ??
    headerStore.get('host') ??
    'localhost:3001'

  const proto =
    headerStore.get('x-forwarded-proto') ||
    (host.includes('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https')

  return `${proto}://${host}`
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  const origin = await getRequestOrigin()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?next=/account`,
    },
  })

  if (error || !data?.url) {
    redirectToLogin({
      error: mapAuthErrorMessage(error?.message, 'signin'),
      mode: 'signin',
    })
  }

  redirect(data.url)
}

export async function signInWithMagicLink(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase()

  if (!email) {
    redirectToLogin({ error: 'Enter your email address.', mode: 'magic' })
  }

  if (!isValidEmail(email)) {
    redirectToLogin({ error: 'Enter a valid email address.', mode: 'magic' })
  }

  const supabase = await createClient()
  const origin = await getRequestOrigin()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/account`,
    },
  })

  if (error) {
    redirectToLogin({
      error: mapAuthErrorMessage(error.message, 'magic'),
      mode: 'magic',
    })
  }

  redirectToLogin({
    success: 'Check your email for the magic link.',
    mode: 'magic',
  })
}

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '')

  if (!email || !password) {
    redirectToLogin({
      error: 'Email and password are required.',
      mode: 'signin',
    })
  }

  if (!isValidEmail(email)) {
    redirectToLogin({
      error: 'Enter a valid email address.',
      mode: 'signin',
    })
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirectToLogin({
      error: mapAuthErrorMessage(error.message, 'signin'),
      mode: 'signin',
    })
  }

  redirect('/account')
}

export async function signUpWithPassword(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase()
  const password = String(formData.get('password') || '')
  const confirmPassword = String(formData.get('confirm_password') || '')

  if (!email || !password) {
    redirectToLogin({
      error: 'Email and password are required.',
      mode: 'signup',
    })
  }

  if (!isValidEmail(email)) {
    redirectToLogin({
      error: 'Enter a valid email address.',
      mode: 'signup',
    })
  }

  if (password.length < 8) {
    redirectToLogin({
      error: 'Password must be at least 8 characters.',
      mode: 'signup',
    })
  }

  if (password !== confirmPassword) {
    redirectToLogin({
      error: 'Passwords do not match.',
      mode: 'signup',
    })
  }

  const supabase = await createClient()
  const origin = await getRequestOrigin()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/account`,
    },
  })

  if (error) {
    redirectToLogin({
      error: mapAuthErrorMessage(error.message, 'signup'),
      mode: 'signup',
    })
  }

  if (data.session) {
    redirect('/account')
  }

  redirectToLogin({
    success: 'Check your email to confirm your account.',
    mode: 'signin',
  })
}

export async function sendPasswordReset(formData: FormData) {
  const email = String(formData.get('email') || '').trim().toLowerCase()

  if (!email) {
    redirectToLogin({ error: 'Enter your email address.', mode: 'forgot' })
  }

  if (!isValidEmail(email)) {
    redirectToLogin({ error: 'Enter a valid email address.', mode: 'forgot' })
  }

  const supabase = await createClient()
  const origin = await getRequestOrigin()

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  })

  if (error) {
    redirectToLogin({
      error: mapAuthErrorMessage(error.message, 'reset'),
      mode: 'forgot',
    })
  }

  redirectToLogin({
    success: 'Check your email for the password reset link.',
    mode: 'forgot',
  })
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get('password') || '')
  const confirmPassword = String(formData.get('confirm_password') || '')

  if (!password || !confirmPassword) {
    redirectToReset('Both password fields are required.')
  }

  if (password.length < 8) {
    redirectToReset('Password must be at least 8 characters.')
  }

  if (password !== confirmPassword) {
    redirectToReset('Passwords do not match.')
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    redirectToReset(mapAuthErrorMessage(error.message, 'update'))
  }

  redirectToLogin({
    success: 'Password updated. You can sign in now.',
    mode: 'signin',
  })
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}