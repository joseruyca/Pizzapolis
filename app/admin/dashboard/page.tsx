import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Flag,
  Image as ImageIcon,
  Inbox,
  LayoutList,
  MapPin,
  MessageSquare,
  Route,
  ShieldCheck,
  Star,
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
  accent = 'default',
}: {
  label: string
  value: number | string
  icon: React.ReactNode
  hint?: string
  accent?: 'default' | 'red' | 'gold' | 'teal'
}) {
  const accents = {
    default: 'bg-[#101115] border-[#2a3040]',
    red: 'bg-[#151018] border-[#4f2830]',
    gold: 'bg-[#17140f] border-[#4a3a20]',
    teal: 'bg-[#101918] border-[#254746]',
  }

  return (
    <div className={`rounded-[28px] border p-5 shadow-xl ${accents[accent]}`}>
      <div className='flex items-start justify-between gap-4'>
        <div className='min-w-0'>
          <p className='text-[11px] uppercase tracking-[0.18em] text-[#7b8497]'>{label}</p>
          <p className='mt-3 text-4xl font-bold text-white'>{value}</p>
          {hint ? <p className='mt-2 text-sm text-[#a4adbf]'>{hint}</p> : null}
        </div>
        <div className='rounded-2xl border border-white/5 bg-[#181b24] p-3 text-[#a4adbf]'>
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
    <section className='rounded-[28px] border border-[#2a3040] bg-[#101115]/95 p-5 shadow-xl sm:p-6'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h2 className='text-2xl font-semibold text-white'>{title}</h2>
          {subtitle ? <p className='mt-2 text-sm text-[#a4adbf]'>{subtitle}</p> : null}
        </div>

        {actionHref && actionLabel ? (
          <Link
            href={actionHref}
            className='inline-flex items-center gap-2 rounded-xl border border-[#2a3040] bg-[#151821] px-4 py-2 text-sm text-white transition hover:bg-[#1a1f2b]'
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
      className='block rounded-2xl border border-[#2a3040] bg-[#151821] p-5 transition hover:border-[#3b4358] hover:bg-[#1a1f2b]'
    >
      <div className='flex items-center justify-between gap-4'>
        <div className='rounded-2xl border border-white/5 bg-[#0f1117] p-3 text-[#a4adbf]'>
          {icon}
        </div>
        <ArrowRight className='h-4 w-4 text-[#596176]' />
      </div>

      <h3 className='mt-4 text-lg font-semibold text-white'>{label}</h3>
      <p className='mt-2 text-sm leading-6 text-[#a4adbf]'>{description}</p>
    </Link>
  )
}

function PriorityItem({
  label,
  value,
  href,
  severity,
  description,
}: {
  label: string
  value: number | string
  href: string
  severity: 'high' | 'medium' | 'low'
  description: string
}) {
  const styles = {
    high: 'border-[#4f2830] bg-[#311922] text-[#ffd9df]',
    medium: 'border-[#4a3a20] bg-[#2f2615] text-[#ffe2a6]',
    low: 'border-[#254746] bg-[#183130] text-[#d5f1ee]',
  }

  return (
    <Link
      href={href}
      className='block rounded-2xl border border-[#2a3040] bg-[#151821] p-4 transition hover:bg-[#1a1f2b]'
    >
      <div className='flex items-start justify-between gap-4'>
        <div className='min-w-0'>
          <div className='flex flex-wrap items-center gap-2'>
            <p className='text-sm font-semibold text-white'>{label}</p>
            <span className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${styles[severity]}`}>
              {severity}
            </span>
          </div>
          <p className='mt-2 text-sm leading-6 text-[#a4adbf]'>{description}</p>
        </div>

        <div className='shrink-0 rounded-2xl border border-[#2a3040] bg-[#101115] px-4 py-3 text-right'>
          <p className='text-[10px] uppercase tracking-[0.16em] text-[#7b8497]'>Count</p>
          <p className='mt-1 text-2xl font-bold text-white'>{value}</p>
        </div>
      </div>
    </Link>
  )
}

function isPlaceIncomplete(place: {
  borough: string | null
  neighborhood: string | null
  pizza_style: string | null
  best_known_for: string | null
  best_slice: string | null
  first_order_recommendation: string | null
  why_go: string | null
  cheapest_slice_price: number | null
  value_score: number | null
}) {
  let score = 0
  if (place.borough) score += 1
  if (place.neighborhood) score += 1
  if (place.pizza_style) score += 1
  if (place.best_known_for) score += 1
  if (place.best_slice) score += 1
  if (place.first_order_recommendation) score += 1
  if (place.why_go) score += 1
  if (place.cheapest_slice_price !== null) score += 1
  if (place.value_score !== null) score += 1
  return score < 6
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
    openReportsCountRes,
    pendingSubmissionsCountRes,
    routesCountRes,
    draftRoutesCountRes,
    featuredSlotRes,
    placesHealthRes,
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
    supabase
      .from('content_reports')
      .select('*', { count: 'exact', head: true })
      .in('status', ['open', 'reviewing']),
    supabase
      .from('place_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase.from('pizza_routes').select('*', { count: 'exact', head: true }),
    supabase
      .from('pizza_routes')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', false),
    supabase
      .from('featured_slots')
      .select('key, is_active, place_id')
      .eq('key', 'restaurant_of_the_week')
      .maybeSingle(),
    supabase
      .from('places')
      .select(
        'id, borough, neighborhood, pizza_style, best_known_for, best_slice, first_order_recommendation, why_go, cheapest_slice_price, value_score'
      ),
  ])

  const comments = commentsRes.data ?? []
  const photos = photosRes.data ?? []
  const logs = auditLogsRes.data ?? []
  const placeHealthRows = placesHealthRes.data ?? []

  const incompletePlacesCount = placeHealthRows.filter(isPlaceIncomplete).length
  const featuredInactive =
    !featuredSlotRes.data || !featuredSlotRes.data.is_active || !featuredSlotRes.data.place_id

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
    (profilesRes.data ?? []).map((p: any) => [p.id, p.display_name || p.username || 'Unknown user'])
  )
  const placeMap = new Map((placesRes.data ?? []).map((p: any) => [p.id, p.name]))

  return (
    <AdminShell
      title='Dashboard'
      description='The main operational overview for content, moderation, community and admin activity.'
    >
      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <StatCard
          label='Total users'
          value={usersCountRes.count ?? 0}
          icon={<Users className='h-5 w-5' />}
          hint='Registered profiles'
        />
        <StatCard
          label='Places'
          value={placesCountRes.count ?? 0}
          icon={<MapPin className='h-5 w-5' />}
          hint='Published spots'
        />
        <StatCard
          label='Published guides'
          value={publishedGuidesRes.count ?? 0}
          icon={<BookOpen className='h-5 w-5' />}
          hint='Visible editorial content'
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
          value={openReportsCountRes.count ?? 0}
          icon={<Flag className='h-5 w-5' />}
          hint='Needs moderation'
          accent='red'
        />
        <StatCard
          label='Pending submissions'
          value={pendingSubmissionsCountRes.count ?? 0}
          icon={<Inbox className='h-5 w-5' />}
          hint='Pending review'
          accent='gold'
        />
        <StatCard
          label='Recent staff actions'
          value={logs.length}
          icon={<ShieldCheck className='h-5 w-5' />}
          hint='Latest audit entries'
          accent='teal'
        />
      </div>

      <div className='mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]'>
        <SectionCard
          title='Priority queue'
          subtitle='The most important operational issues to handle first.'
        >
          <div className='space-y-3'>
            <PriorityItem
              label='Open moderation reports'
              value={openReportsCountRes.count ?? 0}
              href='/admin/reports'
              severity='high'
              description='Flagged content still waiting for a decision.'
            />
            <PriorityItem
              label='Pending submissions'
              value={pendingSubmissionsCountRes.count ?? 0}
              href='/admin/submissions'
              severity='high'
              description='Community suggestions that still need approval or rejection.'
            />
            <PriorityItem
              label='Incomplete places'
              value={incompletePlacesCount}
              href='/admin/places'
              severity='medium'
              description='Place profiles missing key editorial or pricing fields.'
            />
            <PriorityItem
              label='Draft routes'
              value={draftRoutesCountRes.count ?? 0}
              href='/admin/routes'
              severity='medium'
              description='Routes created but not yet published.'
            />
            <PriorityItem
              label='Featured slot inactive'
              value={featuredInactive ? 1 : 0}
              href='/admin/settings'
              severity={featuredInactive ? 'low' : 'low'}
              description='Restaurant of the week is missing, inactive or not assigned.'
            />
          </div>
        </SectionCard>

        <SectionCard
          title='Quick actions'
          subtitle='Jump straight to the highest-value tasks.'
        >
          <div className='grid gap-4 md:grid-cols-2'>
            <QuickLink
              href='/admin/places'
              label='Manage places'
              description='Update core place data, fix gaps and maintain editorial quality.'
              icon={<MapPin className='h-5 w-5' />}
            />
            <QuickLink
              href='/admin/moderation'
              label='Moderate content'
              description='Review photos and comments quickly from one operational queue.'
              icon={<ShieldCheck className='h-5 w-5' />}
            />
            <QuickLink
              href='/admin/submissions'
              label='Review submissions'
              description='Approve or reject suggested spots from the community.'
              icon={<Inbox className='h-5 w-5' />}
            />
            <QuickLink
              href='/admin/audit-log'
              label='Open audit log'
              description='Trace admin actions and verify who changed what.'
              icon={<LayoutList className='h-5 w-5' />}
            />
          </div>
        </SectionCard>
      </div>

      <div className='mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]'>
        <SectionCard
          title='Admin inbox'
          subtitle='A compact queue view of what most likely needs attention first.'
        >
          <div className='space-y-3'>
            <div className='rounded-2xl border border-[#2a3040] bg-[#151821] p-4'>
              <div className='flex items-center justify-between gap-4'>
                <div className='flex items-center gap-3'>
                  <Flag className='h-4 w-4 text-[#7b8497]' />
                  <p className='text-sm text-[#dbe3f5]'>Reports waiting</p>
                </div>
                <span className='text-lg font-semibold text-white'>{openReportsCountRes.count ?? 0}</span>
              </div>
            </div>

            <div className='rounded-2xl border border-[#2a3040] bg-[#151821] p-4'>
              <div className='flex items-center justify-between gap-4'>
                <div className='flex items-center gap-3'>
                  <Inbox className='h-4 w-4 text-[#7b8497]' />
                  <p className='text-sm text-[#dbe3f5]'>Submissions waiting</p>
                </div>
                <span className='text-lg font-semibold text-white'>{pendingSubmissionsCountRes.count ?? 0}</span>
              </div>
            </div>

            <div className='rounded-2xl border border-[#2a3040] bg-[#151821] p-4'>
              <div className='flex items-center justify-between gap-4'>
                <div className='flex items-center gap-3'>
                  <ImageIcon className='h-4 w-4 text-[#7b8497]' />
                  <p className='text-sm text-[#dbe3f5]'>Recent uploads</p>
                </div>
                <span className='text-lg font-semibold text-white'>{photos.length}</span>
              </div>
            </div>

            <div className='rounded-2xl border border-[#2a3040] bg-[#151821] p-4'>
              <div className='flex items-center justify-between gap-4'>
                <div className='flex items-center gap-3'>
                  <MessageSquare className='h-4 w-4 text-[#7b8497]' />
                  <p className='text-sm text-[#dbe3f5]'>Recent comments</p>
                </div>
                <span className='text-lg font-semibold text-white'>{comments.length}</span>
              </div>
            </div>

            <div className='rounded-2xl border border-[#2a3040] bg-[#151821] p-4'>
              <div className='flex items-center justify-between gap-4'>
                <div className='flex items-center gap-3'>
                  <Star className='h-4 w-4 text-[#7b8497]' />
                  <p className='text-sm text-[#dbe3f5]'>Featured slot status</p>
                </div>
                <span className='text-lg font-semibold text-white'>
                  {featuredInactive ? 'Off' : 'On'}
                </span>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title='System attention'
          subtitle='High-signal operational issues that affect quality and publishing.'
        >
          <div className='space-y-3'>
            <div className='rounded-2xl border border-[#2a3040] bg-[#151821] p-4'>
              <div className='flex items-start gap-3'>
                <AlertTriangle className='mt-0.5 h-5 w-5 text-[#ffe2a6]' />
                <div>
                  <p className='text-sm font-medium text-white'>Incomplete place profiles</p>
                  <p className='mt-1 text-sm text-[#a4adbf]'>
                    {incompletePlacesCount} place{incompletePlacesCount === 1 ? '' : 's'} need better editorial coverage.
                  </p>
                </div>
              </div>
            </div>

            <div className='rounded-2xl border border-[#2a3040] bg-[#151821] p-4'>
              <div className='flex items-start gap-3'>
                <Route className='mt-0.5 h-5 w-5 text-[#d5f1ee]' />
                <div>
                  <p className='text-sm font-medium text-white'>Draft route backlog</p>
                  <p className='mt-1 text-sm text-[#a4adbf]'>
                    {draftRoutesCountRes.count ?? 0} route{draftRoutesCountRes.count === 1 ? '' : 's'} still waiting to be published.
                  </p>
                </div>
              </div>
            </div>

            <div className='rounded-2xl border border-[#2a3040] bg-[#151821] p-4'>
              <div className='flex items-start gap-3'>
                <Star className='mt-0.5 h-5 w-5 text-[#ffd9df]' />
                <div>
                  <p className='text-sm font-medium text-white'>Homepage featured module</p>
                  <p className='mt-1 text-sm text-[#a4adbf]'>
                    {featuredInactive
                      ? 'Restaurant of the week needs activation or an assigned place.'
                      : 'Restaurant of the week is active and assigned.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className='mt-6 grid gap-6 xl:grid-cols-3'>
        <SectionCard
          title='Latest comments'
          subtitle='Recent community conversation that may need review.'
          actionHref='/admin/moderation'
          actionLabel='Open moderation'
        >
          <div className='space-y-4'>
            {comments.length === 0 ? (
              <p className='text-sm text-[#7b8497]'>No comments yet.</p>
            ) : (
              comments.map((comment: any) => (
                <div key={comment.id} className='rounded-2xl border border-[#2a3040] bg-[#151821] p-4'>
                  <p className='text-sm font-medium text-white'>
                    {profileMap.get(comment.user_id) || 'Unknown user'}
                  </p>
                  <p className='mt-2 line-clamp-3 text-sm leading-6 text-[#a4adbf]'>
                    {comment.body || comment.content || 'No content'}
                  </p>
                  <div className='mt-3 flex items-center justify-between gap-4 text-xs text-[#7b8497]'>
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
              <p className='text-sm text-[#7b8497]'>No uploads yet.</p>
            ) : (
              photos.map((photo: any) => (
                <div key={photo.id} className='rounded-2xl border border-[#2a3040] bg-[#151821] p-4'>
                  <p className='text-sm font-medium text-white'>
                    {profileMap.get(photo.user_id) || 'Unknown user'}
                  </p>

                  <div className='mt-3 flex items-center gap-4'>
                    <div className='h-16 w-16 overflow-hidden rounded-2xl border border-[#2a3040] bg-[#0f1117]'>
                      {photo.image_url ? (
                        <img
                          src={photo.image_url}
                          alt='Upload preview'
                          className='h-full w-full object-cover'
                        />
                      ) : null}
                    </div>

                    <div className='min-w-0'>
                      <p className='truncate text-sm text-[#dbe3f5]'>
                        {placeMap.get(photo.place_id) || 'Unknown place'}
                      </p>
                      <p className='mt-1 text-xs text-[#7b8497]'>
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
          title='Latest audit log'
          subtitle='Recent admin and staff actions.'
          actionHref='/admin/audit-log'
          actionLabel='Open audit log'
        >
          <div className='space-y-4'>
            {logs.length === 0 ? (
              <p className='text-sm text-[#7b8497]'>No admin actions yet.</p>
            ) : (
              logs.map((log: any) => (
                <div key={log.id} className='rounded-2xl border border-[#2a3040] bg-[#151821] p-4'>
                  <div className='flex items-center justify-between gap-4'>
                    <p className='text-sm font-medium text-white'>{log.action}</p>
                    <span className='rounded-full border border-[#34384a] px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-[#a4adbf]'>
                      {log.actor_role || 'unknown'}
                    </span>
                  </div>

                  <p className='mt-2 text-sm text-[#a4adbf]'>
                    {profileMap.get(log.actor_user_id) || 'Unknown staff'}
                  </p>

                  <div className='mt-3 flex items-center justify-between gap-4 text-xs text-[#7b8497]'>
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
