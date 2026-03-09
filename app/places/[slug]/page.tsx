import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AppHeader } from '@/components/layout/app-header'
import { createPublicClient } from '@/lib/supabase/public'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { PlaceDetailTabs } from '@/components/places/place-detail-tabs'
import { savePlace, unsavePlace } from '@/lib/actions/profile'

function InfoBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className='inline-flex rounded-full border border-red-900/50 bg-[rgba(111,74,74,0.12)] px-3 py-1 text-xs font-semibold text-red-200'>
      {children}
    </div>
  )
}

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
  let isSaved = false

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

      const { data: savedRow } = await authSupabase
        .from('user_saved_places')
        .select('user_id')
        .eq('user_id', user.id)
        .eq('place_id', place.id)
        .maybeSingle()

      isSaved = !!savedRow
    }
  } catch {
    userId = undefined
    userRating = 0
    isSaved = false
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

      <div className='min-h-screen bg-[linear-gradient(180deg,rgba(42,12,12,0.28),rgba(0,0,0,0.96)_28%)]'>
        <div className='mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8'>
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

          <div className='rounded-[30px] border border-[#25262b] bg-black/80 shadow-2xl'>
            <div className='p-6 sm:p-8'>
              <div className='mb-5 flex items-center justify-between gap-4'>
                <Link
                  href='/explorar'
                  className='rounded-xl border border-[#34343a] px-4 py-2 text-sm text-white transition hover:bg-[#17181b]'
                >
                  Back
                </Link>

                <div className='flex items-center gap-3'>
                  {!userId ? (
                    <Link
                      href='/login'
                      className='rounded-xl border border-[#34343a] px-4 py-2 text-sm text-white transition hover:bg-[#17181b]'
                    >
                      Sign in
                    </Link>
                  ) : isSaved ? (
                    <form action={unsavePlace}>
                      <input type='hidden' name='place_id' value={place.id} />
                      <input type='hidden' name='slug' value={slug} />
                      <button
                        type='submit'
                        className='rounded-xl border border-[#34343a] bg-[#17181b] px-4 py-2 text-sm text-white transition hover:bg-[#202226]'
                      >
                        Saved
                      </button>
                    </form>
                  ) : (
                    <form action={savePlace}>
                      <input type='hidden' name='place_id' value={place.id} />
                      <input type='hidden' name='slug' value={slug} />
                      <button
                        type='submit'
                        className='rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:opacity-90'
                      >
                        Save
                      </button>
                    </form>
                  )}
                </div>
              </div>

              <div className='flex flex-wrap gap-2'>
                <InfoBadge>{place.pizza_style || 'Classic NY Slice'}</InfoBadge>
                {place.is_best_under_5 ? <InfoBadge>Best under $5</InfoBadge> : null}
                {place.is_best_under_10 ? <InfoBadge>Best under $10</InfoBadge> : null}
                {place.is_late_night ? <InfoBadge>Late night</InfoBadge> : null}
                {place.is_worth_the_trip ? <InfoBadge>Worth the trip</InfoBadge> : null}
                {place.is_first_timer_friendly ? <InfoBadge>First-timer friendly</InfoBadge> : null}
              </div>

              <h1 className='mt-5 text-5xl font-bold tracking-tight text-white'>
                {place.name}
              </h1>

              <p className='mt-3 text-xl text-zinc-300'>
                ⊙ {[place.neighborhood, place.borough].filter(Boolean).join(', ')}
              </p>

              <div className='mt-8 flex flex-wrap items-center gap-6 border-b border-[#25262b] pb-8'>
                <div className='inline-flex items-center gap-3 rounded-2xl bg-[rgba(111,74,74,0.30)] px-4 py-3'>
                  <span className='text-xl text-red-300'>★</span>
                  <span className='text-2xl font-bold text-red-200'>
                    {averageRating}
                  </span>
                </div>

                <p className='text-lg text-zinc-400'>
                  {reviewCount} ratings
                </p>

                <p className='text-2xl tracking-[0.18em] text-zinc-200'>
                  {typeof place.cheapest_slice_price === 'number'
                    ? `$${place.cheapest_slice_price}`
                    : place.price_range || '$'}
                </p>
              </div>

              <div className='mt-8 rounded-[28px] border border-[#25262b] bg-[#121316]'>
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
      </div>
    </main>
  )
}
