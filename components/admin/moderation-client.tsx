'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Image as ImageIcon, MessageSquare, Search, Filter } from 'lucide-react'

type CommentItem = {
  id: string
  content?: string | null
  body?: string | null
  created_at: string
  user_id: string
  place_id: string
  is_hidden?: boolean | null
  deleted_at?: string | null
}

type PhotoItem = {
  id: string
  image_url?: string | null
  created_at: string
  user_id: string
  place_id: string
  is_hidden?: boolean | null
  deleted_at?: string | null
}

type ProfileItem = {
  id: string
  email?: string | null
  full_name?: string | null
  username?: string | null
  display_name?: string | null
}

type PlaceItem = {
  id: string
  name: string
  slug?: string | null
}

type ModerationClientProps = {
  comments: CommentItem[]
  photos: PhotoItem[]
  profiles: ProfileItem[]
  places: PlaceItem[]
}

export function ModerationClient({
  comments,
  photos,
  profiles,
  places,
}: ModerationClientProps) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState<'all' | 'comments' | 'photos'>('all')

  const profileMap = useMemo(
    () =>
      new Map(
        profiles.map((p) => [
          p.id,
          p.display_name || p.full_name || p.username || p.email || 'Unknown user',
        ])
      ),
    [profiles]
  )

  const placeMap = useMemo(
    () => new Map(places.map((p) => [p.id, { name: p.name, slug: p.slug }])),
    [places]
  )

  const items = useMemo(() => {
    const commentItems = comments.map((item) => ({
      type: 'comment' as const,
      id: item.id,
      created_at: item.created_at,
      user_id: item.user_id,
      place_id: item.place_id,
      is_hidden: !!item.is_hidden,
      deleted_at: item.deleted_at,
      body: item.body || item.content || 'No content',
      image_url: null as string | null,
    }))

    const photoItems = photos.map((item) => ({
      type: 'photo' as const,
      id: item.id,
      created_at: item.created_at,
      user_id: item.user_id,
      place_id: item.place_id,
      is_hidden: !!item.is_hidden,
      deleted_at: item.deleted_at,
      body: '',
      image_url: item.image_url || null,
    }))

    const merged = [...commentItems, ...photoItems].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return merged.filter((item) => {
      const matchesType =
        type === 'all' ||
        (type === 'comments' && item.type === 'comment') ||
        (type === 'photos' && item.type === 'photo')

      const placeName = placeMap.get(item.place_id)?.name || ''
      const userName = profileMap.get(item.user_id) || ''

      const haystack = `${item.body} ${placeName} ${userName}`.toLowerCase()
      const matchesQuery = !query || haystack.includes(query.toLowerCase())

      return matchesType && matchesQuery
    })
  }, [comments, photos, type, query, placeMap, profileMap])

  return (
    <div className='space-y-5'>
      <div className='rounded-[28px] border border-[#2a3040] bg-[#101115]/95 p-5 shadow-xl'>
        <div className='grid gap-4 lg:grid-cols-[1.4fr_220px]'>
          <div className='relative'>
            <Search className='pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b8497]' />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Search by place, user or content...'
              className='w-full rounded-2xl border border-[#2a3040] bg-[#151821] py-3 pl-11 pr-4 text-white outline-none'
            />
          </div>

          <div className='relative'>
            <Filter className='pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b8497]' />
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className='w-full rounded-2xl border border-[#2a3040] bg-[#151821] py-3 pl-11 pr-4 text-white outline-none'
            >
              <option value='all'>All moderation</option>
              <option value='comments'>Comments</option>
              <option value='photos'>Photos</option>
            </select>
          </div>
        </div>

        <div className='mt-4 flex flex-wrap gap-3 text-sm text-[#a4adbf]'>
          <span>{items.length} items shown</span>
          <span>·</span>
          <span>{comments.length} comments</span>
          <span>·</span>
          <span>{photos.length} photos</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className='rounded-[28px] border border-[#2a3040] bg-[#101115]/95 p-6 shadow-xl text-[#a4adbf]'>
          No moderation items found.
        </div>
      ) : null}

      <div className='space-y-4'>
        {items.map((item) => {
          const place = placeMap.get(item.place_id)
          const user = profileMap.get(item.user_id) || 'Unknown user'

          return (
            <div
              key={`${item.type}-${item.id}`}
              className='rounded-[28px] border border-[#2a3040] bg-[#101115]/95 p-5 shadow-xl'
            >
              <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                <div className='min-w-0 flex-1'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <span className='inline-flex items-center gap-2 rounded-full border border-[#2a3040] bg-[#151821] px-3 py-1 text-[11px] text-[#dbe3f5]'>
                      {item.type === 'comment' ? (
                        <MessageSquare className='h-3.5 w-3.5' />
                      ) : (
                        <ImageIcon className='h-3.5 w-3.5' />
                      )}
                      {item.type}
                    </span>

                    {item.is_hidden ? (
                      <span className='rounded-full border border-yellow-800 bg-yellow-950 px-3 py-1 text-[11px] text-yellow-200'>
                        hidden
                      </span>
                    ) : null}

                    {item.deleted_at ? (
                      <span className='rounded-full border border-red-900 bg-red-950 px-3 py-1 text-[11px] text-red-200'>
                        deleted
                      </span>
                    ) : null}
                  </div>

                  <p className='mt-3 text-sm font-medium text-white'>{user}</p>
                  <p className='mt-1 text-sm text-[#a4adbf]'>
                    {place?.slug ? (
                      <Link href={`/places/${place.slug}`} className='underline-offset-4 hover:underline'>
                        {place.name}
                      </Link>
                    ) : (
                      place?.name || 'Unknown place'
                    )}
                  </p>

                  {item.type === 'comment' ? (
                    <p className='mt-4 rounded-2xl border border-[#2a3040] bg-[#151821] p-4 text-sm leading-6 text-[#dbe3f5]'>
                      {item.body}
                    </p>
                  ) : item.image_url ? (
                    <div className='mt-4 h-40 w-full max-w-[260px] overflow-hidden rounded-2xl border border-[#2a3040] bg-[#151821]'>
                      <img src={item.image_url} alt='Moderation item' className='h-full w-full object-cover' />
                    </div>
                  ) : null}
                </div>

                <div className='shrink-0 rounded-2xl border border-[#2a3040] bg-[#151821] px-4 py-3 text-right'>
                  <p className='text-[10px] uppercase tracking-[0.16em] text-[#7b8497]'>Created</p>
                  <p className='mt-1 text-sm font-medium text-white'>
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
