import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const allowedNextPaths = new Set([
  '/',
  '/account',
  '/explorar',
  '/reset-password',
])

function normalizeNext(rawNext: string | null) {
  if (!rawNext) return '/account'
  if (rawNext === '/map') return '/explorar'
  if (!rawNext.startsWith('/')) return '/account'
  if (!allowedNextPaths.has(rawNext)) return '/account'
  return rawNext
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = normalizeNext(requestUrl.searchParams.get('next'))

  let response = NextResponse.redirect(new URL(next, requestUrl.origin))

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
      )
    }
  }

  return response
}