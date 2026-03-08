import { NextRequest, NextResponse } from 'next/server'
import { requireStaff } from '@/lib/auth/is-admin'
import { createAdminClient } from '@/lib/supabase/admin'
import { logAdminAction } from '@/lib/admin/audit'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireStaff()
  const { id } = await params
  const body = await request.json()
  const admin = createAdminClient()

  if (body.action === 'hide') {
    await admin.from('comments').update({
      is_hidden: true,
      moderation_reason: body.reason ?? null,
      moderated_by: session.user.id,
    }).eq('id', id)

    await logAdminAction({
      action: 'comment.hide',
      entityType: 'comment',
      entityId: id,
      meta: { reason: body.reason ?? null },
    })

    return NextResponse.json({ ok: true })
  }

  if (body.action === 'restore') {
    await admin.from('comments').update({
      is_hidden: false,
      deleted_at: null,
      moderation_reason: null,
      moderated_by: session.user.id,
    }).eq('id', id)

    await logAdminAction({
      action: 'comment.restore',
      entityType: 'comment',
      entityId: id,
    })

    return NextResponse.json({ ok: true })
  }

  if (body.action === 'soft_delete') {
    await admin.from('comments').update({
      is_hidden: true,
      deleted_at: new Date().toISOString(),
      moderation_reason: body.reason ?? null,
      moderated_by: session.user.id,
    }).eq('id', id)

    await logAdminAction({
      action: 'comment.soft_delete',
      entityType: 'comment',
      entityId: id,
      meta: { reason: body.reason ?? null },
    })

    return NextResponse.json({ ok: true })
  }

  if (body.action === 'hard_delete') {
    await admin.from('comments').delete().eq('id', id)

    await logAdminAction({
      action: 'comment.hard_delete',
      entityType: 'comment',
      entityId: id,
    })

    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
