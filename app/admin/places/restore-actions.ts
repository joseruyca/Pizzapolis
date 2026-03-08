'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireEditor } from '@/lib/auth/is-admin'
import { logAdminAction } from '@/lib/admin/audit'

export async function softDeletePlace(formData: FormData) {
  const session = await requireEditor()
  const supabase = await createClient()
  const id = String(formData.get('id') || '')

  await supabase.from('places').update({
    is_deleted: true,
    deleted_at: new Date().toISOString(),
    deleted_by: session.user.id,
  }).eq('id', id)

  await logAdminAction({
    action: 'place.soft_delete',
    entityType: 'place',
    entityId: id,
  })

  revalidatePath('/admin/places')
}

export async function restorePlace(formData: FormData) {
  await requireEditor()
  const supabase = await createClient()
  const id = String(formData.get('id') || '')

  await supabase.from('places').update({
    is_deleted: false,
    deleted_at: null,
    deleted_by: null,
  }).eq('id', id)

  await logAdminAction({
    action: 'place.restore',
    entityType: 'place',
    entityId: id,
  })

  revalidatePath('/admin/places')
}
