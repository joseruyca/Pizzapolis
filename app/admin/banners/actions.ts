'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireEditor } from '@/lib/auth/is-admin'
import { logAdminAction } from '@/lib/admin/audit'

export async function createBanner(formData: FormData) {
  const session = await requireEditor()
  const supabase = await createClient()

  const placement = String(formData.get('placement') || '').trim()
  const title = String(formData.get('title') || '').trim()
  const subtitle = String(formData.get('subtitle') || '').trim()
  const imageUrl = String(formData.get('image_url') || '').trim()
  const linkUrl = String(formData.get('link_url') || '').trim()

  if (!placement || !title) return

  const { data } = await supabase
    .from('banners')
    .insert({
      placement,
      title,
      subtitle: subtitle || null,
      image_url: imageUrl || null,
      link_url: linkUrl || null,
      is_active: false,
    })
    .select('id')
    .single()

  await logAdminAction({
    action: 'banner.create',
    entityType: 'banner',
    entityId: data?.id,
    meta: { placement, title, actor: session.user.email },
  })

  revalidatePath('/admin/banners')
}

export async function toggleBanner(formData: FormData) {
  const session = await requireEditor()
  const supabase = await createClient()

  const id = String(formData.get('id') || '')
  const nextValue = String(formData.get('next_value') || '') === 'true'

  await supabase.from('banners').update({ is_active: nextValue }).eq('id', id)

  await logAdminAction({
    action: nextValue ? 'banner.activate' : 'banner.deactivate',
    entityType: 'banner',
    entityId: id,
    meta: { actor: session.user.email },
  })

  revalidatePath('/admin/banners')
}
