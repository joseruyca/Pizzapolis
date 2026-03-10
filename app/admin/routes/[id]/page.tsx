import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Clock3, MapPin, PlusCircle, Route as RouteIcon, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { requireEditor } from '@/lib/auth/is-admin'
import { AdminShell } from '@/components/admin/admin-shell'
import { addRouteStop, removeRouteStop } from './actions'

type RouteStop = {
  id: string
  sort_order: number
  stop_note: string | null
  place: {
    id: string
    name: string
    slug: string
    borough: string | null
    neighborhood: string | null
    cheapest_slice_price: number | null
  } | null
}

export default async function AdminRouteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireEditor()
  const { id } = await params
  const supabase = await createClient()

  const { data: route } = await supabase
    .from('pizza_routes')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (!route) {
    notFound()
  }

  const [placesRes, routeStopsRes] = await Promise.all([
    supabase
      .from('places')
      .select('id, name')
      .order('name', { ascending: true })
      .limit(250),
    supabase
      .from('pizza_route_places')
      .select(`
        id,
        sort_order,
        stop_note,
        place:places (
          id,
          name,
          slug,
          borough,
          neighborhood,
          cheapest_slice_price
        )
      `)
      .eq('route_id', id)
      .order('sort_order', { ascending: true }),
  ])

  const places = placesRes.data ?? []
  const routeStops = (routeStopsRes.data ?? []) as unknown as RouteStop[]

  return (
    <AdminShell
      title={route.title}
      description='Manage the stop sequence, ordering and editorial notes for this route.'
    >
      <div className='grid gap-6 xl:grid-cols-[390px_1fr]'>
        <section className='rounded-[28px] border border-[#2a3040] bg-[#101115]/95 p-6 shadow-xl'>
          <Link
            href='/admin/routes'
            className='mb-4 inline-flex rounded-xl border border-[#2a3040] bg-[#151821] px-4 py-2 text-sm text-white transition hover:bg-[#1a1f2b]'
          >
            Back to routes
          </Link>

          <div className='mb-5 rounded-[24px] border border-[#2a3040] bg-[#151821] p-4'>
            <div className='flex flex-wrap items-center gap-2'>
              {route.route_type ? (
                <span className='rounded-full border border-[#2a3040] bg-[#101115] px-3 py-1 text-[11px] text-[#dbe3f5]'>
                  {route.route_type}
                </span>
              ) : null}
              {route.borough ? (
                <span className='rounded-full border border-[#2a3040] bg-[#101115] px-3 py-1 text-[11px] text-[#dbe3f5]'>
                  {route.borough}
                </span>
              ) : null}
              {route.estimated_minutes ? (
                <span className='rounded-full border border-[#2a3040] bg-[#101115] px-3 py-1 text-[11px] text-[#dbe3f5]'>
                  {route.estimated_minutes} min
                </span>
              ) : null}
            </div>

            {route.subtitle ? (
              <p className='mt-3 text-sm text-[#dbe3f5]'>{route.subtitle}</p>
            ) : null}
          </div>

          <div className='flex items-center gap-3'>
            <div className='rounded-2xl border border-[#2a3040] bg-[#151821] p-3 text-[#a4adbf]'>
              <PlusCircle className='h-5 w-5' />
            </div>
            <div>
              <h2 className='text-2xl font-semibold text-white'>Add stop</h2>
              <p className='mt-1 text-sm text-[#7b8497]'>
                Select a place, set the order and explain why it matters.
              </p>
            </div>
          </div>

          <form action={addRouteStop} className='mt-5 space-y-4'>
            <input type='hidden' name='route_id' value={route.id} />

            <select
              name='place_id'
              className='w-full rounded-2xl border border-[#2a3040] bg-[#151821] px-4 py-3 text-white'
            >
              <option value=''>Select place</option>
              {places.map((place) => (
                <option key={place.id} value={place.id}>
                  {place.name}
                </option>
              ))}
            </select>

            <input
              name='sort_order'
              type='number'
              placeholder='1'
              className='w-full rounded-2xl border border-[#2a3040] bg-[#151821] px-4 py-3 text-white'
            />

            <textarea
              name='stop_note'
              rows={4}
              placeholder='Why this stop matters / what to order'
              className='w-full rounded-2xl border border-[#2a3040] bg-[#151821] px-4 py-3 text-white'
            />

            <button
              type='submit'
              className='inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f4ede2] px-5 py-3 font-semibold text-[#181510] transition hover:opacity-90'
            >
              <RouteIcon className='h-4 w-4' />
              Add stop
            </button>
          </form>
        </section>

        <section className='space-y-4'>
          {routeStops.length === 0 ? (
            <div className='rounded-[28px] border border-[#2a3040] bg-[#101115]/95 p-6 shadow-xl text-[#a4adbf]'>
              No stops yet. Add the first one from the panel on the left.
            </div>
          ) : null}

          {routeStops.map((stop) => (
            <div key={stop.id} className='rounded-[28px] border border-[#2a3040] bg-[#101115]/95 p-6 shadow-xl'>
              <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                <div className='min-w-0'>
                  <p className='inline-flex rounded-full border border-[#4a3a20] bg-[#2f2615] px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#ffe2a6]'>
                    Stop {stop.sort_order}
                  </p>

                  <h2 className='mt-3 text-xl font-semibold text-white'>
                    {stop.place?.name || 'Unknown place'}
                  </h2>

                  <div className='mt-3 flex flex-wrap gap-3 text-sm text-[#7b8497]'>
                    <span className='inline-flex items-center gap-2'>
                      <MapPin className='h-4 w-4' />
                      {[stop.place?.neighborhood, stop.place?.borough].filter(Boolean).join(', ')}
                    </span>

                    {typeof stop.place?.cheapest_slice_price === 'number' ? (
                      <span className='inline-flex items-center gap-2'>
                        <Clock3 className='h-4 w-4' />
                        ${stop.place.cheapest_slice_price} slice
                      </span>
                    ) : null}
                  </div>

                  {stop.stop_note ? (
                    <div className='mt-4 rounded-2xl border border-[#2a3040] bg-[#151821] p-4'>
                      <p className='text-sm leading-6 text-[#dbe3f5]'>{stop.stop_note}</p>
                    </div>
                  ) : null}
                </div>

                <form action={removeRouteStop}>
                  <input type='hidden' name='stop_id' value={stop.id} />
                  <input type='hidden' name='route_id' value={route.id} />
                  <button
                    type='submit'
                    className='inline-flex items-center gap-2 rounded-xl border border-red-900 bg-red-950 px-4 py-2 text-sm text-red-200 transition hover:bg-red-900'
                  >
                    <Trash2 className='h-4 w-4' />
                    Remove
                  </button>
                </form>
              </div>
            </div>
          ))}
        </section>
      </div>
    </AdminShell>
  )
}
