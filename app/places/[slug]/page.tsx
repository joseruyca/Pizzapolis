import Link from 'next/link'
import { notFound } from 'next/navigation'
import { AppHeader } from '@/components/layout/app-header'
import { createPublicClient } from '@/lib/supabase/public'
import { createClient as createServerSupabase } from '@/lib/supabase/server'
import { PlaceDetailTabs } from '@/components/places/place-detail-tabs'
import { savePlace, unsavePlace } from '@/lib/actions/profile'

function InfoBadge({
  children,
  tone = 'default',
}: {
  children: React.ReactNode
  tone?: 'default' | 'gold' | 'red' | 'teal'
}) {
  const tones = {
    default: 'border-[#34384a] bg-[#171b24] text-[#dbe3f5]',
    gold: 'border-[#4a3a20] bg-[#2f2615] text-[#ffe2a6]',
    red: 'border-[#4f2830] bg-[#311922] text-[#ffd9df]',
    teal: 'border-[#254746] bg-[#183130] text-[#d5f1ee]',
  }

  return (
    <div className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold ${tones[tone]}`}>
      {children}
    </div>
  )
}

function MiniStat({
  label,
  value,
  accent = 'default',
}: {
  label: string
  value: React.ReactNode
  accent?: 'default' | 'gold' | 'red'
}) {
  const accents = {
    default: 'bg-[#141925] border-[#263047] text-white',
    gold: 'bg-[#2f2615] border-[#4a3a20] text-[#ffe2a6]',
    red: 'bg-[#311922] border-[#4f2830] text-[#ffd9df]',
  }

  return (
    <div className={`rounded-2xl border px-4 py-3 ${accents[accent]}`}>
      <p className='text-[10px] uppercase tracking-[0.18em] text-[#7b8497]'>{label}</p>
      <div className='mt-1.5 text-xl font-bold'>{value}</div>
    </div>
  )
}

function QuickFactCompact({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className='rounded-2xl border border-[#2a3040] bg-[#141821] px-4 py-3'>
      <p className='text-[10px] uppercase tracking-[0.18em] text-[#7b8497]'>{label}</p>
      <p className='mt-1.5 text-sm font-medium text-[#f4f1ea]'>{value}</p>
    </div>
  )
}

type SimilarPlace = {
  id: string
  slug: string
  name: string
  borough: string | null
  neighborhood: string | null
  pizza_style: string | null
  cheapest_slice_price: number | null
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

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001'}/places/${slug}`

  const similarFilters = [
    place.borough ? `borough.eq.${place.borough}` : null,
    place.pizza_style ? `pizza_style.eq.${place.pizza_style}` : null,
  ].filter(Boolean)

  let similarPlaces: SimilarPlace[] = []
  if (similarFilters.length > 0) {
    const { data: similarPlacesRaw } = await supabase
      .from('places')
      .select('id, slug, name, borough, neighborhood, pizza_style, cheapest_slice_price')
      .neq('id', place.id)
      .or(similarFilters.join(','))
      .limit(4)

    similarPlaces = (similarPlacesRaw ?? []) as SimilarPlace[]
  }

  return (
    <main className='min-h-screen bg-[#09090b] text-white'>
      <AppHeader />

      <div className='min-h-screen bg-[linear-gradient(180deg,rgba(217,75,92,0.08),rgba(0,0,0,0.96)_30%)]'>
        <div className='mx-auto max-w-6xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8'>
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

          <div className='overflow-hidden rounded-[28px] border border-[#2a3040] bg-[#0f1014]/95 shadow-[0_20px_80px_rgba(0,0,0,0.45)]'>
            <div className='border-b border-[#2a3040] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0))] px-4 py-4 sm:px-6 sm:py-6 lg:px-8'>
              <div className='mb-4 flex items-center justify-between gap-3'>
                <Link
                  href='/explorar'
                  className='rounded-xl border border-[#34384a] bg-[#151821] px-3 py-2 text-sm text-white transition hover:bg-[#1a1f2b]'
                >
                  Back
                </Link>

                <div className='flex items-center gap-2'>
                  {!userId ? (
                    <Link
                      href='/login'
                      className='rounded-xl border border-[#34384a] bg-[#151821] px-3 py-2 text-sm text-white transition hover:bg-[#1a1f2b]'
                    >
                      Sign in
                    </Link>
                  ) : isSaved ? (
                    <form action={unsavePlace}>
                      <input type='hidden' name='place_id' value={place.id} />
                      <input type='hidden' name='slug' value={slug} />
                      <button
                        type='submit'
                        className='rounded-xl border border-[#34384a] bg-[#151821] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#1a1f2b]'
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
                        className='rounded-xl bg-[#f4ede2] px-3 py-2 text-sm font-semibold text-[#181510] transition hover:opacity-90'
                      >
                        Save
                      </button>
                    </form>
                  )}

                  <a
                    href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(place.name)}`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='rounded-xl border border-[#34384a] bg-[#151821] px-3 py-2 text-sm text-white transition hover:bg-[#1a1f2b]'
                  >
                    Share
                  </a>
                </div>
              </div>

              <div className='flex flex-wrap gap-2'>
                <InfoBadge tone='gold'>{place.pizza_style || 'Classic NY Slice'}</InfoBadge>
                {place.is_best_under_5 ? <InfoBadge tone='gold'>Best under $5</InfoBadge> : null}
                {place.is_best_under_10 ? <InfoBadge tone='red'>Best under $10</InfoBadge> : null}
                {place.is_late_night ? <InfoBadge tone='teal'>Late night</InfoBadge> : null}
                {place.is_worth_the_trip ? <InfoBadge tone='default'>Worth the trip</InfoBadge> : null}
                {place.is_first_timer_friendly ? <InfoBadge tone='default'>First-timer friendly</InfoBadge> : null}
              </div>

              <div className='mt-4'>
                <h1 className='text-4xl font-bold leading-none tracking-tight text-white sm:text-5xl lg:text-6xl'>
                  {place.name}
                </h1>

                <p className='mt-3 text-xl text-[#dbe3f5] sm:text-2xl'>
                  ⊙ {[place.neighborhood, place.borough].filter(Boolean).join(', ')}
                </p>

                {place.best_known_for ? (
                  <p className='mt-4 max-w-2xl text-base leading-7 text-zinc-300 sm:text-lg sm:leading-8'>
                    Known for <span className='font-semibold text-white'>{place.best_known_for}</span>.
                  </p>
                ) : null}
              </div>

              <div className='mt-5 grid grid-cols-3 gap-3'>
                <MiniStat label='Rating' value={averageRating} accent='red' />
                <MiniStat label='Reviews' value={reviewCount} />
                <MiniStat
                  label='Slice'
                  value={
                    typeof place.cheapest_slice_price === 'number'
                      ? `$${place.cheapest_slice_price}`
                      : place.price_range || '$'
                  }
                  accent='gold'
                />
              </div>

              <div className='mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4'>
                <QuickFactCompact
                  label='Style'
                  value={place.pizza_style || 'Not specified'}
                />
                <QuickFactCompact
                  label='Best slice'
                  value={place.best_slice || 'Not specified'}
                />
                <QuickFactCompact
                  label='Whole pie'
                  value={
                    typeof place.whole_pie_price === 'number'
                      ? `$${place.whole_pie_price}`
                      : 'Not specified'
                  }
                />
                <QuickFactCompact
                  label='Value'
                  value={typeof place.value_score === 'number' ? `${place.value_score}/10` : 'Not specified'}
                />
              </div>
            </div>

            <div className='grid gap-5 px-4 py-4 sm:px-6 sm:py-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:px-8'>
              <div className='min-w-0'>
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

              <aside className='space-y-4'>
                <div className='rounded-[24px] border border-[#2a3040] bg-[#151821] p-4'>
                  <p className='text-xs uppercase tracking-[0.18em] text-[#7b8497]'>Quick actions</p>

                  <div className='mt-3 space-y-2.5'>
                    <a
                      href={googleMapsUrl}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex w-full items-center justify-center rounded-xl bg-[#f4ede2] px-4 py-3 text-sm font-semibold text-[#181510] transition hover:opacity-90'
                    >
                      Open in Google Maps
                    </a>

                    <Link
                      href='/routes'
                      className='flex w-full items-center justify-center rounded-xl border border-[#34384a] bg-[#111216] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#171b24]'
                    >
                      Browse routes
                    </Link>
                  </div>
                </div>

                <div className='rounded-[24px] border border-[#2a3040] bg-[#151821] p-4'>
                  <p className='text-xs uppercase tracking-[0.18em] text-[#7b8497]'>Similar places</p>

                  <div className='mt-3 space-y-2.5'>
                    {similarPlaces.length ? (
                      similarPlaces.map((item) => (
                        <Link
                          key={item.id}
                          href={`/places/${item.slug}`}
                          className='block rounded-2xl border border-[#2a3040] bg-[#101319] p-3 transition hover:bg-[#161b24]'
                        >
                          <p className='text-sm font-semibold text-white'>{item.name}</p>
                          <p className='mt-1 text-xs text-zinc-400'>
                            {[item.neighborhood, item.borough].filter(Boolean).join(', ')}
                          </p>
                          <div className='mt-2 flex flex-wrap gap-2'>
                            {item.pizza_style ? (
                              <span className='rounded-full bg-[#1d2d42] px-2.5 py-1 text-[11px] text-[#dce7ff]'>
                                {item.pizza_style}
                              </span>
                            ) : null}
                            {typeof item.cheapest_slice_price === 'number' ? (
                              <span className='rounded-full bg-[#302411] px-2.5 py-1 text-[11px] text-[#ffe6b7]'>
                                ${item.cheapest_slice_price} slice
                              </span>
                            ) : null}
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className='text-sm text-zinc-500'>No similar places found yet.</p>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
