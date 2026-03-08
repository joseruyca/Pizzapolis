import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AppHeader } from '@/components/layout/app-header'
import { createPublicClient } from '@/lib/supabase/public'
import { RouteMap } from '@/components/routes/route-map'
import { haversineDistanceKm, estimateWalkingMinutes } from '@/lib/route-utils'

type RouteStop = {
  id: string
  sort_order: number
  stop_note: string | null
  place: {
    id: string
    slug: string
    name: string
    borough: string | null
    neighborhood: string | null
    latitude: number | null
    longitude: number | null
    cheapest_slice_price: number | null
    whole_pie_price: number | null
    value_score?: number | null
    best_known_for: string | null
    is_best_under_5?: boolean | null
    is_best_under_10?: boolean | null
  } | null
}

function MetaPill({ children }: { children: React.ReactNode }) {
  return (
    <span className='rounded-full border border-zinc-700 bg-zinc-950/80 px-3 py-1 text-xs text-zinc-300'>
      {children}
    </span>
  )
}

function SummaryCard({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className='rounded-[22px] border border-zinc-800 bg-zinc-950/80 p-5'>
      <p className='text-xs uppercase tracking-[0.18em] text-zinc-500'>{label}</p>
      <div className='mt-3 text-2xl font-bold text-white'>{value}</div>
    </div>
  )
}

export default async function RouteDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = createPublicClient()

  const { data: route, error } = await supabase
    .from('pizza_routes')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()

  if (error || !route) {
    notFound()
  }

  const { data: stopsRaw } = await supabase
    .from('pizza_route_places')
    .select(`
      id,
      sort_order,
      stop_note,
      place:places (
        id,
        slug,
        name,
        borough,
        neighborhood,
        latitude,
        longitude,
        cheapest_slice_price,
        whole_pie_price,
        value_score,
        best_known_for,
        is_best_under_5,
        is_best_under_10
      )
    `)
    .eq('route_id', route.id)
    .order('sort_order', { ascending: true })

  const stops = (stopsRaw ?? []) as unknown as RouteStop[]

  const validStops = stops.filter(
    (stop) =>
      stop.place &&
      typeof stop.place.latitude === 'number' &&
      typeof stop.place.longitude === 'number'
  )

  const segmentTimes = validStops.map((stop, index) => {
    if (index === validStops.length - 1) return null

    const current = stop.place!
    const next = validStops[index + 1].place!

    const distanceKm = haversineDistanceKm(
      current.latitude as number,
      current.longitude as number,
      next.latitude as number,
      next.longitude as number
    )

    return {
      fromStopId: stop.id,
      minutes: estimateWalkingMinutes(distanceKm),
      distanceKm,
    }
  })

  const totalSliceSpend = stops.reduce((sum, stop) => {
    return sum + (stop.place?.cheapest_slice_price ?? 0)
  }, 0)

  const extraWalkingMinutes = segmentTimes.reduce((sum, segment) => {
    return sum + (segment?.minutes ?? 0)
  }, 0)

  const totalRouteMinutes = (route.estimated_minutes ?? 0) + extraWalkingMinutes

  const routeMood =
    route.route_type ||
    (route.title.toLowerCase().includes('cheap')
      ? 'Cheap Run'
      : route.title.toLowerCase().includes('late')
      ? 'Late Night'
      : 'Curated Route')

  const googleMapsRouteUrl =
    validStops.length >= 2
      ? `https://www.google.com/maps/dir/?api=1&travelmode=walking&origin=${validStops[0].place!.latitude},${validStops[0].place!.longitude}&destination=${validStops[validStops.length - 1].place!.latitude},${validStops[validStops.length - 1].place!.longitude}&waypoints=${validStops
          .slice(1, -1)
          .map((stop) => `${stop.place!.latitude},${stop.place!.longitude}`)
          .join('|')}`
      : validStops.length === 1
      ? `https://www.google.com/maps/search/?api=1&query=${validStops[0].place!.latitude},${validStops[0].place!.longitude}`
      : '#'

  return (
    <main className='min-h-screen bg-black text-white'>
      <AppHeader />

      <div className='min-h-screen bg-[linear-gradient(180deg,rgba(60,0,0,0.28),rgba(0,0,0,0.96)_28%)]'>
        <div className='mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10'>
          <Link
            href='/routes'
            className='inline-flex rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white transition hover:bg-zinc-900'
          >
            Back to routes
          </Link>

          <section className='relative mt-6 overflow-hidden rounded-[32px] border border-zinc-800 shadow-2xl sm:mt-8'>
            {route.cover_image_url ? (
              <img
                src={route.cover_image_url}
                alt={route.title}
                className='absolute inset-0 h-full w-full object-cover'
              />
            ) : (
              <div className='absolute inset-0 bg-[linear-gradient(180deg,rgba(95,12,12,0.20),rgba(0,0,0,0.94))]' />
            )}

            <div className='absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18),rgba(0,0,0,0.60)_42%,rgba(0,0,0,0.94))]' />
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.14),transparent_28%)]' />

            <div className='relative p-6 sm:p-8 md:p-10'>
              <div className='max-w-4xl'>
                <div className='flex flex-wrap gap-2'>
                  <MetaPill>{routeMood}</MetaPill>
                  {route.borough ? <MetaPill>{route.borough}</MetaPill> : null}
                  {totalRouteMinutes > 0 ? <MetaPill>{totalRouteMinutes} min total</MetaPill> : null}
                  <MetaPill>{stops.length} stops</MetaPill>
                  {totalSliceSpend > 0 ? <MetaPill>${totalSliceSpend.toFixed(2)} est. slice spend</MetaPill> : null}
                </div>

                <h1 className='mt-5 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl'>
                  {route.title}
                </h1>

                {route.subtitle ? (
                  <p className='mt-4 max-w-3xl text-xl text-zinc-200 sm:text-2xl'>
                    {route.subtitle}
                  </p>
                ) : null}

                {route.description ? (
                  <p className='mt-5 max-w-3xl text-base leading-8 text-zinc-300 sm:text-lg'>
                    {route.description}
                  </p>
                ) : null}

                <div className='mt-8 flex flex-wrap gap-3'>
                  <a
                    href='#route-flow'
                    className='inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-medium text-black transition hover:opacity-90'
                  >
                    <span>Start this route</span>
                    <span>→</span>
                  </a>

                  <a
                    href={googleMapsRouteUrl}
                    target='_blank'
                    rel='noreferrer'
                    className='inline-flex items-center gap-2 rounded-2xl border border-zinc-700 bg-black/25 px-5 py-3 text-sm font-medium text-white backdrop-blur transition hover:bg-zinc-900'
                  >
                    <span>Open in Google Maps</span>
                  </a>
                </div>
              </div>
            </div>
          </section>

          <section className='mt-6 grid gap-4 sm:mt-8 md:grid-cols-2 xl:grid-cols-4'>
            <SummaryCard
              label='Estimated time'
              value={totalRouteMinutes > 0 ? `${totalRouteMinutes} min` : '—'}
            />
            <SummaryCard label='Stops' value={stops.length} />
            <SummaryCard
              label='Estimated spend'
              value={totalSliceSpend > 0 ? `$${totalSliceSpend.toFixed(2)}` : '—'}
            />
            <SummaryCard
              label='Best for'
              value={routeMood}
            />
          </section>

          <section
            id='route-flow'
            className='mt-8 rounded-[30px] border border-zinc-800 bg-black/70 p-5 shadow-xl sm:mt-10 sm:p-6 md:p-8'
          >
            <div className='flex items-center justify-between gap-4'>
              <div>
                <p className='text-xs uppercase tracking-[0.18em] text-zinc-500 sm:text-sm'>
                  Route flow
                </p>
                <h2 className='mt-2 text-2xl font-bold text-white sm:text-3xl'>
                  The route at a glance
                </h2>
              </div>

              <p className='hidden text-sm text-zinc-500 md:block'>
                Understand it before opening the map
              </p>
            </div>

            <div className='mt-8 overflow-x-auto pb-2'>
              <div className='flex min-w-max items-center gap-4'>
                {stops.map((stop, index) =>
                  stop.place ? (
                    <div key={stop.id} className='flex items-center gap-4'>
                      <div className='min-w-[220px] rounded-[24px] border border-zinc-800 bg-zinc-950 p-5'>
                        <div className='flex items-center gap-3'>
                          <span className='flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white'>
                            {index + 1}
                          </span>
                          <div>
                            <p className='text-lg font-semibold text-white'>{stop.place.name}</p>
                            <p className='text-xs text-zinc-500'>
                              {[stop.place.neighborhood, stop.place.borough].filter(Boolean).join(', ')}
                            </p>
                          </div>
                        </div>

                        <div className='mt-4 flex flex-wrap gap-2'>
                          {typeof stop.place.cheapest_slice_price === 'number' ? (
                            <MetaPill>${stop.place.cheapest_slice_price} slice</MetaPill>
                          ) : null}
                          {stop.place.is_best_under_5 ? <MetaPill>Best under $5</MetaPill> : null}
                          {stop.place.is_best_under_10 ? <MetaPill>Best under $10</MetaPill> : null}
                        </div>
                      </div>

                      {index < stops.length - 1 ? (
                        <div className='flex min-w-[110px] flex-col items-center gap-2 px-1 text-zinc-500'>
                          <div className='flex items-center gap-2'>
                            <div className='h-[2px] w-10 bg-red-500/60' />
                            <span>→</span>
                          </div>
                          <span className='text-xs text-zinc-400'>
                            {segmentTimes[index]?.minutes ?? '—'} min walk
                          </span>
                        </div>
                      ) : null}
                    </div>
                  ) : null
                )}
              </div>
            </div>
          </section>

          <section
            id='stops'
            className='mt-8 rounded-[30px] border border-zinc-800 bg-black/70 p-5 shadow-xl sm:mt-10 sm:p-6 md:p-8'
          >
            <div className='flex items-center justify-between gap-4'>
              <div>
                <p className='text-xs uppercase tracking-[0.18em] text-zinc-500 sm:text-sm'>
                  Stop timeline
                </p>
                <h2 className='mt-2 text-2xl font-bold text-white sm:text-3xl'>
                  Follow the route
                </h2>
              </div>

              <p className='hidden text-sm text-zinc-500 md:block'>
                Why each stop matters
              </p>
            </div>

            <div className='relative mt-8 sm:mt-10'>
              <div className='absolute left-[18px] top-0 hidden h-full w-px bg-red-500/30 md:block' />

              <div className='space-y-6 sm:space-y-8'>
                {stops.map((stop, index) =>
                  stop.place ? (
                    <div
                      key={stop.id}
                      className='relative rounded-[28px] border border-zinc-800 bg-zinc-950/70 p-5 sm:p-6 md:ml-12'
                    >
                      <div className='absolute -left-[58px] top-6 hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white'>
                        {index + 1}
                      </div>

                      <div className='flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between'>
                        <div className='max-w-3xl'>
                          <div className='flex flex-wrap items-center gap-3'>
                            <span className='inline-flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white md:hidden'>
                              {index + 1}
                            </span>
                            <h3 className='text-2xl font-bold text-white'>
                              {stop.place.name}
                            </h3>
                          </div>

                          <p className='mt-2 text-sm text-zinc-500'>
                            {[stop.place.neighborhood, stop.place.borough].filter(Boolean).join(', ')}
                          </p>

                          <div className='mt-4 flex flex-wrap gap-2'>
                            {typeof stop.place.cheapest_slice_price === 'number' ? (
                              <MetaPill>Cheapest slice: ${stop.place.cheapest_slice_price}</MetaPill>
                            ) : null}
                            {typeof stop.place.whole_pie_price === 'number' ? (
                              <MetaPill>Whole pie: ${stop.place.whole_pie_price}</MetaPill>
                            ) : null}
                            {stop.place.is_best_under_5 ? <MetaPill>Best under $5</MetaPill> : null}
                            {stop.place.is_best_under_10 ? <MetaPill>Best under $10</MetaPill> : null}
                          </div>

                          {stop.place.best_known_for ? (
                            <div className='mt-5'>
                              <p className='text-xs uppercase tracking-[0.18em] text-zinc-500'>
                                Best known for
                              </p>
                              <p className='mt-2 text-lg text-zinc-200'>
                                {stop.place.best_known_for}
                              </p>
                            </div>
                          ) : null}

                          <div className='mt-5 grid gap-4 md:grid-cols-2'>
                            <div className='rounded-2xl border border-zinc-800 bg-black/40 p-4'>
                              <p className='text-xs uppercase tracking-[0.18em] text-zinc-500'>
                                Why this stop
                              </p>
                              <p className='mt-2 text-sm leading-7 text-zinc-300'>
                                {stop.stop_note ||
                                  'A strong stop in the route progression, chosen for value, flavor and route flow.'}
                              </p>
                            </div>

                            <div className='rounded-2xl border border-zinc-800 bg-black/40 p-4'>
                              <p className='text-xs uppercase tracking-[0.18em] text-zinc-500'>
                                What to order
                              </p>
                              <p className='mt-2 text-sm leading-7 text-zinc-300'>
                                {stop.place.best_known_for
                                  ? stop.place.best_known_for
                                  : 'Start with the classic slice and keep the route moving.'}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className='flex flex-wrap gap-2 lg:w-[180px] lg:flex-col'>
                          <Link
                            href={`/places/${stop.place.slug}`}
                            className='inline-flex items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-medium text-black transition hover:opacity-90'
                          >
                            View place
                          </Link>

                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${stop.place.name} ${stop.place.neighborhood || ''} ${stop.place.borough || ''}`
                            )}`}
                            target='_blank'
                            rel='noreferrer'
                            className='inline-flex items-center justify-center rounded-2xl border border-zinc-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-zinc-900'
                          >
                            Google Maps
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            </div>
          </section>

          <section
            id='route-map'
            className='mt-8 rounded-[30px] border border-zinc-800 bg-black/70 p-5 shadow-xl sm:mt-10 sm:p-6 md:p-8'
          >
            <div className='mb-6 flex items-center justify-between gap-4'>
              <div>
                <p className='text-xs uppercase tracking-[0.18em] text-zinc-500 sm:text-sm'>
                  Route map
                </p>
                <h2 className='mt-2 text-2xl font-bold text-white sm:text-3xl'>
                  Open the map when you need it
                </h2>
              </div>

              <p className='hidden text-sm text-zinc-500 md:block'>
                Numbered stops connected in order
              </p>
            </div>

            <RouteMap stops={stops} />
          </section>

          <section className='mt-8 rounded-[30px] border border-zinc-800 bg-[linear-gradient(180deg,rgba(80,10,10,0.12),rgba(0,0,0,0.92))] p-6 shadow-xl sm:mt-10 sm:p-8'>
            <p className='text-sm uppercase tracking-[0.18em] text-red-400'>
              Final read
            </p>
            <h2 className='mt-3 text-2xl font-bold text-white sm:text-3xl'>
              Why this route works
            </h2>
            <p className='mt-4 max-w-3xl text-base leading-8 text-zinc-300 sm:text-lg'>
              This route is designed to feel intentional, not random: a clean progression through NYC pizza with stops that each bring a different kind of payoff.
            </p>

            <div className='mt-8 grid gap-4 md:grid-cols-3'>
              <SummaryCard label='Best for' value={routeMood} />
              <SummaryCard label='Ideal moment' value='Afternoon / evening' />
              <SummaryCard
                label='Budget feel'
                value={totalSliceSpend > 0 && totalSliceSpend <= 15 ? 'Low' : 'Medium'}
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
