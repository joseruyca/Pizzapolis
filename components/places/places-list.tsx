import Link from 'next/link'

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

export function PlacesList({ places }: { places: Place[] }) {
  if (!places.length) {
    return (
      <div className='rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-300'>
        <h2 className='text-lg font-semibold text-white'>No places found</h2>
        <p className='mt-2 text-sm text-zinc-400'>
          Try changing your filters or add a new pizza spot.
        </p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {places.map((place) => (
        <Link
          key={place.id}
          href={`/places/${place.slug}`}
          className='block overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 transition hover:border-zinc-600 hover:bg-zinc-900/90'
        >
          <article className='grid md:grid-cols-[220px_1fr]'>
            <div className='relative min-h-[180px] bg-zinc-950'>
              {place.hero_image_url ? (
                <img
                  src={place.hero_image_url}
                  alt={place.name}
                  className='h-full w-full object-cover'
                />
              ) : (
                <div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 via-zinc-900 to-black text-sm text-zinc-500'>
                  No image yet
                </div>
              )}
            </div>

            <div className='p-5'>
              <div className='flex items-start justify-between gap-4'>
                <div className='min-w-0'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <h2 className='text-xl font-semibold text-white'>{place.name}</h2>
                    {place.price_range ? (
                      <span className='rounded-full border border-zinc-700 px-2.5 py-1 text-[11px] text-zinc-300'>
                        {place.price_range}
                      </span>
                    ) : null}
                  </div>

                  <p className='mt-1 text-sm text-zinc-400'>
                    {[place.borough, place.address].filter(Boolean).join(' · ')}
                  </p>
                </div>

                <div className='shrink-0 rounded-2xl bg-zinc-950 px-3 py-2 text-right'>
                  <p className='text-[11px] uppercase tracking-wide text-zinc-500'>
                    Rating
                  </p>
                  <p className='text-sm font-semibold text-white'>
                    {place.average_rating ?? 0} <span className='text-zinc-500'>({place.review_count ?? 0})</span>
                  </p>
                </div>
              </div>

              {place.description ? (
                <p className='mt-4 line-clamp-3 text-sm leading-6 text-zinc-300'>
                  {place.description}
                </p>
              ) : null}

              <div className='mt-4 flex flex-wrap gap-2'>
                {place.style_tags?.map((tag) => (
                  <span
                    key={tag}
                    className='rounded-full bg-zinc-950 px-3 py-1 text-xs text-zinc-300'
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className='mt-5 flex items-center justify-between'>
                <span className='text-xs uppercase tracking-wide text-zinc-500'>
                  Open details
                </span>
                <span className='text-sm font-medium text-white'>View place →</span>
              </div>
            </div>
          </article>
        </Link>
      ))}
    </div>
  )
}
