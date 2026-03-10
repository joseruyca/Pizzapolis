'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/is-admin'
import { logAdminAction } from '@/lib/admin/audit'

export async function updateHomeSettings(formData: FormData) {
  const session = await requireAdmin()
  const supabase = await createClient()

  const featuredTitle = String(formData.get('featuredTitle') || '').trim()
  const featuredSubtitle = String(formData.get('featuredSubtitle') || '').trim()
  const featuredDescription = String(formData.get('featuredDescription') || '').trim()

  const { error } = await supabase.from('site_settings').upsert({
    key: 'home',
    value: {
      featuredTitle,
      featuredSubtitle,
      featuredDescription,
    },
    updated_at: new Date().toISOString(),
  })

  if (error) {
    throw new Error(error.message)
  }

  await logAdminAction({
    action: 'settings.home.update',
    entityType: 'site_settings',
    entityId: 'home',
    meta: { actor: session.user.email },
  })

  revalidatePath('/admin/settings')
  revalidatePath('/')
}
