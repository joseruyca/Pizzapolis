import { AdminShell } from '@/components/admin/admin-shell'
import { ModerationClient } from '@/components/admin/moderation-client'
import { createClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/auth/is-admin'

export default async function AdminModerationPage() {
  await requireStaff()
  const supabase = await createClient()

  const [commentsRes, photosRes, profilesRes, placesRes] = await Promise.all([
    supabase
      .from('comments')
      .select('id, content, created_at, user_id, place_id, is_hidden, deleted_at')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('photos')
      .select('id, image_url, created_at, user_id, place_id, is_hidden, deleted_at')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase.from('profiles').select('id, email, full_name'),
    supabase.from('places').select('id, name, slug'),
  ])

  return (
    <AdminShell
      title='Moderation'
      description='Hide, soft delete, restore or permanently delete comments and photos.'
    >
      <ModerationClient
        comments={commentsRes.data ?? []}
        photos={photosRes.data ?? []}
        profiles={profilesRes.data ?? []}
        places={placesRes.data ?? []}
      />
    </AdminShell>
  )
}
