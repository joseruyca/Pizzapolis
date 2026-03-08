import { PlacesList } from '@/components/places/places-list'

type Place = {
  id: string
  slug: string
  name: string
  borough: string | null
  address: string | null
  description: string | null
  price_range: string | null
  style_tags: string[] | null
  average_rating: number | null
  review_count: number | null
  hero_image_url?: string | null
}

export function PlaceListDrawer({
  places,
  resultsCount,
}: {
  places: Place[]
  resultsCount: number
}) {
  return (
    <aside className='h-full rounded-3xl border border-zinc-800 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur'>
      <div className='mb-4 flex items-center justify-between gap-4'>
        <div>
          <p className='text-xs uppercase tracking-[0.2em] text-zinc-500'>Places</p>
          <h2 className='mt-1 text-xl font-semibold text-white'>
            {resultsCount} result{resultsCount === 1 ? '' : 's'}
          </h2>
        </div>
      </div>

      <div className='max-h-[calc(100vh-260px)] overflow-y-auto pr-1'>
        <PlacesList places={places} />
      </div>
    </aside>
  )
}
