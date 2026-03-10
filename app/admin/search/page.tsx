import Link from 'next/link'
import {
  Inbox,
  MapPin,
  Route as RouteIcon,
  Search,
  Shield,
  Users,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/auth/is-admin'
import { AdminShell } from '@/components/admin/admin-shell'

function SectionCard({
  title,
  count,
  icon,
  children,
}: {
  title: string
  count: number
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className='rounded-[28px] border border-[#2a3040] bg-[#101115]/95 p-6 shadow-xl'>
      <div className='flex items-center justify-between gap-4'>
        <div className='flex items-center gap-3'>
          <div className='rounded-2xl border border-[#2a3040] bg-[#151821] p-3 text-[#a4adbf]'>
            {icon}
          </div>
          <div>
            <h2 className='text-2xl font-semibold text-white'>{title}</h2>
            <p className='mt-1 text-sm text-[#7b8497]'>{count} result{count === 1 ? '' : 's'}</p>
          </div>
        </div>
      </div>

      <div className='mt-5'>{children}</div>
    </section>
  )
}

export default async function AdminSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  await requireStaff()
  const supabase = await createClient()
  const params = await searchParams
  const q = (params.q || '').trim()
  const hasQuery = q.length > 0

  let places: any[] = []
  let users: any[] = []
  let routes: any[] = []
  let reports: any[] = []
  let submissions: any[] = []

  if (hasQuery) {
    const [placesRes, usersRes, routesRes, reportsRes, submissionsRes] = await Promise.all([
      supabase
        .from('places')
        .select('id, name, slug, borough, neighborhood')
        .or(`name.ilike.%${q}%,slug.ilike.%${q}%,borough.ilike.%${q}%,neighborhood.ilike.%${q}%`)
        .limit(10),

      supabase
        .from('profiles')
        .select('id, username, display_name')
        .or(`username.ilike.%${q}%,display_name.ilike.%${q}%`)
        .limit(10),

      supabase
        .from('pizza_routes')
        .select('id, title, subtitle, borough, is_published')
        .or(`title.ilike.%${q}%,subtitle.ilike.%${q}%,borough.ilike.%${q}%`)
        .limit(10),

      supabase
        .from('content_reports')
        .select('id, target_type, target_id, status, reason')
        .or(`target_type.ilike.%${q}%,status.ilike.%${q}%,reason.ilike.%${q}%`)
        .limit(10),

      supabase
        .from('place_submissions')
        .select('id, name, address, borough, neighborhood, status')
        .or(`name.ilike.%${q}%,address.ilike.%${q}%,borough.ilike.%${q}%,neighborhood.ilike.%${q}%`)
        .limit(10),
    ])

    places = placesRes.data ?? []
    users = usersRes.data ?? []
    routes = routesRes.data ?? []
    reports = reportsRes.data ?? []
    submissions = submissionsRes.data ?? []
  }

  return (
    <AdminShell
      title='Search'
      description='Search across the admin panel from one place: content, users, moderation and operations.'
    >
      <div className='rounded-[28px] border border-[#2a3040] bg-[#101115]/95 p-6 shadow-xl'>
        <form action='/admin/search' method='get'>
          <div className='relative'>
            <Search className='pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b8497]' />
            <input
              name='q'
              defaultValue={q}
              placeholder='Search places, users, routes, reports, submissions...'
              className='w-full rounded-2xl border border-[#2a3040] bg-[#151821] py-3 pl-11 pr-4 text-white outline-none'
            />
          </div>
        </form>

        <div className='mt-4 text-sm text-[#a4adbf]'>
          {hasQuery ? `Showing results for "${q}"` : 'Enter a search term to begin.'}
        </div>
      </div>

      {hasQuery ? (
        <div className='mt-6 grid gap-6 xl:grid-cols-2'>
          <SectionCard title='Places' count={places.length} icon={<MapPin className='h-5 w-5' />}>
            <div className='space-y-3'>
              {places.length === 0 ? (
                <p className='text-sm text-[#7b8497]'>No places found.</p>
              ) : (
                places.map((item) => (
                  <Link
                    key={item.id}
                    href={`/admin/places`}
                    className='block rounded-2xl border border-[#2a3040] bg-[#151821] p-4 transition hover:bg-[#1a1f2b]'
                  >
                    <p className='font-medium text-white'>{item.name}</p>
                    <p className='mt-1 text-sm text-[#a4adbf]'>
                      {[item.neighborhood, item.borough].filter(Boolean).join(', ')}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard title='Users' count={users.length} icon={<Users className='h-5 w-5' />}>
            <div className='space-y-3'>
              {users.length === 0 ? (
                <p className='text-sm text-[#7b8497]'>No users found.</p>
              ) : (
                users.map((item) => (
                  <Link
                    key={item.id}
                    href='/admin/users'
                    className='block rounded-2xl border border-[#2a3040] bg-[#151821] p-4 transition hover:bg-[#1a1f2b]'
                  >
                    <p className='font-medium text-white'>
                      {item.display_name || item.username || 'Unnamed user'}
                    </p>
                    <p className='mt-1 break-all text-sm text-[#a4adbf]'>{item.id}</p>
                  </Link>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard title='Routes' count={routes.length} icon={<RouteIcon className='h-5 w-5' />}>
            <div className='space-y-3'>
              {routes.length === 0 ? (
                <p className='text-sm text-[#7b8497]'>No routes found.</p>
              ) : (
                routes.map((item) => (
                  <Link
                    key={item.id}
                    href={`/admin/routes/${item.id}`}
                    className='block rounded-2xl border border-[#2a3040] bg-[#151821] p-4 transition hover:bg-[#1a1f2b]'
                  >
                    <p className='font-medium text-white'>{item.title}</p>
                    <p className='mt-1 text-sm text-[#a4adbf]'>
                      {[item.subtitle, item.borough].filter(Boolean).join(' · ')}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard title='Reports' count={reports.length} icon={<Shield className='h-5 w-5' />}>
            <div className='space-y-3'>
              {reports.length === 0 ? (
                <p className='text-sm text-[#7b8497]'>No reports found.</p>
              ) : (
                reports.map((item) => (
                  <Link
                    key={item.id}
                    href='/admin/reports'
                    className='block rounded-2xl border border-[#2a3040] bg-[#151821] p-4 transition hover:bg-[#1a1f2b]'
                  >
                    <p className='font-medium text-white'>{item.target_type}</p>
                    <p className='mt-1 text-sm text-[#a4adbf]'>
                      {item.status} · {item.reason || 'No reason'}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard title='Submissions' count={submissions.length} icon={<Inbox className='h-5 w-5' />}>
            <div className='space-y-3'>
              {submissions.length === 0 ? (
                <p className='text-sm text-[#7b8497]'>No submissions found.</p>
              ) : (
                submissions.map((item) => (
                  <Link
                    key={item.id}
                    href='/admin/submissions'
                    className='block rounded-2xl border border-[#2a3040] bg-[#151821] p-4 transition hover:bg-[#1a1f2b]'
                  >
                    <p className='font-medium text-white'>{item.name}</p>
                    <p className='mt-1 text-sm text-[#a4adbf]'>
                      {[item.neighborhood, item.borough, item.status].filter(Boolean).join(' · ')}
                    </p>
                  </Link>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      ) : null}
    </AdminShell>
  )
}
