import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/is-admin'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  await requireAdmin()
  const supabase = createAdminClient()

  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 100,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ users: data.users })
}
