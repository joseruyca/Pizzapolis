import { AppHeader } from '@/components/layout/app-header'
import { createClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/auth/is-admin'

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

function EmptyState({ text }: { text: string }) {
  return <p className='text-sm text-zinc-500'>{text}</p>
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
    supabase
      .from('guides')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true),
    supabase
      .from('comments')
      .select('id, content, created_at, user_id, place_id')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('photos')
      .select('id, image_url, created_at, user_id, place_id')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('admin_audit_logs')
      .select('id, actor_user_id, actor_role, action, entity_type, entity_id, created_at')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const comments = commentsRes.data ?? []
  const photos = photosRes.data ?? []
  const logs = auditLogsRes.data ?? []

  const commentUserIds = Array.from(
    new Set(comments.map((item) => item.user_id).filter(Boolean))
  )
  const photoUserIds = Array.from(
    new Set(photos.map((item) => item.user_id).filter(Boolean))
  )
  const logUserIds = Array.from(
    new Set(logs.map((item) => item.actor_user_id).filter(Boolean))
  )

  const placeIds = Array.from(
    new Set([
      ...comments.map((item) => item.place_id),
      ...photos.map((item) => item.place_id),
    ].filter(Boolean))
  )

  const allUserIds = Array.from(
    new Set([...commentUserIds, ...photoUserIds, ...logUserIds])
  )

  const [profilesRes, placesRes] = await Promise.all([
    allUserIds.length
      ? supabase.from('profiles').select('id, email, full_name').in('id', allUserIds)
      : Promise.resolve({ data: [], error: null }),
    placeIds.length
      ? supabase.from('places').select('id, name, slug').in('id', placeIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  const profiles = profilesRes.data ?? []
  const places = placesRes.data ?? []

  const profileMap = new Map(
    profiles.map((profile) => [
      profile.id,
      profile.full_name || profile.email || 'Unknown user',
    ])
  )

  const placeMap = new Map(
    places.map((place) => [place.id, { name: place.name, slug: place.slug }])
  )

  return (
    <main className='min-h-screen bg-black text-white'>
      <AppHeader />

      <div className='min-h-screen bg-[linear-gradient(180deg,rgba(60,0,0,0.28),rgba(0,0,0,0.96)_28%)]'>
        <div className='mx-auto max-w-7xl px-6 py-10'>
          <p className='text-sm uppercase tracking-[0.22em] text-red-400'>
            Admin Dashboard
          </p>

          <h1 className='mt-4 text-5xl font-bold tracking-tight'>
            Platform overview
          </h1>

          <p className='mt-5 max-w-2xl text-xl leading-8 text-zinc-300'>
            A quick view of activity, content and recent admin actions.
          </p>

          <div className='mt-10 grid gap-4 md:grid-cols-3'>
            <StatCard
              label='Total users'
              value={usersCountRes.count ?? 0}
            />
            <StatCard
              label='Total places'
              value={placesCountRes.count ?? 0}
            />
            <StatCard
              label='Published guides'
              value={publishedGuidesRes.count ?? 0}
            />
          </div>

          <div className='mt-8 grid gap-6 xl:grid-cols-3'>
            <SectionCard title='Latest comments'>
              {comments.length === 0 ? (
                <EmptyState text='No comments yet.' />
              ) : (
                <div className='space-y-4'>
                  {comments.map((comment) => {
                    const place = placeMap.get(comment.place_id)
                    return (
                      <div
                        key={comment.id}
                        className='rounded-2xl border border-zinc-800 bg-zinc-950 p-4'
                      >
                        <p className='text-sm font-medium text-white'>
                          {profileMap.get(comment.user_id) || 'Unknown user'}
                        </p>
                        <p className='mt-2 line-clamp-3 text-sm leading-6 text-zinc-400'>
                          {comment.content}
                        </p>
                        <div className='mt-3 flex items-center justify-between gap-4 text-xs text-zinc-500'>
                          <span>{place?.name || 'Unknown place'}</span>
                          <span>{new Date(comment.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </SectionCard>

            <SectionCard title='Latest uploads'>
              {photos.length === 0 ? (
                <EmptyState text='No uploads yet.' />
              ) : (
                <div className='space-y-4'>
                  {photos.map((photo) => {
                    const place = placeMap.get(photo.place_id)
                    return (
                      <div
                        key={photo.id}
                        className='rounded-2xl border border-zinc-800 bg-zinc-950 p-4'
                      >
                        <p className='text-sm font-medium text-white'>
                          {profileMap.get(photo.user_id) || 'Unknown user'}
                        </p>
                        <div className='mt-3 flex items-center gap-4'>
                          <div className='h-16 w-16 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900'>
                            {photo.image_url ? (
                              <img
                                src={photo.image_url}
                                alt='Upload preview'
                                className='h-full w-full object-cover'
                              />
                            ) : null}
                          </div>
                          <div className='min-w-0'>
                            <p className='text-sm text-zinc-300'>
                              {place?.name || 'Unknown place'}
                            </p>
                            <p className='mt-1 text-xs text-zinc-500'>
                              {new Date(photo.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </SectionCard>

            <SectionCard title='Latest admin logs'>
              {logs.length === 0 ? (
                <EmptyState text='No admin actions logged yet.' />
              ) : (
                <div className='space-y-4'>
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className='rounded-2xl border border-zinc-800 bg-zinc-950 p-4'
                    >
                      <div className='flex items-center justify-between gap-4'>
                        <p className='text-sm font-medium text-white'>
                          {log.action}
                        </p>
                        <span className='rounded-full border border-zinc-700 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-zinc-400'>
                          {log.actor_role || 'unknown'}
                        </span>
                      </div>

                      <p className='mt-2 text-sm text-zinc-400'>
                        {profileMap.get(log.actor_user_id) || 'Unknown admin'}
                      </p>

                      <div className='mt-3 flex items-center justify-between gap-4 text-xs text-zinc-500'>
                        <span>
                          {log.entity_type}
                          {log.entity_id ? ` · ${log.entity_id}` : ''}
                        </span>
                        <span>{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </div>
    </main>
  )
}
