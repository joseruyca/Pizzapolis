import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth/is-admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { logAdminAction } from '@/lib/admin/audit'
import { parseSupabaseStoragePath } from '@/lib/admin/storage-utils'

async function deleteUserAssets(userId: string) {
  const admin = createAdminClient()

  const { data: photos } = await admin
    .from('photos')
    .select('id, image_url')
    .eq('user_id', userId)

  const grouped = new Map<string, string[]>()

  for (const photo of photos ?? []) {
    if (!photo.image_url) continue
    const parsed = parseSupabaseStoragePath(photo.image_url)
    if (!parsed) continue

    const arr = grouped.get(parsed.bucket) ?? []
    arr.push(parsed.path)
    grouped.set(parsed.bucket, arr)
  }

  for (const [bucket, paths] of grouped.entries()) {
    if (paths.length) {
      await admin.storage.from(bucket).remove(paths)
    }
  }

  await admin.from('photos').delete().eq('user_id', userId)
  await admin.from('comments').delete().eq('user_id', userId)
  await admin.from('reviews').delete().eq('user_id', userId)
  await admin.from('content_reports').delete().eq('reporter_user_id', userId)
  await admin.from('place_submissions').delete().eq('submitted_by', userId)
  await admin.from('admin_users').delete().eq('user_id', userId)
  await admin.from('profiles').delete().eq('id', userId)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin()
  const { id } = await params
  const body = await request.json()
  const admin = createAdminClient()

  if (body.action === 'ban') {
    const { error } = await admin.auth.admin.updateUserById(id, {
      ban_duration: body.duration ?? '876000h',
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await logAdminAction({
      action: 'user.ban',
      entityType: 'user',
      entityId: id,
      meta: { duration: body.duration ?? '876000h' },
    })

    return NextResponse.json({ ok: true })
  }

  if (body.action === 'unban') {
    const { error } = await admin.auth.admin.updateUserById(id, {
      ban_duration: 'none',
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await logAdminAction({
      action: 'user.unban',
      entityType: 'user',
      entityId: id,
    })

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin()
  const { id } = await params
  const admin = createAdminClient()
  const body = await request.json().catch(() => ({}))
  const hardDelete = !!body.hardDelete

  if (hardDelete) {
    await deleteUserAssets(id)

    const { error } = await admin.auth.admin.deleteUser(id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await logAdminAction({
      action: 'user.hard_delete',
      entityType: 'user',
      entityId: id,
    })

    return NextResponse.json({ ok: true })
  }

  const { error } = await admin.auth.admin.deleteUser(id, true)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await logAdminAction({
    action: 'user.soft_delete',
    entityType: 'user',
    entityId: id,
  })

  return NextResponse.json({ ok: true })
}
