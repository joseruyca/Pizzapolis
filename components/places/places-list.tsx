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

function getCardTone(place: Place) {
  const style = place.pizza_style?.toLowerCase() || ''

  if (style.includes('sicilian') || style.includes('square')) {
    return {
      line: '#6f88b7',
      priceBg: '#1b2737',
      priceText: '#dce8ff',
      styleBg: '#1d2d42',
      styleText: '#dce7ff',
      cta: '#d7a54a',
      ctaText: '#18140d',
    }
  }

  if (style.includes('artisan') || style.includes('coal')) {
    return {
      line: '#d94b5c',
      priceBg: '#2f1c23',
      priceText: '#ffe0e5',
      styleBg: '#311922',
      styleText: '#ffd9df',
      cta: '#f4ede2',
      ctaText: '#181510',
    }
  }

  if (style.includes('classic') || style.includes('ny')) {
    return {
      line: '#d7a54a',
      priceBg: '#302411',
      priceText: '#ffe6b7',
      styleBg: '#332714',
      styleText: '#ffe8be',
      cta: '#f4ede2',
      ctaText: '#181510',
    }
  }

  return {
    line: '#5b8c8a',
    priceBg: '#17312f',
    priceText: '#daf2ef',
    styleBg: '#183130',
    styleText: '#d5f1ee',
    cta: '#f4ede2',
    ctaText: '#181510',
  }
}

export function PlacesList({
  places,
}: {
  places: Place[]
}) {
  if (!places.length) {
    return (
      <div className='rounded-3xl border border-[#2a3040] bg-[#171922] p-6 text-zinc-300'>
        <h2 className='text-lg font-semibold text-white'>No places found</h2>
        <p className='mt-2 text-sm text-zinc-400'>
          Try changing your filters or add a new pizza spot.
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-3'>
      {places.map((place) => {
        const tone = getCardTone(place)

        return (
          <Link
            key={place.id}
            href={`/places/${place.slug}`}
            className='block overflow-hidden rounded-[24px] border border-[#2a3040] bg-[#171922] transition hover:border-[#3b4358] hover:bg-[#1b1f2a]'
          >
            <article className='relative'>
              <div
                className='absolute inset-y-0 left-0 w-1.5'
                style={{ background: tone.line }}
              />

              <div className='p-4 pl-5'>
                <div className='flex items-start justify-between gap-4'>
                  <div className='min-w-0'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <h2 className='truncate text-lg font-semibold text-white'>{place.name}</h2>

                      {place.price_range ? (
                        <span className='rounded-full border border-[#343b4d] px-2.5 py-1 text-[11px] text-zinc-200'>
                          {place.price_range}
                        </span>
                      ) : null}
                    </div>

                    <p className='mt-1 text-sm text-zinc-400'>
                      {[place.neighborhood, place.borough].filter(Boolean).join(' · ') || place.address}
                    </p>
                  </div>

                  <div className='shrink-0 rounded-2xl bg-[#101218] px-3 py-2 text-right ring-1 ring-white/5'>
                    <p className='text-[11px] uppercase tracking-wide text-zinc-500'>Rating</p>
                    <p className='text-sm font-semibold text-white'>
                      {place.average_rating ?? 0}{' '}
                      <span className='text-zinc-500'>({place.review_count ?? 0})</span>
                    </p>
                  </div>
                </div>

                <div className='mt-3 flex flex-wrap items-center gap-2 text-sm text-zinc-300'>
                  {typeof place.cheapest_slice_price === 'number' ? (
                    <span
                      className='rounded-full px-3 py-1.5 text-xs font-medium'
                      style={{
                        background: tone.priceBg,
                        color: tone.priceText,
                      }}
                    >
                      ${place.cheapest_slice_price} slice
                    </span>
                  ) : null}

                  {place.pizza_style ? (
                    <span
                      className='rounded-full px-3 py-1.5 text-xs font-medium'
                      style={{
                        background: tone.styleBg,
                        color: tone.styleText,
                      }}
                    >
                      {place.pizza_style}
                    </span>
                  ) : null}

                  {typeof place.distance_km === 'number' ? (
                    <span className='rounded-full bg-[#11151d] px-3 py-1.5 text-xs text-zinc-200'>
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
                  <span
                    className='inline-flex rounded-xl px-3.5 py-2 text-sm font-semibold'
                    style={{
                      background: tone.cta,
                      color: tone.ctaText,
                    }}
                  >
                    View place
                  </span>
                </div>
              </div>
            </article>
          </Link>
        )
      })}
    </div>
  )
}
