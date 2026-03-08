import Link from 'next/link'
import { notFound } from 'next/navigation'
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
      .limit(200),
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
      description='Add stops, set order and define stop notes for this route.'
    >
      <div className='grid gap-6 xl:grid-cols-[380px_1fr]'>
        <section className='rounded-[28px] border border-zinc-800 bg-black/70 p-6 shadow-xl'>
          <Link
            href='/admin/routes'
            className='mb-4 inline-flex rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white transition hover:bg-zinc-900'
          >
            Back to routes
          </Link>

          <h2 className='text-2xl font-semibold text-white'>Add stop</h2>

          <form action={addRouteStop} className='mt-5 space-y-4'>
            <input type='hidden' name='route_id' value={route.id} />

            <select
              name='place_id'
              className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white'
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
              className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white'
            />

            <textarea
              name='stop_note'
              rows={4}
              placeholder='Why this stop matters / what to order'
              className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white'
            />

            <button
              type='submit'
              className='w-full rounded-2xl bg-white px-5 py-3 font-medium text-black transition hover:opacity-90'
            >
              Add stop
            </button>
          </form>
        </section>

        <section className='space-y-4'>
          {routeStops.map((stop) => (
            <div key={stop.id} className='rounded-[28px] border border-zinc-800 bg-black/70 p-6 shadow-xl'>
              <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                <div>
                  <p className='text-sm uppercase tracking-[0.18em] text-red-400'>
                    Stop {stop.sort_order}
                  </p>

                  <h2 className='mt-2 text-xl font-semibold text-white'>
                    {stop.place?.name || 'Unknown place'}
                  </h2>

                  <p className='mt-2 text-sm text-zinc-400'>
                    {[stop.place?.neighborhood, stop.place?.borough].filter(Boolean).join(', ')}
                  </p>

                  {typeof stop.place?.cheapest_slice_price === 'number' ? (
                    <p className='mt-2 text-sm text-zinc-400'>
                      Cheapest slice: ${stop.place.cheapest_slice_price}
                    </p>
                  ) : null}

                  {stop.stop_note ? (
                    <p className='mt-3 text-zinc-300'>{stop.stop_note}</p>
                  ) : null}
                </div>

                <form action={removeRouteStop}>
                  <input type='hidden' name='stop_id' value={stop.id} />
                  <input type='hidden' name='route_id' value={route.id} />
                  <button
                    type='submit'
                    className='rounded-xl border border-red-900 bg-red-950 px-4 py-2 text-sm text-red-200 transition hover:bg-red-900'
                  >
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
