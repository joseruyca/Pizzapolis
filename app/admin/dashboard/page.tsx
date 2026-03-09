import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Flag,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Route,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/auth/is-admin'
import { AdminShell } from '@/components/admin/admin-shell'

function StatCard({
  label,
  value,
  icon,
  hint,
}: {
  label: string
  value: number | string
  icon: React.ReactNode
  hint?: string
}) {
  return (
    <div className='rounded-[28px] border border-zinc-800 bg-[#0e0e10]/90 p-6 shadow-xl'>
      <div className='flex items-center justify-between gap-4'>
        <div>
          <p className='text-sm uppercase tracking-[0.18em] text-zinc-500'>{label}</p>
          <p className='mt-4 text-4xl font-bold text-white'>{value}</p>
          {hint ? <p className='mt-2 text-sm text-zinc-500'>{hint}</p> : null}
        </div>
        <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-zinc-400'>
          {icon}
        </div>
      </div>
    </div>
  )
}

function SectionCard({
  title,
  subtitle,
  actionHref,
  actionLabel,
  children,
}: {
  title: string
  subtitle?: string
  actionHref?: string
  actionLabel?: string
  children: React.ReactNode
}) {
  return (
    <section className='rounded-[28px] border border-zinc-800 bg-[#0e0e10]/90 p-6 shadow-xl'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h2 className='text-2xl font-semibold text-white'>{title}</h2>
          {subtitle ? <p className='mt-2 text-sm text-zinc-400'>{subtitle}</p> : null}
        </div>

        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className='inline-flex items-center gap-2 rounded-xl border border-zinc-800 px-4 py-2 text-sm text-white transition hover:bg-zinc-900'
          >
            <span>{actionLabel}</span>
            <ArrowRight className='h-4 w-4' />
          </Link>
        ) : null}
      </div>

      <div className='mt-5'>{children}</div>
    </section>
  )
}

function QuickLink({
  href,
  label,
  description,
  icon,
}: {
  href: string
  label: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className='block rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition hover:bg-zinc-900'
    >
      <div className='flex items-center justify-between gap-4'>
        <div className='rounded-2xl border border-zinc-800 bg-black p-3 text-zinc-400'>
          {icon}
        </div>
        <ArrowRight className='h-4 w-4 text-zinc-600' />
      </div>

      <h3 className='mt-4 text-lg font-semibold text-white'>{label}</h3>
      <p className='mt-2 text-sm leading-6 text-zinc-400'>{description}</p>
    </Link>
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
    reportsCountRes,
    submissionsCountRes,
    routesCountRes,
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('places').select('*', { count: 'exact', head: true }),
    supabase.from('guides').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase
      .from('comments')
      .select('id, body, content, created_at, user_id, place_id')
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
    supabase.from('reports').select('*', { count: 'exact', head: true }),
    supabase.from('submissions').select('*', { count: 'exact', head: true }),
    supabase.from('pizza_routes').select('*', { count: 'exact', head: true }),
  ])

  const comments = commentsRes.data ?? []
  const photos = photosRes.data ?? []
  const logs = auditLogsRes.data ?? []

  const userIds = Array.from(
    new Set(
      [
        ...comments.map((x: any) => x.user_id),
        ...photos.map((x: any) => x.user_id),
        ...logs.map((x: any) => x.actor_user_id),
      ].filter(Boolean)
    )
  )

  const placeIds = Array.from(
    new Set(
      [...comments.map((x: any) => x.place_id), ...photos.map((x: any) => x.place_id)].filter(Boolean)
    )
  )

  const [profilesRes, placesRes] = await Promise.all([
    userIds.length
      ? supabase.from('profiles').select('id, username, display_name').in('id', userIds)
      : Promise.resolve({ data: [], error: null }),
    placeIds.length
      ? supabase.from('places').select('id, name').in('id', placeIds)
      : Promise.resolve({ data: [], error: null }),
  ])

  const profileMap = new Map(
    (profilesRes.data ?? []).map((p: any) => [
      p.id,
      p.display_name || p.username || 'Unknown user',
    ])
  )

  const placeMap = new Map((placesRes.data ?? []).map((p: any) => [p.id, p.name]))

  return (
    <AdminShell
      title='Dashboard'
      description='A clear overview of platform health, moderation flow, recent activity and the fastest routes to action.'
    >
      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <StatCard
          label='Total users'
          value={usersCountRes.count ?? 0}
          icon={<Users className='h-5 w-5' />}
          hint='Registered profiles'
        />
        <StatCard
          label='Total places'
          value={placesCountRes.count ?? 0}
          icon={<MapPin className='h-5 w-5' />}
          hint='Published spot entries'
        />
        <StatCard
          label='Published guides'
          value={publishedGuidesRes.count ?? 0}
          icon={<BookOpen className='h-5 w-5' />}
          hint='Visible editorial guides'
        />
        <StatCard
          label='Routes'
          value={routesCountRes.count ?? 0}
          icon={<Route className='h-5 w-5' />}
          hint='Curated route entries'
        />
      </div>

      <div className='mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        <StatCard
          label='Open reports'
          value={reportsCountRes.count ?? 0}
          icon={<Flag className='h-5 w-5' />}
          hint='Needs review'
        />
        <StatCard
          label='Submissions'
          value={submissionsCountRes.count ?? 0}
          icon={<Inbox className='h-5 w-5' />}
          hint='Pending community input'
        />
        <StatCard
          label='Recent logs'
          value={logs.length}
          icon={<ShieldCheck className='h-5 w-5' />}
          hint='Latest staff actions shown below'
        />
      </div>

      <div className='mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]'>
        <SectionCard
          title='Quick actions'
          subtitle='The most common admin tasks should be one tap away.'
        >
          <div className='grid gap-4 md:grid-cols-2'>
            <QuickLink
              href='/admin/places'
              label='Manage places'
              description='Edit entries, refine badges, complete fields and keep the map clean.'
              icon={<MapPin className='h-5 w-5' />}
            />
            <QuickLink
              href='/admin/moderation'
              label='Moderate content'
              description='Approve photos, review comments and keep user content high quality.'
              icon={<ShieldCheck className='h-5 w-5' />}
            />
            <QuickLink
              href='/admin/routes'
              label='Build routes'
              description='Curate pizza crawls, sort stops and improve route quality.'
              icon={<Route className='h-5 w-5' />}
            />
            <QuickLink
              href='/admin/users'
              label='Manage users'
              description='Review profiles, assign roles and keep permissions under control.'
              icon={<Users className='h-5 w-5' />}
            />
          </div>
        </SectionCard>

        <SectionCard
          title='Admin inbox'
          subtitle='A compact operational view of the queue that usually needs attention first.'
        >
          <div className='space-y-3'>
            <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-4'>
              <div className='flex items-center justify-between gap-4'>
                <div className='flex items-center gap-3'>
                  <Flag className='h-4 w-4 text-zinc-500' />
                  <p className='text-sm text-zinc-300'>Reports waiting</p>
                </div>
                <span className='text-lg font-semibold text-white'>{reportsCountRes.count ?? 0}</span>
              </div>
            </div>

            <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-4'>
              <div className='flex items-center justify-between gap-4'>
                <div className='flex items-center gap-3'>
                  <Inbox className='h-4 w-4 text-zinc-500' />
                  <p className='text-sm text-zinc-300'>Submissions waiting</p>
                </div>
                <span className='text-lg font-semibold text-white'>{submissionsCountRes.count ?? 0}</span>
              </div>
            </div>

            <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-4'>
              <div className='flex items-center justify-between gap-4'>
                <div className='flex items-center gap-3'>
                  <ImageIcon className='h-4 w-4 text-zinc-500' />
                  <p className='text-sm text-zinc-300'>Recent uploads</p>
                </div>
                <span className='text-lg font-semibold text-white'>{photos.length}</span>
              </div>
            </div>

            <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-4'>
              <div className='flex items-center justify-between gap-4'>
                <div className='flex items-center gap-3'>
                  <MessageSquare className='h-4 w-4 text-zinc-500' />
                  <p className='text-sm text-zinc-300'>Recent comments</p>
                </div>
                <span className='text-lg font-semibold text-white'>{comments.length}</span>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className='mt-6 grid gap-6 xl:grid-cols-3'>
        <SectionCard
          title='Latest comments'
          subtitle='Quick scan of recent community conversation.'
          actionHref='/admin/moderation'
          actionLabel='Open moderation'
        >
          <div className='space-y-4'>
            {comments.length === 0 ? (
              <p className='text-sm text-zinc-500'>No comments yet.</p>
            ) : (
              comments.map((comment: any) => (
                <div key={comment.id} className='rounded-2xl border border-zinc-800 bg-zinc-950 p-4'>
                  <p className='text-sm font-medium text-white'>
                    {profileMap.get(comment.user_id) || 'Unknown user'}
                  </p>
                  <p className='mt-2 line-clamp-3 text-sm leading-6 text-zinc-400'>
                    {comment.body || comment.content || 'No content'}
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

        <SectionCard
          title='Latest uploads'
          subtitle='Newest image activity across the platform.'
          actionHref='/admin/moderation'
          actionLabel='Review uploads'
        >
          <div className='space-y-4'>
            {photos.length === 0 ? (
              <p className='text-sm text-zinc-500'>No uploads yet.</p>
            ) : (
              photos.map((photo: any) => (
                <div key={photo.id} className='rounded-2xl border border-zinc-800 bg-zinc-950 p-4'>
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
                      <p className='truncate text-sm text-zinc-300'>
                        {placeMap.get(photo.place_id) || 'Unknown place'}
                      </p>
                      <p className='mt-1 text-xs text-zinc-500'>
                        {new Date(photo.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard
          title='Latest admin logs'
          subtitle='Recent staff activity across the backend.'
          actionHref='/admin/analytics'
          actionLabel='Open analytics'
        >
          <div className='space-y-4'>
            {logs.length === 0 ? (
              <p className='text-sm text-zinc-500'>No admin actions yet.</p>
            ) : (
              logs.map((log: any) => (
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
                    <span>
                      {log.entity_type}
                      {log.entity_id ? ` · ${log.entity_id}` : ''}
                    </span>
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
