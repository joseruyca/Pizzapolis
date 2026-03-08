import { createPublicClient } from '@/lib/supabase/public'
import { AppHeader } from '@/components/layout/app-header'
import { SearchFiltersFloating } from '@/components/map/search-filters-floating'
import { ExploreMapShell } from '@/components/map/explore-map-shell'

function parseMulti(value?: string) {
  if (!value) return []
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    borough?: string
    price?: string
    style?: string
    minRating?: string
    sort?: string
    success?: string
  }>
}) {
  const params = await searchParams
  const supabase = createPublicClient()

  const boroughs = parseMulti(params.borough)
  const prices = parseMulti(params.price)
  const styles = parseMulti(params.style)

  let query = supabase
    .from('places')
    .select(
      'id, slug, name, borough, neighborhood, address, description, price_range, style_tags, average_rating, review_count, latitude, longitude, hero_image_url, cheapest_slice_price, pizza_style, best_known_for'
    )

  if (params.q) {
    query = query.or(`name.ilike.%${params.q}%,neighborhood.ilike.%${params.q}%`)
  }

  if (boroughs.length) {
    query = query.in('borough', boroughs)
  }

  if (prices.length) {
    query = query.in('price_range', prices)
  }

  if (styles.length) {
    query = query.in('pizza_style', styles)
  }

  if (params.minRating) {
    query = query.gte('average_rating', Number(params.minRating))
  }

  if (params.sort === 'top-rated') {
    query = query.order('average_rating', { ascending: false })
  } else if (params.sort === 'cheapest') {
    query = query.order('cheapest_slice_price', { ascending: true })
  } else if (params.sort === 'newest') {
    query = query.order('created_at', { ascending: false })
  } else {
    query = query.order('average_rating', { ascending: false })
  }

  const { data: places, error } = await query
  const safePlaces = places ?? []

  return (
    <main className='min-h-screen bg-zinc-950 text-white'>
      <AppHeader />

      <div className='mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8'>
        {params.success ? (
          <div className='mb-4 rounded-2xl border border-emerald-900 bg-emerald-950 p-4 text-emerald-200'>
            {params.success}
          </div>
        ) : null}

        {error ? (
          <div className='mb-4 rounded-2xl border border-red-900 bg-red-950 p-4 text-red-200'>
            Error loading places: {error.message}
          </div>
        ) : null}

        <div className='mb-4 hidden lg:block'>
          <SearchFiltersFloating
            q={params.q}
            borough={params.borough}
            price={params.price}
          />
        </div>

        <ExploreMapShell
          places={safePlaces}
          q={params.q}
          borough={params.borough}
          price={params.price}
          style={params.style}
          minRating={params.minRating}
          sort={params.sort}
        />
      </div>
    </main>
  )
}
