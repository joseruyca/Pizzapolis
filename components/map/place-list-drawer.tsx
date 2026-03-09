import { PlacesList } from '@/components/places/places-list'

type Place = {
  id: string
  slug: string
  name: string
  borough: string | null
  neighborhood?: string | null
  address: string | null
  description: string | null
  price_range: string | null
  style_tags: string[] | null
  average_rating: number | null
  review_count: number | null
  cheapest_slice_price?: number | null
  pizza_style?: string | null
  best_known_for?: string | null
  is_best_under_5?: boolean | null
  is_best_under_10?: boolean | null
  distance_km?: number | null
}

function toMiles(km: number) {
  return km * 0.621371
}

export function PlaceListDrawer({
  places,
  resultsCount,
}: {
  places: Place[]
  resultsCount: number
}) {
  return (
    <aside className='h-full rounded-[32px] border border-[#2a2a2f] bg-[#16171b]/96 p-4 shadow-2xl backdrop-blur'>
      <div className='mb-4 flex items-center justify-between gap-4'>
        <div>
          <p className='text-xs uppercase tracking-[0.2em] text-zinc-500'>Places</p>
          <h2 className='mt-1 text-xl font-semibold text-white'>
            {resultsCount} result{resultsCount === 1 ? '' : 's'}
          </h2>
        </div>
      </div>

      <div className='max-h-[calc(100vh-240px)] overflow-y-auto pr-1'>
        <PlacesList places={places} />
      </div>
    </aside>
  )
}
