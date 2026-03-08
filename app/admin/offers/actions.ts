'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireEditor } from '@/lib/auth/is-admin'
import { logAdminAction } from '@/lib/admin/audit'

export async function createOffer(formData: FormData) {
  const session = await requireEditor()
  const supabase = await createClient()

  const title = String(formData.get('title') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const placeId = String(formData.get('place_id') || '').trim()
  const ctaLabel = String(formData.get('cta_label') || '').trim()
  const ctaUrl = String(formData.get('cta_url') || '').trim()

  if (!title) return

  const { data } = await supabase
    .from('offers')
    .insert({
      title,
      description: description || null,
      place_id: placeId || null,
      cta_label: ctaLabel || null,
      cta_url: ctaUrl || null,
      is_active: false,
    })
    .select('id')
    .single()

  await logAdminAction({
    action: 'offer.create',
    entityType: 'offer',
    entityId: data?.id,
    meta: { actor: session.user.email, title },
  })

  revalidatePath('/admin/offers')
}

export async function toggleOffer(formData: FormData) {
  const session = await requireEditor()
  const supabase = await createClient()

  const id = String(formData.get('id') || '')
  const nextValue = String(formData.get('next_value') || '') === 'true'

  await supabase.from('offers').update({ is_active: nextValue }).eq('id', id)

  await logAdminAction({
    action: nextValue ? 'offer.activate' : 'offer.deactivate',
    entityType: 'offer',
    entityId: id,
    meta: { actor: session.user.email, nextValue },
  })

  revalidatePath('/admin/offers')
}
