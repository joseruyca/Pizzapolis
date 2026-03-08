import { createClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/auth/is-admin'
import { AdminShell } from '@/components/admin/admin-shell'

function StatCard({
  label,
  value,
}: {
  label: string
  value: number | string
}) {
  return (
    <div className='rounded-[28px] border border-zinc-800 bg-black/70 p-6 shadow-xl'>
      <p className='text-sm uppercase tracking-[0.18em] text-zinc-500'>{label}</p>
      <p className='mt-4 text-4xl font-bold text-white'>{value}</p>
    </div>
  )
}

function SectionCard({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className='rounded-[28px] border border-zinc-800 bg-black/70 p-6 shadow-xl'>
      <h2 className='text-2xl font-semibold text-white'>{title}</h2>
      <div className='mt-5'>{children}</div>
    </section>
  )
}

export default async function AdminDashboardPage() {
  await requireStaff()
  const supabase = await createClient()

  const [
    usersCountRes,
    placesCountRes,
    publishedGuidesRes,
    commentsRes,
    photosRes,
    auditLogsRes,
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('places').select('*', { count: 'exact', head: true }),
    supabase.from('guides').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('comments').select('id, content, created_at, user_id, place_id').order('created_at', { ascending: false }).limit(5),
    supabase.from('photos').select('id, image_url, created_at, user_id, place_id').order('created_at', { ascending: false }).limit(5),
    supabase.from('admin_audit_logs').select('id, actor_user_id, actor_role, action, entity_type, entity_id, created_at').order('created_at', { ascending: false }).limit(8),
  ])

  const comments = commentsRes.data ?? []
  const photos = photosRes.data ?? []
  const logs = auditLogsRes.data ?? []

  const userIds = Array.from(
    new Set(
      [
        ...comments.map((x) => x.user_id),
        ...photos.map((x) => x.user_id),
        ...logs.map((x) => x.actor_user_id),
      ].filter(Boolean)
    )
  )

  const placeIds = Array.from(
    new Set(
      [...comments.map((x) => x.place_id), ...photos.map((x) => x.place_id)].filter(Boolean)
    )
  )

  const [profilesRes, placesRes] = await Promise.all([
    userIds.length
      ? supabase.from('profiles').select('id, email, full_name').in('id', userIds)
      : Promise.resolve({ data: [], error: null }),
    placeIds.length
      ? supabase.from('places').select('id, name').in('id', placeIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  const profileMap = new Map(
    (profilesRes.data ?? []).map((p) => [p.id, p.full_name || p.email || 'Unknown user'])
  )

  const placeMap = new Map((placesRes.data ?? []).map((p) => [p.id, p.name]))

  return (
    <AdminShell
      title='Dashboard'
      description='A quick view of platform activity, content and recent admin actions.'
    >
      <div className='grid gap-4 md:grid-cols-3'>
        <StatCard label='Total users' value={usersCountRes.count ?? 0} />
        <StatCard label='Total places' value={placesCountRes.count ?? 0} />
        <StatCard label='Published guides' value={publishedGuidesRes.count ?? 0} />
      </div>

      <div className='mt-6 grid gap-6 xl:grid-cols-3'>
        <SectionCard title='Latest comments'>
          <div className='space-y-4'>
            {comments.length === 0 ? (
              <p className='text-sm text-zinc-500'>No comments yet.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className='rounded-2xl border border-zinc-800 bg-zinc-950 p-4'>
                  <p className='text-sm font-medium text-white'>
                    {profileMap.get(comment.user_id) || 'Unknown user'}
                  </p>
                  <p className='mt-2 line-clamp-3 text-sm leading-6 text-zinc-400'>
                    {comment.content}
                  </p>
                  <div className='mt-3 flex items-center justify-between gap-4 text-xs text-zinc-500'>
                    <span>{placeMap.get(comment.place_id) || 'Unknown place'}</span>
                    <span>{new Date(comment.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title='Latest uploads'>
          <div className='space-y-4'>
            {photos.length === 0 ? (
              <p className='text-sm text-zinc-500'>No uploads yet.</p>
            ) : (
              photos.map((photo) => (
                <div key={photo.id} className='rounded-2xl border border-zinc-800 bg-zinc-950 p-4'>
                  <p className='text-sm font-medium text-white'>
                    {profileMap.get(photo.user_id) || 'Unknown user'}
                  </p>
                  <div className='mt-3 flex items-center gap-4'>
                    <div className='h-16 w-16 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900'>
                      {photo.image_url ? (
                        <img src={photo.image_url} alt='Upload preview' className='h-full w-full object-cover' />
                      ) : null}
                    </div>
                    <div>
                      <p className='text-sm text-zinc-300'>{placeMap.get(photo.place_id) || 'Unknown place'}</p>
                      <p className='mt-1 text-xs text-zinc-500'>{new Date(photo.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title='Latest admin logs'>
          <div className='space-y-4'>
            {logs.length === 0 ? (
              <p className='text-sm text-zinc-500'>No admin actions yet.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className='rounded-2xl border border-zinc-800 bg-zinc-950 p-4'>
                  <div className='flex items-center justify-between gap-4'>
                    <p className='text-sm font-medium text-white'>{log.action}</p>
                    <span className='rounded-full border border-zinc-700 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-zinc-400'>
                      {log.actor_role || 'unknown'}
                    </span>
                  </div>
                  <p className='mt-2 text-sm text-zinc-400'>
                    {profileMap.get(log.actor_user_id) || 'Unknown staff'}
                  </p>
                  <div className='mt-3 flex items-center justify-between gap-4 text-xs text-zinc-500'>
                    <span>{log.entity_type}{log.entity_id ? ` · ${log.entity_id}` : ''}</span>
                    <span>{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>
    </AdminShell>
  )
}
