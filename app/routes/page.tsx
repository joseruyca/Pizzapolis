import Link from 'next/link'
import { AppHeader } from '@/components/layout/app-header'
import { createPublicClient } from '@/lib/supabase/public'

type RouteRow = {
  id: string
  slug: string
  title: string
  subtitle: string | null
  description: string | null
  estimated_minutes: number | null
  borough: string | null
  route_type: string | null
  cover_image_url: string | null
  is_published: boolean
  created_at: string
}

type RouteStopRow = {
  route_id: string
  sort_order: number
  place: {
    name: string
    cheapest_slice_price?: number | null
  } | null
}

function RouteBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className='rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-[11px] text-zinc-200 backdrop-blur'>
      {children}
    </span>
  )
}

function StopPreview({
  stops,
}: {
  stops: { name: string; cheapest_slice_price?: number | null }[]
}) {
  return (
    <div className='mt-5 flex flex-wrap items-center gap-2'>
      {stops.map((stop, index) => (
        <div
          key={`${stop.name}-${index}`}
          className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-2 text-xs text-zinc-200 backdrop-blur'
        >
          <span className='flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white'>
            {index + 1}
          </span>
          <span className='max-w-[120px] truncate'>{stop.name}</span>
        </div>
      ))}
    </div>
  )
}

function RouteCard({
  route,
  stopCount,
  stopPreview,
}: {
  route: RouteRow
  stopCount: number
  stopPreview: { name: string; cheapest_slice_price?: number | null }[]
}) {
  const budgetLabel =
    route.route_type?.toLowerCase().includes('cheap')
      ? 'Under $15'
      : stopCount >= 3
      ? `${stopCount} curated stops`
      : 'Curated route'

  return (
    <Link href={`/routes/${route.slug}`} className='group block'>
      <article className='relative overflow-hidden rounded-[28px] border border-zinc-800 bg-black/70 shadow-xl transition duration-300 hover:-translate-y-0.5 hover:border-zinc-700 hover:shadow-[0_18px_60px_rgba(0,0,0,0.45)]'>
        <div className='relative min-h-[300px] sm:min-h-[320px]'>
          {route.cover_image_url ? (
            <img
              src={route.cover_image_url}
              alt={route.title}
              className='absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]'
            />
          ) : (
            <div className='absolute inset-0 bg-[linear-gradient(180deg,rgba(80,10,10,0.26),rgba(0,0,0,0.95))]' />
          )}

          <div className='absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.06),rgba(0,0,0,0.55)_42%,rgba(0,0,0,0.92))]' />
          <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(239,68,68,0.18),transparent_30%)]' />

          <div className='relative flex min-h-[300px] flex-col justify-end p-5 sm:min-h-[320px] sm:p-6'>
            <div className='flex flex-wrap gap-2'>
              {route.route_type ? <RouteBadge>{route.route_type}</RouteBadge> : null}
              {route.borough ? <RouteBadge>{route.borough}</RouteBadge> : null}
              {route.estimated_minutes ? <RouteBadge>{route.estimated_minutes} min</RouteBadge> : null}
              <RouteBadge>{budgetLabel}</RouteBadge>
            </div>

            <h2 className='mt-4 text-2xl font-bold tracking-tight text-white sm:text-[28px]'>
              {route.title}
            </h2>

            {route.subtitle ? (
              <p className='mt-2 max-w-xl text-sm leading-6 text-zinc-200 sm:text-base'>
                {route.subtitle}
              </p>
            ) : null}

            {stopPreview.length > 0 ? <StopPreview stops={stopPreview} /> : null}

            <div className='mt-5 flex items-center justify-between gap-4'>
              <p className='text-xs text-zinc-400'>
                {stopCount} stop{stopCount === 1 ? '' : 's'}
              </p>

              <div className='inline-flex items-center gap-2 text-sm font-medium text-white'>
                <span>Open route</span>
                <span className='transition group-hover:translate-x-0.5'>→</span>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}

export default async function RoutesPage() {
  const supabase = createPublicClient()

  const { data: routes, error } = await supabase
    .from('pizza_routes')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  const routeIds = (routes ?? []).map((route) => route.id)

  const { data: routeStopsRaw } = routeIds.length
    ? await supabase
        .from('pizza_route_places')
        .select(`
          route_id,
          sort_order,
          place:places (
            name,
            cheapest_slice_price
          )
        `)
        .in('route_id', routeIds)
        .order('sort_order', { ascending: true })
    : { data: [] }

  const routeStops = (routeStopsRaw ?? []) as unknown as RouteStopRow[]

  const groupedStops = new Map<string, RouteStopRow[]>()
  for (const item of routeStops) {
    const current = groupedStops.get(item.route_id) ?? []
    current.push(item)
    groupedStops.set(item.route_id, current)
  }

  return (
    <main className='min-h-screen bg-black text-white'>
      <AppHeader />

      <div className='min-h-screen bg-[linear-gradient(180deg,rgba(60,0,0,0.24),rgba(0,0,0,0.96)_24%)]'>
        <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10'>
          <section className='max-w-4xl'>
            <div className='inline-flex items-center gap-3 rounded-full border border-red-900/60 bg-[rgba(120,10,10,0.18)] px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-red-400 sm:text-sm'>
              <span>⊙</span>
              <span>Pizza Routes</span>
            </div>

            <h1 className='mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl'>
              Curated pizza runs
            </h1>

            <p className='mt-4 max-w-3xl text-base leading-8 text-zinc-300 sm:text-lg md:text-xl'>
              Ready-made pizza itineraries built around budget, mood and neighborhood. Pick one and follow it stop by stop.
            </p>

            <div className='mt-7 flex flex-wrap gap-2'>
              <RouteBadge>Cheap</RouteBadge>
              <RouteBadge>Late Night</RouteBadge>
              <RouteBadge>First-Timers</RouteBadge>
              <RouteBadge>Brooklyn</RouteBadge>
              <RouteBadge>Manhattan</RouteBadge>
              <RouteBadge>90 Minutes</RouteBadge>
            </div>

            <div className='mt-6'>
              <Link
                href='/explorar'
                className='inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white'
              >
                <span>Open general pizza map</span>
                <span>→</span>
              </Link>
            </div>
          </section>

          {error ? (
            <div className='mt-8 rounded-2xl border border-red-900 bg-red-950 p-4 text-red-200'>
              Error loading routes: {error.message}
            </div>
          ) : null}

          <section className='mt-10'>
            <div className='mb-5 flex items-end justify-between gap-4'>
              <div>
                <p className='text-xs uppercase tracking-[0.18em] text-zinc-500 sm:text-sm'>
                  Published routes
                </p>
                <h2 className='mt-2 text-2xl font-bold text-white sm:text-3xl'>
                  Choose a real route
                </h2>
              </div>

              <p className='text-sm text-zinc-500'>
                {(routes ?? []).length} route{(routes ?? []).length === 1 ? '' : 's'}
              </p>
            </div>

            <div className='grid gap-4 sm:gap-6 lg:grid-cols-2'>
              {(routes ?? []).map((route) => {
                const stops = groupedStops.get(route.id) ?? []
                const stopPreview = stops
                  .map((item) => item.place)
                  .filter(Boolean)
                  .slice(0, 3) as { name: string; cheapest_slice_price?: number | null }[]

                return (
                  <RouteCard
                    key={route.id}
                    route={route as RouteRow}
                    stopCount={stops.length}
                    stopPreview={stopPreview}
                  />
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

