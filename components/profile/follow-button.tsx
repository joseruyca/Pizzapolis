import { followUser, unfollowUser } from '@/lib/actions/profile'

export function FollowButton({
  followingId,
  username,
  isFollowing,
  isOwnProfile,
}: {
  followingId: string
  username: string
  isFollowing: boolean
  isOwnProfile: boolean
}) {
  if (isOwnProfile) return null

  return isFollowing ? (
    <form action={unfollowUser}>
      <input type='hidden' name='following_id' value={followingId} />
      <input type='hidden' name='username' value={username} />
      <button
        type='submit'
        className='rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white transition hover:bg-zinc-900'
      >
        Following
      </button>
    </form>
  ) : (
    <form action={followUser}>
      <input type='hidden' name='following_id' value={followingId} />
      <input type='hidden' name='username' value={username} />
      <button
        type='submit'
        className='rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:opacity-90'
      >
        Follow
      </button>
    </form>
  )
}
