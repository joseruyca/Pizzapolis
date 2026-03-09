'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { updateProfile } from '@/lib/actions/profile'
import { UserBadges } from '@/components/account/user-badges'

type SavedPlace = {
  place?: {
    id?: string
    slug?: string
    name?: string
    borough?: string | null
    neighborhood?: string | null
  } | null
}

type ProfileShape = {
  username?: string | null
  display_name?: string | null
  bio?: string | null
  favorite_borough?: string | null
  favorite_style?: string | null
} | null

type AccountTabsProps = {
  profile: ProfileShape
  email: string
  reviewCount: number
  commentCount: number
  photoCount: number
  exploredBoroughs: number
  savedCount: number
  followersCount: number
  followingCount: number
  savedPlaces: SavedPlace[]
  publicProfileUrl?: string | null
  lateNightCount: number
  cheapSliceCount: number
  brooklynCount: number
}

function StatCard({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-4'>
      <p className='text-[11px] uppercase tracking-[0.18em] text-zinc-500'>{label}</p>
      <p className='mt-2 text-2xl font-bold text-white'>{value}</p>
    </div>
  )
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? 'bg-white text-black'
          : 'border border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-900'
      }`}
    >
      {label}
    </button>
  )
}

export function AccountTabs({
  profile,
  email,
  reviewCount,
  commentCount,
  photoCount,
  exploredBoroughs,
  savedCount,
  followersCount,
  followingCount,
  savedPlaces,
  publicProfileUrl,
  lateNightCount,
  cheapSliceCount,
  brooklynCount,
}: AccountTabsProps) {
  const [tab, setTab] = useState<'overview' | 'saved' | 'edit' | 'badges'>('overview')

  const quickStats = useMemo(
    () => [
      { label: 'Reviews', value: reviewCount },
      { label: 'Comments', value: commentCount },
      { label: 'Photos', value: photoCount },
      { label: 'Saved', value: savedCount },
      { label: 'Followers', value: followersCount },
      { label: 'Following', value: followingCount },
      { label: 'Boroughs', value: exploredBoroughs },
    ],
    [reviewCount, commentCount, photoCount, savedCount, followersCount, followingCount, exploredBoroughs]
  )

  return (
    <div className='rounded-[28px] border border-zinc-800 bg-[#111214]'>
      <div className='border-b border-zinc-800 p-4 sm:p-5'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div>
            <p className='text-xs uppercase tracking-[0.18em] text-zinc-500'>Profile</p>
            <h2 className='mt-2 text-2xl font-bold text-white'>
              {profile?.display_name || profile?.username || 'Your account'}
            </h2>
            <p className='mt-1 text-sm text-zinc-400'>
              @{profile?.username || 'username'} · {email}
            </p>
          </div>

          {publicProfileUrl ? (
            <Link
              href={publicProfileUrl}
              className='rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white transition hover:bg-zinc-900'
            >
              View public profile
            </Link>
          ) : null}
        </div>

        <div className='mt-4 flex flex-wrap gap-2'>
          <TabButton label='Overview' active={tab === 'overview'} onClick={() => setTab('overview')} />
          <TabButton label='Saved' active={tab === 'saved'} onClick={() => setTab('saved')} />
          <TabButton label='Edit' active={tab === 'edit'} onClick={() => setTab('edit')} />
          <TabButton label='Badges' active={tab === 'badges'} onClick={() => setTab('badges')} />
        </div>
      </div>

      <div className='p-4 sm:p-5'>
        {tab === 'overview' ? (
          <div className='space-y-5'>
            <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
              {quickStats.map((item) => (
                <StatCard key={item.label} label={item.label} value={item.value} />
              ))}
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-5'>
                <p className='text-xs uppercase tracking-[0.18em] text-zinc-500'>Bio</p>
                <p className='mt-3 text-zinc-300'>
                  {profile?.bio || 'No bio added yet.'}
                </p>
              </div>

              <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-5'>
                <p className='text-xs uppercase tracking-[0.18em] text-zinc-500'>Identity</p>
                <div className='mt-3 space-y-3 text-sm text-zinc-300'>
                  <p>
                    <span className='text-zinc-500'>Username:</span>{' '}
                    <span className='text-white'>{profile?.username || '—'}</span>
                  </p>
                  <p>
                    <span className='text-zinc-500'>Display name:</span>{' '}
                    <span className='text-white'>{profile?.display_name || '—'}</span>
                  </p>
                  <p>
                    <span className='text-zinc-500'>Favorite borough:</span>{' '}
                    <span className='text-white'>{profile?.favorite_borough || '—'}</span>
                  </p>
                  <p>
                    <span className='text-zinc-500'>Favorite style:</span>{' '}
                    <span className='text-white'>{profile?.favorite_style || '—'}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {tab === 'saved' ? (
          <div className='space-y-3'>
            {savedPlaces.length === 0 ? (
              <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-zinc-400'>
                You have not saved any places yet.
              </div>
            ) : (
              savedPlaces.map((item, index) => (
                <Link
                  key={`${item.place?.id}-${index}`}
                  href={`/places/${item.place?.slug}`}
                  className='block rounded-2xl border border-zinc-800 bg-zinc-950 p-4 transition hover:bg-zinc-900'
                >
                  <p className='text-lg font-semibold text-white'>{item.place?.name}</p>
                  <p className='mt-1 text-sm text-zinc-400'>
                    {[item.place?.neighborhood, item.place?.borough].filter(Boolean).join(', ')}
                  </p>
                </Link>
              ))
            )}
          </div>
        ) : null}

        {tab === 'edit' ? (
          <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-5'>
            <h3 className='text-2xl font-bold text-white'>Edit profile</h3>

            <form action={updateProfile} className='mt-6 space-y-4'>
              <div>
                <label className='mb-2 block text-sm text-zinc-400'>Username</label>
                <input
                  name='username'
                  defaultValue={profile?.username ?? ''}
                  className='w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none'
                  required
                />
              </div>

              <div>
                <label className='mb-2 block text-sm text-zinc-400'>Display name</label>
                <input
                  name='display_name'
                  defaultValue={profile?.display_name ?? ''}
                  className='w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none'
                />
              </div>

              <div>
                <label className='mb-2 block text-sm text-zinc-400'>Bio</label>
                <textarea
                  name='bio'
                  rows={4}
                  defaultValue={profile?.bio ?? ''}
                  className='w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none'
                />
              </div>

              <div className='grid gap-4 md:grid-cols-2'>
                <div>
                  <label className='mb-2 block text-sm text-zinc-400'>Favorite borough</label>
                  <input
                    name='favorite_borough'
                    defaultValue={profile?.favorite_borough ?? ''}
                    className='w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none'
                  />
                </div>

                <div>
                  <label className='mb-2 block text-sm text-zinc-400'>Favorite style</label>
                  <input
                    name='favorite_style'
                    defaultValue={profile?.favorite_style ?? ''}
                    className='w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none'
                  />
                </div>
              </div>

              <div className='flex flex-wrap gap-3'>
                <button
                  type='submit'
                  className='rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:opacity-90'
                >
                  Save profile
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {tab === 'badges' ? (
          <UserBadges
            reviewCount={reviewCount}
            photoCount={photoCount}
            exploredBoroughs={exploredBoroughs}
            lateNightCount={lateNightCount}
            cheapSliceCount={cheapSliceCount}
            brooklynCount={brooklynCount}
          />
        ) : null}
      </div>
    </div>
  )
}
