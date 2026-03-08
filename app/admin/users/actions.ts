'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/is-admin'
import { logAdminAction } from '@/lib/admin/audit'

export async function setStaffRole(formData: FormData) {
  const session = await requireAdmin()
  const supabase = await createClient()

  const userId = String(formData.get('user_id') || '')
  const role = String(formData.get('role') || '')

  if (!userId || !role) return

  if (role === 'user') {
    await supabase.from('admin_users').delete().eq('user_id', userId)
  } else {
    await supabase
      .from('admin_users')
      .upsert({ user_id: userId, role }, { onConflict: 'user_id' })
  }

  await logAdminAction({
    action: 'user.role.update',
    entityType: 'user',
    entityId: userId,
    meta: { actor: session.user.email, role },
  })

  revalidatePath('/admin/users')
}
