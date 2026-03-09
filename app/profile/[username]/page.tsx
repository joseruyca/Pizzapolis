import { notFound } from 'next/navigation'
import Link from 'next/link'
import { AppHeader } from '@/components/layout/app-header'
import { createClient } from '@/lib/supabase/server'
import { createPublicClient } from '@/lib/supabase/public'
import { FollowButton } from '@/components/profile/follow-button'

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()
  const publicSupabase = createPublicClient()

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  const { data: profile } = await publicSupabase
    .from('profiles')
    .select('*')
    .ilike('username', username)
    .maybeSingle()

  if (!profile || !profile.is_public) notFound()

  const { count: followersCount } = await publicSupabase
    .from('user_follows')
    .select('*', { count: 'exact', head: true })
    .eq('following_id', profile.id)

  const { count: followingCount } = await publicSupabase
    .from('user_follows')
    .select('*', { count: 'exact', head: true })
    .eq('follower_id', profile.id)

  const { count: reviewsCount } = await publicSupabase
    .from('reviews')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', profile.id)

  let isFollowing = false

  if (currentUser && currentUser.id !== profile.id) {
    const { data: followRow } = await supabase
      .from('user_follows')
      .select('*')
      .eq('follower_id', currentUser.id)
      .eq('following_id', profile.id)
      .maybeSingle()

    isFollowing = !!followRow
  }

  return (
    <main className='min-h-screen bg-black text-white'>
      <AppHeader />
      <div className='mx-auto max-w-4xl px-6 py-10'>
        <div className='rounded-[30px] border border-zinc-800 bg-black/80 p-8 shadow-2xl'>
          <div className='flex flex-wrap items-start justify-between gap-6'>
            <div>
              <p className='text-sm uppercase tracking-[0.22em] text-red-400'>Curator profile</p>
              <h1 className='mt-4 text-4xl font-bold'>{profile.display_name || profile.username}</h1>
              <p className='mt-2 text-zinc-400'>@{profile.username}</p>
              {profile.bio ? <p className='mt-4 max-w-2xl text-zinc-300'>{profile.bio}</p> : null}
            </div>

            <FollowButton
              followingId={profile.id}
              username={profile.username}
              isFollowing={isFollowing}
              isOwnProfile={currentUser?.id === profile.id}
            />
          </div>

          <div className='mt-8 grid gap-4 md:grid-cols-3'>
            <div className='rounded-3xl border border-zinc-800 bg-zinc-950 p-6'>
              <p className='text-sm uppercase tracking-[0.18em] text-zinc-500'>Followers</p>
              <p className='mt-3 text-3xl font-bold text-white'>{followersCount ?? 0}</p>
            </div>
            <div className='rounded-3xl border border-zinc-800 bg-zinc-950 p-6'>
              <p className='text-sm uppercase tracking-[0.18em] text-zinc-500'>Following</p>
              <p className='mt-3 text-3xl font-bold text-white'>{followingCount ?? 0}</p>
            </div>
            <div className='rounded-3xl border border-zinc-800 bg-zinc-950 p-6'>
              <p className='text-sm uppercase tracking-[0.18em] text-zinc-500'>Reviews</p>
              <p className='mt-3 text-3xl font-bold text-white'>{reviewsCount ?? 0}</p>
            </div>
          </div>

          <div className='mt-8'>
            <Link
              href='/account'
              className='rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white transition hover:bg-zinc-900'
            >
              Back to account
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
