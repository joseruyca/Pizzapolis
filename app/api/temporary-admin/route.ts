import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const key = body?.key
  const expected = process.env.ADMIN_TEMP_ACCESS_KEY

  if (!expected || !key || key !== expected) {
    return NextResponse.json({ ok: false, error: 'invalid_key' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })

  response.cookies.set('temp_admin_access', 'granted', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 12,
  })

  return response
}
