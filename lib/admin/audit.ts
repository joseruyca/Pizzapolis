import { createClient } from '@/lib/supabase/server'
import { getCurrentUserWithRole } from '@/lib/auth/is-admin'

export async function logAdminAction({
  action,
  entityType,
  entityId,
  meta,
}: {
  action: string
  entityType: string
  entityId?: string
  meta?: Record<string, unknown>
}) {
  const supabase = await createClient()
  const session = await getCurrentUserWithRole()

  if (!session.user) return

  await supabase.from('admin_audit_logs').insert({
    actor_user_id: session.user.id,
    actor_role: session.role,
    action,
    entity_type: entityType,
    entity_id: entityId ?? null,
    meta: {
      ...(meta ?? {}),
      actor_email: session.user.email ?? null,
      at: new Date().toISOString(),
    },
  })
}
