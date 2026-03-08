import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AppHeader } from '@/components/layout/app-header'
import { createPublicClient } from '@/lib/supabase/public'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { PlaceDetailTabs } from '@/components/places/place-detail-tabs'
import { getRelativeTimeLabel } from '@/lib/time'

export default async function PlaceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const { slug } = await params
  const queryParams = await searchParams

  const supabase = createPublicClient()

  const { data: place, error } = await supabase
    .from('places')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !place) {
    notFound()
  }

  const { data: allReviews } = await supabase
    .from('reviews')
    .select('id, overall_rating, comment, created_at, user_id')
    .eq('place_id', place.id)
    .order('created_at', { ascending: false })

  const { data: comments } = await supabase
    .from('comments')
    .select('id, body, created_at, user_id')
    .eq('place_id', place.id)
    .order('created_at', { ascending: false })

  const { data: photos } = await supabase
    .from('photos')
    .select('id, image_url, caption')
    .eq('place_id', place.id)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  let userId: string | undefined
  let userRating = 0

  try {
    const authSupabase = await createServerSupabase()
    const {
      data: { user },
      error: userError,
    } = await authSupabase.auth.getUser()

    if (!userError && user) {
      userId = user.id

      const { data: myReview } = await authSupabase
        .from('reviews')
        .select('overall_rating')
        .eq('place_id', place.id)
        .eq('user_id', user.id)
        .maybeSingle()

      if (myReview?.overall_rating) {
        userRating = myReview.overall_rating
      }
    }
  } catch {
    userId = undefined
    userRating = 0
  }

  const reviews = allReviews ?? []
  const reviewCount = reviews.length
  const averageRating =
    reviewCount > 0
      ? Number(
          (
            reviews.reduce((sum, item) => sum + (item.overall_rating || 0), 0) / reviewCount
          ).toFixed(1)
        )
      : place.average_rating ?? 0

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    place.address || `${place.name} ${place.neighborhood || ''} ${place.borough || ''}`
  )}`

  return (
    <main className='min-h-screen bg-black text-white'>
      <AppHeader />

      <div className='min-h-screen bg-[linear-gradient(180deg,rgba(60,0,0,0.42),rgba(0,0,0,0.96)_28%)]'>
        <div className='mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8'>
          {queryParams.success ? (
            <div className='mb-4 rounded-2xl border border-emerald-900 bg-emerald-950 p-4 text-emerald-200'>
              {queryParams.success}
            </div>
          ) : null}

          {queryParams.error ? (
            <div className='mb-4 rounded-2xl border border-red-900 bg-red-950 p-4 text-red-200'>
              {queryParams.error}
            </div>
          ) : null}

          <div className='rounded-[30px] border border-zinc-800 bg-black/80 shadow-2xl'>
            <div className='p-6 sm:p-8'>
              <div className='mb-5 flex items-center justify-between gap-4'>
                <Link
                  href='/explorar'
                  className='rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white transition hover:bg-zinc-900'
                >
                  Back
                </Link>

                {!userId ? (
                  <Link
                    href='/login'
                    className='rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white transition hover:bg-zinc-900'
                  >
                    Sign in
                  </Link>
                ) : null}
              </div>

              <div className='flex flex-wrap gap-2'>
                <div className='inline-flex rounded-lg border border-red-900/60 bg-[rgba(120,10,10,0.15)] px-3 py-1 text-xs font-medium text-zinc-200'>
                  {place.pizza_style || 'Classic NY Slice'}
                </div>

                {place.is_best_under_5 ? (
                  <div className='inline-flex rounded-full border border-red-900/60 bg-[rgba(120,10,10,0.15)] px-3 py-1 text-xs font-semibold text-red-300'>
                    Best under $5
                  </div>
                ) : null}

                {place.is_best_under_10 ? (
                  <div className='inline-flex rounded-full border border-red-900/60 bg-[rgba(120,10,10,0.15)] px-3 py-1 text-xs font-semibold text-red-300'>
                    Best under $10
                  </div>
                ) : null}
              </div>

              <h1 className='mt-5 text-5xl font-bold tracking-tight text-white'>
                {place.name}
              </h1>

              <p className='mt-3 text-xl text-zinc-300'>
                ⊙ {[place.neighborhood, place.borough].filter(Boolean).join(', ')}
              </p>

              <div className='mt-8 flex flex-wrap items-center gap-6 border-b border-zinc-800 pb-8'>
                <div className='inline-flex items-center gap-3 rounded-2xl bg-[rgba(120,10,10,0.35)] px-4 py-3'>
                  <span className='text-xl text-red-400'>★</span>
                  <span className='text-2xl font-bold text-red-300'>
                    {averageRating}
                  </span>
                </div>

                <p className='text-lg text-zinc-400'>
                  {reviewCount} ratings
                </p>

                <p className='text-2xl tracking-[0.25em] text-zinc-300'>
                  {typeof place.cheapest_slice_price === 'number'
                    ? `$${place.cheapest_slice_price}`
                    : place.price_range || '$'}
                </p>
              </div>

              <div className='mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
                <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-5'>
                  <p className='text-xs uppercase tracking-[0.18em] text-zinc-500'>
                    Cheapest slice
                  </p>
                  <p className='mt-3 text-2xl font-bold text-white'>
                    {typeof place.cheapest_slice_price === 'number'
                      ? `$${place.cheapest_slice_price}`
                      : '—'}
                  </p>
                </div>

                <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-5'>
                  <p className='text-xs uppercase tracking-[0.18em] text-zinc-500'>
                    Whole pie
                  </p>
                  <p className='mt-3 text-2xl font-bold text-white'>
                    {typeof place.whole_pie_price === 'number'
                      ? `$${place.whole_pie_price}`
                      : '—'}
                  </p>
                </div>

                <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-5'>
                  <p className='text-xs uppercase tracking-[0.18em] text-zinc-500'>
                    Value score
                  </p>
                  <p className='mt-3 text-2xl font-bold text-white'>
                    {typeof place.value_score === 'number'
                      ? `${place.value_score}/10`
                      : '—'}
                  </p>
                </div>

                <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-5'>
                  <p className='text-xs uppercase tracking-[0.18em] text-zinc-500'>
                    Price updated
                  </p>
                  <p className='mt-3 text-base font-medium text-white'>
                    {getRelativeTimeLabel(place.price_updated_at)}
                  </p>
                </div>
              </div>

              <PlaceDetailTabs
                placeId={place.id}
                slug={slug}
                userId={userId}
                comments={comments ?? []}
                photos={photos ?? []}
                bestKnownFor={place.best_known_for}
                description={place.description}
                address={place.address}
                googleMapsUrl={googleMapsUrl}
                hoursText={place.hours_text || 'Mon–Sun 12pm–10pm'}
                userRating={userRating}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
