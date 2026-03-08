import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AppHeader } from '@/components/layout/app-header'
import { createPublicClient } from '@/lib/supabase/public'

type GuidePlace = {
  sort_order: number
  place: {
    id: string
    slug: string
    name: string
    borough: string | null
    neighborhood: string | null
    description: string | null
    price_range: string | null
    cheapest_slice_price: number | null
    average_rating: number | null
    review_count: number | null
    pizza_style: string | null
    best_known_for: string | null
    hero_image_url: string | null
  }
}

function GuidePlaceCard({
  item,
  index,
}: {
  item: GuidePlace
  index: number
}) {
  const place = item.place

  return (
    <Link
      href={`/places/${place.slug}`}
      className='block overflow-hidden rounded-[28px] border border-zinc-800 bg-black/70 transition hover:border-zinc-700 hover:bg-zinc-900/60'
    >
      <div className='grid gap-0 md:grid-cols-[220px_1fr]'>
        <div className='min-h-[180px] bg-zinc-950'>
          {place.hero_image_url ? (
            <img
              src={place.hero_image_url}
              alt={place.name}
              className='h-full w-full object-cover'
            />
          ) : (
            <div className='flex h-full w-full items-center justify-center bg-[linear-gradient(180deg,rgba(70,10,10,0.20),rgba(0,0,0,0.92))] text-zinc-500'>
              No image
            </div>
          )}
        </div>

        <div className='p-6'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <p className='text-sm uppercase tracking-[0.18em] text-red-400'>
                #{index + 1}
              </p>
              <h2 className='mt-2 text-2xl font-bold text-white'>{place.name}</h2>
              <p className='mt-2 text-sm text-zinc-400'>
                {[place.neighborhood, place.borough].filter(Boolean).join(', ')}
              </p>
            </div>

            <div className='text-right'>
              {typeof place.cheapest_slice_price === 'number' ? (
                <p className='text-lg font-semibold text-white'>${place.cheapest_slice_price}</p>
              ) : null}
              <p className='mt-1 text-sm text-zinc-500'>{place.price_range || ''}</p>
            </div>
          </div>

          {place.pizza_style ? (
            <div className='mt-4 inline-flex rounded-lg border border-red-900/60 bg-[rgba(120,10,10,0.15)] px-3 py-1 text-xs font-medium text-zinc-200'>
              {place.pizza_style}
            </div>
          ) : null}

          {place.best_known_for ? (
            <p className='mt-4 text-base font-medium text-zinc-200'>
              Best known for: <span className='text-white'>{place.best_known_for}</span>
            </p>
          ) : null}

          {place.description ? (
            <p className='mt-4 line-clamp-3 text-sm leading-7 text-zinc-400'>
              {place.description}
            </p>
          ) : null}

          <div className='mt-5 flex items-center justify-between'>
            <p className='text-sm text-zinc-400'>
              ★ {place.average_rating ?? 0} · {place.review_count ?? 0} ratings
            </p>

            <span className='text-sm font-medium text-white'>
              View place →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = createPublicClient()

  const { data: guide, error: guideError } = await supabase
    .from('guides')
    .select('id, slug, title, subtitle, description, cover_image_url, is_published')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (guideError || !guide) {
    notFound()
  }

  const { data: guidePlaces, error: placesError } = await supabase
    .from('guide_places')
    .select(`
      sort_order,
      place:places (
        id,
        slug,
        name,
        borough,
        neighborhood,
        description,
        price_range,
        cheapest_slice_price,
        average_rating,
        review_count,
        pizza_style,
        best_known_for,
        hero_image_url
      )
    `)
    .eq('guide_id', guide.id)
    .order('sort_order', { ascending: true })

  return (
    <main className='min-h-screen bg-black text-white'>
      <AppHeader />

      <div className='min-h-screen bg-[linear-gradient(180deg,rgba(60,0,0,0.34),rgba(0,0,0,0.96)_30%)]'>
        <div className='mx-auto max-w-6xl px-6 py-10'>
          <Link
            href='/guides'
            className='inline-flex rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white transition hover:bg-zinc-900'
          >
            Back to guides
          </Link>

          <div className='mt-8 rounded-[32px] border border-zinc-800 bg-black/70 p-8 shadow-2xl'>
            <p className='text-sm uppercase tracking-[0.22em] text-red-400'>Guide</p>
            <h1 className='mt-4 text-5xl font-bold tracking-tight'>{guide.title}</h1>

            {guide.subtitle ? (
              <p className='mt-5 text-2xl text-zinc-300'>{guide.subtitle}</p>
            ) : null}

            {guide.description ? (
              <p className='mt-6 max-w-3xl text-lg leading-8 text-zinc-400'>
                {guide.description}
              </p>
            ) : null}
          </div>

          {placesError ? (
            <div className='mt-8 rounded-2xl border border-red-900 bg-red-950 p-4 text-red-200'>
              Error loading guide places: {placesError.message}
            </div>
          ) : null}

          <div className='mt-10 space-y-6'>
            {(guidePlaces ?? []).map((item, index) => (
              <GuidePlaceCard
                key={`${item.sort_order}-${(item.place as { slug: string }).slug}`}
                item={item as GuidePlace}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
