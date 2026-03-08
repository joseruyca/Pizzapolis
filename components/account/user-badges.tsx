type BadgeCardProps = {
  title: string
  description: string
  unlocked: boolean
  icon: string
}

function BadgeCard({
  title,
  description,
  unlocked,
  icon,
}: BadgeCardProps) {
  return (
    <div
      className={`rounded-3xl border p-5 transition ${
        unlocked
          ? 'border-emerald-800 bg-[rgba(6,78,59,0.18)]'
          : 'border-zinc-800 bg-zinc-950'
      }`}
    >
      <div className='flex items-start gap-4'>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl text-2xl ${
            unlocked ? 'bg-emerald-500/20' : 'bg-zinc-800'
          }`}
        >
          {icon}
        </div>

        <div>
          <div className='flex items-center gap-3'>
            <h3 className='text-lg font-semibold text-white'>{title}</h3>

            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                unlocked
                  ? 'border border-emerald-700 bg-emerald-950 text-emerald-300'
                  : 'border border-zinc-700 bg-zinc-900 text-zinc-400'
              }`}
            >
              {unlocked ? 'Unlocked' : 'Locked'}
            </span>
          </div>

          <p className='mt-2 text-sm leading-6 text-zinc-400'>{description}</p>
        </div>
      </div>
    </div>
  )
}

export function UserBadges({
  reviewCount,
  photoCount,
  exploredBoroughs,
  lateNightCount,
  cheapSliceCount,
  brooklynCount,
}: {
  reviewCount: number
  photoCount: number
  exploredBoroughs: number
  lateNightCount: number
  cheapSliceCount: number
  brooklynCount: number
}) {
  const badges = [
    {
      title: 'First Review',
      description: 'Write your first review and start building your pizza profile.',
      unlocked: reviewCount >= 1,
      icon: '★',
    },
    {
      title: 'Photo Contributor',
      description: 'Upload at least 3 photos to help other people discover great spots.',
      unlocked: photoCount >= 3,
      icon: '📷',
    },
    {
      title: 'Borough Explorer',
      description: 'Interact with pizza spots in at least 3 different boroughs.',
      unlocked: exploredBoroughs >= 3,
      icon: '🗺️',
    },
    {
      title: 'Late Night Scout',
      description: 'Interact with at least 2 late-night pizza spots.',
      unlocked: lateNightCount >= 2,
      icon: '🌙',
    },
    {
      title: 'Cheap Slice Hunter',
      description: 'Interact with at least 3 budget pizza spots.',
      unlocked: cheapSliceCount >= 3,
      icon: '💸',
    },
    {
      title: 'Brooklyn Specialist',
      description: 'Interact with at least 3 pizza spots in Brooklyn.',
      unlocked: brooklynCount >= 3,
      icon: '🧱',
    },
  ]

  return (
    <section className='rounded-[30px] border border-zinc-800 bg-black/70 p-6 shadow-xl'>
      <div className='flex items-center justify-between gap-4'>
        <div>
          <p className='text-sm uppercase tracking-[0.22em] text-red-400'>Badges</p>
          <h2 className='mt-3 text-2xl font-semibold text-white'>Your progress</h2>
        </div>

        <div className='rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-400'>
          {badges.filter((badge) => badge.unlocked).length} / {badges.length} unlocked
        </div>
      </div>

      <div className='mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {badges.map((badge) => (
          <BadgeCard key={badge.title} {...badge} />
        ))}
      </div>
    </section>
  )
}
