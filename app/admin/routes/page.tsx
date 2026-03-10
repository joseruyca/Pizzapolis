import Link from 'next/link'
import {
  Clock3,
  Eye,
  EyeOff,
  MapPin,
  PlusCircle,
  Route as RouteIcon,
  Trash2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { requireEditor } from '@/lib/auth/is-admin'
import { AdminShell } from '@/components/admin/admin-shell'
import { createRoute, deleteRoute, toggleRoutePublished } from './actions'

function SummaryCard({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string
  value: React.ReactNode
  hint?: string
  tone?: 'default' | 'gold' | 'red' | 'teal'
}) {
  const tones = {
    default: 'bg-[#101115] border-[#2a3040]',
    gold: 'bg-[#17140f] border-[#4a3a20]',
    red: 'bg-[#151018] border-[#4f2830]',
    teal: 'bg-[#101918] border-[#254746]',
  }

  return (
    <div className={`rounded-[24px] border p-4 ${tones[tone]}`}>
      <p className='text-[10px] uppercase tracking-[0.18em] text-[#7b8497]'>{label}</p>
      <p className='mt-2 text-3xl font-bold text-white'>{value}</p>
      {hint ? <p className='mt-2 text-xs text-[#a4adbf]'>{hint}</p> : null}
    </div>
  )
}

function statusTone(published: boolean) {
  return published
    ? 'border-emerald-800 bg-emerald-950 text-emerald-300'
    : 'border-[#34384a] bg-[#151821] text-[#dbe3f5]'
}

export default async function AdminRoutesPage() {
  await requireEditor()
  const supabase = await createClient()

  const { data: routes, error } = await supabase
    .from('pizza_routes')
    .select('*')
    .order('created_at', { ascending: false })

  const safeRoutes = routes ?? []
  const publishedCount = safeRoutes.filter((route) => route.is_published).length
  const draftCount = safeRoutes.length - publishedCount
  const withCoverCount = safeRoutes.filter((route) => route.cover_image_url).length

  return (
    <AdminShell
      title='Routes'
      description='Create, publish and maintain curated pizza routes with a clearer editorial workflow.'
    >
      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <SummaryCard label='Total routes' value={safeRoutes.length} hint='All route entries' />
        <SummaryCard label='Published' value={publishedCount} hint='Visible on public site' tone='teal' />
        <SummaryCard label='Drafts' value={draftCount} hint='Still in progress' tone='gold' />
        <SummaryCard label='With cover image' value={withCoverCount} hint='Visually complete routes' tone='red' />
      </div>

      <div className='mt-6 grid gap-6 xl:grid-cols-[430px_1fr]'>
        <section className='rounded-[28px] border border-[#2a3040] bg-[#101115]/95 p-6 shadow-xl'>
          <div className='flex items-center gap-3'>
            <div className='rounded-2xl border border-[#2a3040] bg-[#151821] p-3 text-[#a4adbf]'>
              <PlusCircle className='h-5 w-5' />
            </div>
            <div>
              <h2 className='text-2xl font-semibold text-white'>Create route</h2>
              <p className='mt-1 text-sm text-[#7b8497]'>
                Add a new curated route shell, then open it and build the stops.
              </p>
            </div>
          </div>

          <form action={createRoute} className='mt-6 space-y-4'>
            <input
              name='title'
              placeholder='Best Cheap Slices in 90 Minutes'
              className='w-full rounded-2xl border border-[#2a3040] bg-[#151821] px-4 py-3 text-white'
            />
            <input
              name='subtitle'
              placeholder='A fast, cheap Manhattan route'
              className='w-full rounded-2xl border border-[#2a3040] bg-[#151821] px-4 py-3 text-white'
            />
            <textarea
              name='description'
              rows={4}
              placeholder='Short route description'
              className='w-full rounded-2xl border border-[#2a3040] bg-[#151821] px-4 py-3 text-white'
            />

            <div className='grid gap-4 md:grid-cols-2'>
              <input
                name='estimated_minutes'
                type='number'
                placeholder='90'
                className='w-full rounded-2xl border border-[#2a3040] bg-[#151821] px-4 py-3 text-white'
              />
              <input
                name='borough'
                placeholder='Manhattan'
                className='w-full rounded-2xl border border-[#2a3040] bg-[#151821] px-4 py-3 text-white'
              />
            </div>

            <input
              name='route_type'
              placeholder='Cheap / Late Night / First-Timers'
              className='w-full rounded-2xl border border-[#2a3040] bg-[#151821] px-4 py-3 text-white'
            />
            <input
              name='cover_image_url'
              placeholder='Cover image URL'
              className='w-full rounded-2xl border border-[#2a3040] bg-[#151821] px-4 py-3 text-white'
            />

            <button
              type='submit'
              className='inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f4ede2] px-5 py-3 font-semibold text-[#181510] transition hover:opacity-90'
            >
              <RouteIcon className='h-4 w-4' />
              Create route
            </button>
          </form>
        </section>

        <section className='space-y-4'>
          {error ? (
            <div className='rounded-2xl border border-red-900 bg-red-950 p-4 text-red-200'>
              Error loading routes: {error.message}
            </div>
          ) : null}

          {safeRoutes.length === 0 ? (
            <div className='rounded-[28px] border border-[#2a3040] bg-[#101115]/95 p-6 shadow-xl text-[#a4adbf]'>
              No routes yet. Create the first one from the panel on the left.
            </div>
          ) : null}

          {safeRoutes.map((route) => (
            <div key={route.id} className='overflow-hidden rounded-[28px] border border-[#2a3040] bg-[#101115]/95 shadow-xl'>
              {route.cover_image_url ? (
                <div className='h-40 w-full overflow-hidden border-b border-[#2a3040] bg-[#151821]'>
                  <img
                    src={route.cover_image_url}
                    alt={route.title}
                    className='h-full w-full object-cover'
                  />
                </div>
              ) : null}

              <div className='p-6'>
                <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                  <div className='min-w-0'>
                    <div className='flex flex-wrap items-center gap-3'>
                      <h2 className='text-xl font-semibold text-white'>{route.title}</h2>
                      <span className={`rounded-full border px-3 py-1 text-[11px] ${statusTone(route.is_published)}`}>
                        {route.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    {route.subtitle ? (
                      <p className='mt-2 text-[#dbe3f5]'>{route.subtitle}</p>
                    ) : null}

                    {route.description ? (
                      <p className='mt-3 line-clamp-2 text-sm leading-6 text-[#a4adbf]'>
                        {route.description}
                      </p>
                    ) : null}

                    <div className='mt-4 flex flex-wrap gap-3 text-sm text-[#7b8497]'>
                      {route.route_type ? (
                        <span className='inline-flex items-center gap-2 rounded-full border border-[#2a3040] bg-[#151821] px-3 py-1.5 text-[12px] text-[#dbe3f5]'>
                          <RouteIcon className='h-3.5 w-3.5' />
                          {route.route_type}
                        </span>
                      ) : null}

                      {route.borough ? (
                        <span className='inline-flex items-center gap-2 rounded-full border border-[#2a3040] bg-[#151821] px-3 py-1.5 text-[12px] text-[#dbe3f5]'>
                          <MapPin className='h-3.5 w-3.5' />
                          {route.borough}
                        </span>
                      ) : null}

                      {route.estimated_minutes ? (
                        <span className='inline-flex items-center gap-2 rounded-full border border-[#2a3040] bg-[#151821] px-3 py-1.5 text-[12px] text-[#dbe3f5]'>
                          <Clock3 className='h-3.5 w-3.5' />
                          {route.estimated_minutes} min
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className='flex flex-wrap gap-2'>
                    <Link
                      href={`/admin/routes/${route.id}`}
                      className='rounded-xl border border-[#2a3040] bg-[#151821] px-4 py-2 text-sm text-white transition hover:bg-[#1a1f2b]'
                    >
                      Edit stops
                    </Link>

                    <form action={toggleRoutePublished}>
                      <input type='hidden' name='id' value={route.id} />
                      <input type='hidden' name='next_value' value={route.is_published ? 'false' : 'true'} />
                      <button
                        type='submit'
                        className='inline-flex items-center gap-2 rounded-xl border border-[#2a3040] bg-[#151821] px-4 py-2 text-sm text-white transition hover:bg-[#1a1f2b]'
                      >
                        {route.is_published ? (
                          <>
                            <EyeOff className='h-4 w-4' />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Eye className='h-4 w-4' />
                            Publish
                          </>
                        )}
                      </button>
                    </form>

                    <form action={deleteRoute}>
                      <input type='hidden' name='id' value={route.id} />
                      <button
                        type='submit'
                        className='inline-flex items-center gap-2 rounded-xl border border-red-900 bg-red-950 px-4 py-2 text-sm text-red-200 transition hover:bg-red-900'
                      >
                        <Trash2 className='h-4 w-4' />
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>
      </div>
    </AdminShell>
  )
}
