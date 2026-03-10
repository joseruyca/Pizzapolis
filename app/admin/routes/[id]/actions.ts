'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireEditor } from '@/lib/auth/is-admin'
import { logAdminAction } from '@/lib/admin/audit'

export async function addRouteStop(formData: FormData) {
  const session = await requireEditor()
  const supabase = await createClient()

  const routeId = String(formData.get('route_id') || '')
  const placeId = String(formData.get('place_id') || '')
  const sortOrderRaw = String(formData.get('sort_order') || '').trim()
  const stopNote = String(formData.get('stop_note') || '').trim()

  const sortOrder = sortOrderRaw ? Number(sortOrderRaw) : 0

  if (!routeId || !placeId) return

  const { error } = await supabase.from('pizza_route_places').upsert({
    route_id: routeId,
    place_id: placeId,
    sort_order: sortOrder,
    stop_note: stopNote || null,
  })

  if (error) {
    throw new Error(error.message)
  }

  await logAdminAction({
    action: 'route.stop.add',
    entityType: 'pizza_route',
    entityId: routeId,
    meta: { actor: session.user.email, placeId, sortOrder },
  })

  revalidatePath(`/admin/routes/${routeId}`)
  revalidatePath('/routes')
}

export async function removeRouteStop(formData: FormData) {
  const session = await requireEditor()
  const supabase = await createClient()

  const stopId = String(formData.get('stop_id') || '')
  const routeId = String(formData.get('route_id') || '')

  const { error } = await supabase.from('pizza_route_places').delete().eq('id', stopId)

  if (error) {
    throw new Error(error.message)
  }

  await logAdminAction({
    action: 'route.stop.remove',
    entityType: 'pizza_route',
    entityId: routeId,
    meta: { actor: session.user.email, stopId },
  })

  revalidatePath(`/admin/routes/${routeId}`)
  revalidatePath('/routes')
}
