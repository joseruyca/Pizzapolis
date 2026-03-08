import Link from 'next/link'
import { AppHeader } from '@/components/layout/app-header'
import { createClient } from '@/lib/supabase/server'
import { createPublicClient } from '@/lib/supabase/public'
import { SignOutButton } from '@/components/auth/sign-out-button'
import { UserBadges } from '@/components/account/user-badges'

type PlaceLite = {
  id: string
  borough: string | null
  price_range: string | null
  pizza_style: string | null
  style_tags: string[] | null
}

export default async function AccountPage() {
  const supabase = await createClient()
  const publicSupabase = createPublicClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let reviewCount = 0
  let commentCount = 0
  let photoCount = 0
  let exploredBoroughs = 0
  let lateNightCount = 0
  let cheapSliceCount = 0
  let brooklynCount = 0

  if (user) {
    const { count: reviewsTotal } = await publicSupabase
      .from('reviews')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const { count: commentsTotal } = await publicSupabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const { count: photosTotal } = await publicSupabase
      .from('photos')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    reviewCount = reviewsTotal ?? 0
    commentCount = commentsTotal ?? 0
    photoCount = photosTotal ?? 0

    const { data: reviewedPlaces } = await publicSupabase
      .from('reviews')
      .select('place_id')
      .eq('user_id', user.id)

    const { data: commentedPlaces } = await publicSupabase
      .from('comments')
      .select('place_id')
      .eq('user_id', user.id)

    const { data: photoPlaces } = await publicSupabase
      .from('photos')
      .select('place_id')
      .eq('user_id', user.id)

    const placeIds = Array.from(
      new Set(
        [
          ...(reviewedPlaces ?? []).map((item) => item.place_id),
          ...(commentedPlaces ?? []).map((item) => item.place_id),
          ...(photoPlaces ?? []).map((item) => item.place_id),
        ].filter(Boolean)
      )
    )

    if (placeIds.length > 0) {
      const { data: places } = await publicSupabase
        .from('places')
        .select('id, borough, price_range, pizza_style, style_tags')
        .in('id', placeIds)

      const safePlaces = (places ?? []) as PlaceLite[]

      exploredBoroughs = new Set(
        safePlaces.map((place) => place.borough).filter(Boolean)
      ).size

      cheapSliceCount = safePlaces.filter((place) => place.price_range === '$').length

      brooklynCount = safePlaces.filter((place) => place.borough === 'Brooklyn').length

      lateNightCount = safePlaces.filter((place) => {
        const style = place.pizza_style?.toLowerCase() || ''
        const tags = (place.style_tags ?? []).map((tag) => tag.toLowerCase())
        return style.includes('late night') || tags.includes('late night')
      }).length
    }
  }

  return (
    <main className='min-h-screen bg-black text-white'>
      <AppHeader />

      <div className='min-h-screen bg-[linear-gradient(180deg,rgba(60,0,0,0.28),rgba(0,0,0,0.96)_32%)]'>
        <div className='mx-auto max-w-5xl px-6 py-10'>
          <div className='rounded-[30px] border border-zinc-800 bg-black/80 p-8 shadow-2xl'>
            <p className='text-sm uppercase tracking-[0.22em] text-red-400'>
              Account
            </p>

            <h1 className='mt-4 text-4xl font-bold'>Your profile</h1>

            {!user ? (
              <div className='mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6'>
                <p className='text-zinc-400'>You are not signed in.</p>
                <Link
                  href='/login'
                  className='mt-4 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:opacity-90'
                >
                  Sign in
                </Link>
              </div>
            ) : (
              <div className='mt-8 space-y-6'>
                <div className='rounded-3xl border border-zinc-800 bg-zinc-950 p-6'>
                  <p className='text-sm uppercase tracking-[0.18em] text-zinc-500'>
                    Email
                  </p>
                  <p className='mt-3 text-lg text-white'>{user.email}</p>
                </div>

                <div className='grid gap-4 md:grid-cols-4'>
                  <div className='rounded-3xl border border-zinc-800 bg-zinc-950 p-6'>
                    <p className='text-sm uppercase tracking-[0.18em] text-zinc-500'>
                      Reviews
                    </p>
                    <p className='mt-3 text-3xl font-bold text-white'>{reviewCount}</p>
                  </div>

                  <div className='rounded-3xl border border-zinc-800 bg-zinc-950 p-6'>
                    <p className='text-sm uppercase tracking-[0.18em] text-zinc-500'>
                      Comments
                    </p>
                    <p className='mt-3 text-3xl font-bold text-white'>{commentCount}</p>
                  </div>

                  <div className='rounded-3xl border border-zinc-800 bg-zinc-950 p-6'>
                    <p className='text-sm uppercase tracking-[0.18em] text-zinc-500'>
                      Photos
                    </p>
                    <p className='mt-3 text-3xl font-bold text-white'>{photoCount}</p>
                  </div>

                  <div className='rounded-3xl border border-zinc-800 bg-zinc-950 p-6'>
                    <p className='text-sm uppercase tracking-[0.18em] text-zinc-500'>
                      Boroughs
                    </p>
                    <p className='mt-3 text-3xl font-bold text-white'>{exploredBoroughs}</p>
                  </div>
                </div>

                <UserBadges
                  reviewCount={reviewCount}
                  photoCount={photoCount}
                  exploredBoroughs={exploredBoroughs}
                  lateNightCount={lateNightCount}
                  cheapSliceCount={cheapSliceCount}
                  brooklynCount={brooklynCount}
                />

                <div className='flex flex-wrap gap-3'>
                  <Link
                    href='/explorar'
                    className='rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white transition hover:bg-zinc-900'
                  >
                    Back to map
                  </Link>
                  <SignOutButton />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
