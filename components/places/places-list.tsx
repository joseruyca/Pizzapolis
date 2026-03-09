import Link from 'next/link'

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

export function PlacesList({
  places,
}: {
  places: Place[]
}) {
  if (!places.length) {
    return (
      <div className='rounded-3xl border border-[#2a2a2f] bg-[#17181b] p-6 text-zinc-300'>
        <h2 className='text-lg font-semibold text-white'>No places found</h2>
        <p className='mt-2 text-sm text-zinc-400'>
          Try changing your filters or add a new pizza spot.
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-3'>
      {places.map((place) => (
        <Link
          key={place.id}
          href={`/places/${place.slug}`}
          className='block rounded-[24px] border border-[#2a2a2f] bg-[#17181b] p-4 transition hover:border-[#3a3a42] hover:bg-[#1b1c20]'
        >
          <article>
            <div className='flex items-start justify-between gap-4'>
              <div className='min-w-0'>
                <div className='flex flex-wrap items-center gap-2'>
                  <h2 className='truncate text-lg font-semibold text-white'>{place.name}</h2>

                  {place.price_range ? (
                    <span className='rounded-full border border-[#34343a] px-2.5 py-1 text-[11px] text-zinc-300'>
                      {place.price_range}
                    </span>
                  ) : null}
                </div>

                <p className='mt-1 text-sm text-zinc-400'>
                  {[place.neighborhood, place.borough].filter(Boolean).join(' · ') || place.address}
                </p>
              </div>

              <div className='shrink-0 rounded-2xl bg-[#111214] px-3 py-2 text-right'>
                <p className='text-[11px] uppercase tracking-wide text-zinc-500'>Rating</p>
                <p className='text-sm font-semibold text-white'>
                  {place.average_rating ?? 0}{' '}
                  <span className='text-zinc-500'>({place.review_count ?? 0})</span>
                </p>
              </div>
            </div>

            <div className='mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-300'>
              {typeof place.cheapest_slice_price === 'number' ? (
                <span className='rounded-full bg-[#111214] px-3 py-1.5 text-xs text-zinc-200'>
                  ${place.cheapest_slice_price} slice
                </span>
              ) : null}

              {place.pizza_style ? (
                <span className='rounded-full bg-[#111214] px-3 py-1.5 text-xs text-zinc-200'>
                  {place.pizza_style}
                </span>
              ) : null}

              {typeof place.distance_km === 'number' ? (
                <span className='rounded-full bg-[#111214] px-3 py-1.5 text-xs text-zinc-200'>
                  {toMiles(place.distance_km).toFixed(1)} mi
                </span>
              ) : null}
            </div>

            {place.best_known_for ? (
              <p className='mt-3 line-clamp-1 text-sm leading-6 text-zinc-300'>
                {place.best_known_for}
              </p>
            ) : null}

            <div className='mt-4 flex items-center justify-between'>
              <span className='text-xs uppercase tracking-wide text-zinc-500'>
                Open details
              </span>
              <span className='text-sm font-medium text-white'>View place →</span>
            </div>
          </article>
        </Link>
      ))}
    </div>
  )
}
