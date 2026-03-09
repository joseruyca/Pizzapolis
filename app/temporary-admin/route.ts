import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const key = url.searchParams.get('key')
  const expected = process.env.ADMIN_TEMP_ACCESS_KEY

  if (!expected || !key || key !== expected) {
    return NextResponse.redirect(new URL('/login', url.origin))
  }

  const response = NextResponse.redirect(new URL('/admin', url.origin))

  response.cookies.set('temp_admin_access', 'granted', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  })

  return response
}
