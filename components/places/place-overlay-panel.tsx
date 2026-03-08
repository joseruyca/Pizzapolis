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

export function PlaceOverlayPanel({ place }: { place?: Place | null }) {
  if (!place) return null

  return (
    <div className='overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/95 shadow-2xl backdrop-blur'>
      <div className='h-36 bg-zinc-900'>
        {place.hero_image_url ? (
          <img
            src={place.hero_image_url}
            alt={place.name}
            className='h-full w-full object-cover'
          />
        ) : (
          <div className='flex h-full items-center justify-center bg-gradient-to-br from-zinc-800 via-zinc-900 to-black text-sm text-zinc-500'>
            No image yet
          </div>
        )}
      </div>

      <div className='p-4'>
        <div className='flex items-start justify-between gap-3'>
          <div>
            <h3 className='text-lg font-semibold text-white'>{place.name}</h3>
            <p className='mt-1 text-sm text-zinc-400'>
              {[place.borough, place.address].filter(Boolean).join(' · ')}
            </p>
          </div>

          {place.price_range ? (
            <span className='rounded-full border border-zinc-700 px-2.5 py-1 text-xs text-zinc-300'>
              {place.price_range}
            </span>
          ) : null}
        </div>

        {place.description ? (
          <p className='mt-3 line-clamp-3 text-sm leading-6 text-zinc-300'>
            {place.description}
          </p>
        ) : null}

        <div className='mt-4 flex items-center justify-between'>
          <p className='text-sm text-zinc-400'>
            Rating: {place.average_rating ?? 0} ({place.review_count ?? 0})
          </p>

          <Link
            href={`/places/${place.slug}`}
            className='rounded-xl bg-white px-3 py-2 text-sm font-medium text-black transition hover:opacity-90'
          >
            View
          </Link>
        </div>
      </div>
    </div>
  )
}
