'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireEditor } from '@/lib/auth/is-admin'
import { logAdminAction } from '@/lib/admin/audit'

export async function updateRestaurantOfTheWeek(formData: FormData) {
  const session = await requireEditor()
  const supabase = await createClient()

  const placeId = String(formData.get('place_id') || '').trim()
  const title = String(formData.get('title') || '').trim()
  const subtitle = String(formData.get('subtitle') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const isActive = String(formData.get('is_active') || '') === 'true'

  await supabase.from('featured_slots').upsert({
    key: 'restaurant_of_the_week',
    place_id: placeId || null,
    title: title || null,
    subtitle: subtitle || null,
    description: description || null,
    is_active: isActive,
    updated_at: new Date().toISOString(),
  })

  await logAdminAction({
    action: 'featured.restaurant_of_the_week.update',
    entityType: 'featured_slot',
    entityId: 'restaurant_of_the_week',
    meta: { placeId, isActive },
  })

  revalidatePath('/admin/settings')
  revalidatePath('/')
}
