import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const key = url.searchParams.get('key')
  const expected = process.env.ADMIN_TEMP_ACCESS_KEY

  return NextResponse.json({
    key,
    hasExpected: !!expected,
    matches: key === expected,
  })
}
