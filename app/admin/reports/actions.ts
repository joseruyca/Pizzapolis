'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/auth/is-admin'
import { logAdminAction } from '@/lib/admin/audit'

export async function updateReportStatus(formData: FormData) {
  const session = await requireStaff()
  const supabase = await createClient()

  const id = String(formData.get('id') || '')
  const status = String(formData.get('status') || '')
  const resolutionNotes = String(formData.get('resolution_notes') || '').trim()

  await supabase
    .from('content_reports')
    .update({
      status,
      resolution_notes: resolutionNotes || null,
      resolved_by: session.user.id,
    })
    .eq('id', id)

  await logAdminAction({
    action: 'report.status.update',
    entityType: 'report',
    entityId: id,
    meta: { status, resolutionNotes },
  })

  revalidatePath('/admin/reports')
}
