'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireEditor } from '@/lib/auth/is-admin'
import { logAdminAction } from '@/lib/admin/audit'

export async function updatePlaceBasics(formData: FormData) {
  const session = await requireEditor()
  const supabase = await createClient()

  const id = String(formData.get('id') || '')
  const name = String(formData.get('name') || '').trim()
  const neighborhood = String(formData.get('neighborhood') || '').trim()
  const borough = String(formData.get('borough') || '').trim()
  const pizza_style = String(formData.get('pizza_style') || '').trim()
  const best_known_for = String(formData.get('best_known_for') || '').trim()
  const cheapest_slice_price_raw = String(formData.get('cheapest_slice_price') || '').trim()

  const cheapest_slice_price = cheapest_slice_price_raw ? Number(cheapest_slice_price_raw) : null
  const price_range =
    cheapest_slice_price === null
      ? null
      : cheapest_slice_price < 5
      ? '$'
      : cheapest_slice_price < 12
      ? '$$'
      : '$$$'

  await supabase
    .from('places')
    .update({
      name,
      neighborhood: neighborhood || null,
      borough: borough || null,
      pizza_style: pizza_style || null,
      best_known_for: best_known_for || null,
      cheapest_slice_price,
      price_range,
      price_updated_at: cheapest_slice_price !== null ? new Date().toISOString() : null,
    })
    .eq('id', id)

  await logAdminAction({
    action: 'place.update',
    entityType: 'place',
    entityId: id,
    meta: {
      actor: session.user.email,
      name,
      cheapest_slice_price,
      price_range,
    },
  })

  revalidatePath('/admin/places')
  revalidatePath('/explorar')
}

export async function deletePlace(formData: FormData) {
  const session = await requireEditor()
  const supabase = await createClient()

  const id = String(formData.get('id') || '')
  await supabase.from('places').delete().eq('id', id)

  await logAdminAction({
    action: 'place.delete',
    entityType: 'place',
    entityId: id,
    meta: { actor: session.user.email },
  })

  revalidatePath('/admin/places')
  revalidatePath('/explorar')
}
