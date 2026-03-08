import { NextRequest, NextResponse } from 'next/server'
import { requireStaff } from '@/lib/auth/is-admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAdminAction } from '@/lib/admin/audit'
import { parseSupabaseStoragePath } from '@/lib/admin/storage-utils'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireStaff()
  const { id } = await params
  const body = await request.json()
  const admin = createAdminClient()

  if (body.action === 'hide') {
    await admin.from('photos').update({
      is_hidden: true,
      moderation_reason: body.reason ?? null,
      moderated_by: session.user.id,
    }).eq('id', id)

    await logAdminAction({
      action: 'photo.hide',
      entityType: 'photo',
      entityId: id,
      meta: { reason: body.reason ?? null },
    })

    return NextResponse.json({ ok: true })
  }

  if (body.action === 'restore') {
    await admin.from('photos').update({
      is_hidden: false,
      deleted_at: null,
      moderation_reason: null,
      moderated_by: session.user.id,
    }).eq('id', id)

    await logAdminAction({
      action: 'photo.restore',
      entityType: 'photo',
      entityId: id,
    })

    return NextResponse.json({ ok: true })
  }

  if (body.action === 'soft_delete') {
    await admin.from('photos').update({
      is_hidden: true,
      deleted_at: new Date().toISOString(),
      moderation_reason: body.reason ?? null,
      moderated_by: session.user.id,
    }).eq('id', id)

    await logAdminAction({
      action: 'photo.soft_delete',
      entityType: 'photo',
      entityId: id,
      meta: { reason: body.reason ?? null },
    })

    return NextResponse.json({ ok: true })
  }

  if (body.action === 'hard_delete') {
    const { data: photo } = await admin
      .from('photos')
      .select('id, image_url')
      .eq('id', id)
      .single()

    if (photo?.image_url) {
      const parsed = parseSupabaseStoragePath(photo.image_url)
      if (parsed) {
        await admin.storage.from(parsed.bucket).remove([parsed.path])
      }
    }

    await admin.from('photos').delete().eq('id', id)

    await logAdminAction({
      action: 'photo.hard_delete',
      entityType: 'photo',
      entityId: id,
    })

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
