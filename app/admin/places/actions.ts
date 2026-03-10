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

  const best_slice = String(formData.get('best_slice') || '').trim()
  const best_whole_pie = String(formData.get('best_whole_pie') || '').trim()
  const first_order_recommendation = String(formData.get('first_order_recommendation') || '').trim()
  const why_go = String(formData.get('why_go') || '').trim()
  const price_confidence = String(formData.get('price_confidence') || '').trim()

  const cheapest_slice_price_raw = String(formData.get('cheapest_slice_price') || '').trim()
  const whole_pie_price_raw = String(formData.get('whole_pie_price') || '').trim()
  const value_score_raw = String(formData.get('value_score') || '').trim()

  const cheapest_slice_price = cheapest_slice_price_raw ? Number(cheapest_slice_price_raw) : null
  const whole_pie_price = whole_pie_price_raw ? Number(whole_pie_price_raw) : null
  const value_score = value_score_raw ? Number(value_score_raw) : null

  const is_best_under_5 = String(formData.get('is_best_under_5') || '') === 'on'
  const is_best_under_10 = String(formData.get('is_best_under_10') || '') === 'on'
  const is_late_night = String(formData.get('is_late_night') || '') === 'on'
  const is_worth_the_trip = String(formData.get('is_worth_the_trip') || '') === 'on'
  const is_first_timer_friendly = String(formData.get('is_first_timer_friendly') || '') === 'on'

  const price_range =
    cheapest_slice_price === null
      ? null
      : cheapest_slice_price < 5
      ? '$'
      : cheapest_slice_price < 12
      ? '$$'
      : '$$$'

  const { error } = await supabase
    .from('places')
    .update({
      name,
      neighborhood: neighborhood || null,
      borough: borough || null,
      pizza_style: pizza_style || null,
      best_known_for: best_known_for || null,
      best_slice: best_slice || null,
      best_whole_pie: best_whole_pie || null,
      first_order_recommendation: first_order_recommendation || null,
      why_go: why_go || null,
      price_confidence: price_confidence || null,
      cheapest_slice_price,
      whole_pie_price,
      value_score,
      is_best_under_5,
      is_best_under_10,
      is_late_night,
      is_worth_the_trip,
      is_first_timer_friendly,
      price_range,
      price_updated_at: cheapest_slice_price !== null ? new Date().toISOString() : null,
    })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  await logAdminAction({
    action: 'place.update',
    entityType: 'place',
    entityId: id,
    meta: {
      actor: session.user.email,
      name,
      cheapest_slice_price,
      whole_pie_price,
      value_score,
    },
  })

  revalidatePath('/admin/places')
  revalidatePath('/explorar')
  revalidatePath('/places')
  revalidatePath(`/places/${String(formData.get('slug') || '')}`)
}

export async function deletePlace(formData: FormData) {
  const session = await requireEditor()
  const supabase = await createClient()

  const id = String(formData.get('id') || '')
  const { error } = await supabase.from('places').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  await logAdminAction({
    action: 'place.delete',
    entityType: 'place',
    entityId: id,
    meta: { actor: session.user.email },
  })

  revalidatePath('/admin/places')
  revalidatePath('/explorar')
}
