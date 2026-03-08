import { createPublicClient } from '@/lib/supabase/public'
import { AppHeader } from '@/components/layout/app-header'
import { SearchFiltersFloating } from '@/components/map/search-filters-floating'
import { ExploreMapShell } from '@/components/map/explore-map-shell'
import { haversineDistanceKm } from '@/lib/geo'

function parseMulti(value?: string) {
  if (!value) return []
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

type PlaceRow = {
  id: string
  slug: string
  name: string
  borough: string | null
  neighborhood: string | null
  address: string | null
  description: string | null
  price_range: string | null
  style_tags: string[] | null
  average_rating: number | null
  review_count: number | null
  latitude: number
  longitude: number
  hero_image_url: string | null
  cheapest_slice_price: number | null
  whole_pie_price: number | null
  value_score: number | null
  is_best_under_5: boolean | null
  is_best_under_10: boolean | null
  pizza_style: string | null
  best_known_for: string | null
  price_updated_at: string | null
  created_at?: string | null
  distance_km?: number | null
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    price?: string
    style?: string
    minRating?: string
    sort?: string
    lat?: string
    lng?: string
    radius?: string
    success?: string
  }>
}) {
  const params = await searchParams
  const supabase = createPublicClient()

  const prices = parseMulti(params.price)
  const styles = parseMulti(params.style)

  let query = supabase
    .from('places')
    .select(
      'id, slug, name, borough, neighborhood, address, description, price_range, style_tags, average_rating, review_count, latitude, longitude, hero_image_url, cheapest_slice_price, whole_pie_price, value_score, is_best_under_5, is_best_under_10, pizza_style, best_known_for, price_updated_at, created_at'
    )

  if (params.q) {
    query = query.or(`name.ilike.%${params.q}%,neighborhood.ilike.%${params.q}%`)
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

  const { data, error } = await query
  let safePlaces = (data ?? []) as PlaceRow[]

  const lat = params.lat ? Number(params.lat) : NaN
  const lng = params.lng ? Number(params.lng) : NaN
  const radiusKm = params.radius ? Number(params.radius) : 3

  const hasLocation = !Number.isNaN(lat) && !Number.isNaN(lng)

  if (hasLocation) {
    safePlaces = safePlaces
      .map((place) => ({
        ...place,
        distance_km: haversineDistanceKm(lat, lng, place.latitude, place.longitude),
      }))
      .filter((place) => (place.distance_km ?? 999999) <= radiusKm)
  }

  if (params.sort === 'top-rated') {
    safePlaces = [...safePlaces].sort(
      (a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0)
    )
  } else if (params.sort === 'cheapest') {
    safePlaces = [...safePlaces].sort(
      (a, b) => (a.cheapest_slice_price ?? 999999) - (b.cheapest_slice_price ?? 999999)
    )
  } else if (params.sort === 'newest') {
    safePlaces = [...safePlaces].sort((a, b) =>
      new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
    )
  } else if (params.sort === 'nearest' && hasLocation) {
    safePlaces = [...safePlaces].sort(
      (a, b) => (a.distance_km ?? 999999) - (b.distance_km ?? 999999)
    )
  } else {
    safePlaces = [...safePlaces].sort(
      (a, b) => (b.average_rating ?? 0) - (a.average_rating ?? 0)
    )
  }

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
          <SearchFiltersFloating q={params.q} price={params.price} />
        </div>

        <ExploreMapShell
          places={safePlaces}
          q={params.q}
          price={params.price}
          style={params.style}
          minRating={params.minRating}
          sort={params.sort}
          lat={params.lat}
          lng={params.lng}
          radius={params.radius}
        />
      </div>
    </main>
  )
}
