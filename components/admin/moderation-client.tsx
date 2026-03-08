'use client'

import { useState } from 'react'

type CommentRow = {
  id: string
  content: string
  created_at: string
  user_id: string | null
  place_id: string | null
  is_hidden?: boolean
  deleted_at?: string | null
}

type PhotoRow = {
  id: string
  image_url: string | null
  created_at: string
  user_id: string | null
  place_id: string | null
  is_hidden?: boolean
  deleted_at?: string | null
}

export function ModerationClient({
  comments,
  photos,
  profiles,
  places,
}: {
  comments: CommentRow[]
  photos: PhotoRow[]
  profiles: { id: string; email?: string | null; full_name?: string | null }[]
  places: { id: string; name: string }[]
}) {
  const [busy, setBusy] = useState<string | null>(null)

  const profileMap = new Map(
    profiles.map((p) => [p.id, p.full_name || p.email || 'Unknown user'])
  )
  const placeMap = new Map(places.map((p) => [p.id, p.name]))

  async function moderate(type: 'comments' | 'photos', id: string, action: string) {
    setBusy(`${type}:${id}:${action}`)
    try {
      await fetch(`/api/admin/${type}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      window.location.reload()
    } finally {
      setBusy(null)
    }
  }

  async function hardDelete(type: 'comments' | 'photos', id: string) {
    setBusy(`${type}:${id}:hard_delete`)
    try {
      await fetch(`/api/admin/${type}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'hard_delete' }),
      })
      window.location.reload()
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className='grid gap-6 xl:grid-cols-2'>
      <section className='rounded-[28px] border border-zinc-800 bg-black/70 p-6 shadow-xl'>
        <h2 className='text-2xl font-semibold text-white'>Recent comments</h2>
        <div className='mt-5 space-y-4'>
          {comments.map((comment) => (
            <div key={comment.id} className='rounded-2xl border border-zinc-800 bg-zinc-950 p-4'>
              <p className='text-sm font-medium text-white'>
                {profileMap.get(comment.user_id || '') || 'Unknown user'}
              </p>
              <p className='mt-2 text-sm leading-6 text-zinc-400'>{comment.content}</p>
              <div className='mt-3 flex items-center justify-between gap-4 text-xs text-zinc-500'>
                <span>{placeMap.get(comment.place_id || '') || 'Unknown place'}</span>
                <span>{new Date(comment.created_at).toLocaleString()}</span>
              </div>
              <div className='mt-4 flex flex-wrap gap-2'>
                <button
                  disabled={!!busy}
                  onClick={() => moderate('comments', comment.id, 'hide')}
                  className='rounded-xl border border-zinc-700 px-3 py-2 text-sm text-white'
                >
                  Hide
                </button>
                <button
                  disabled={!!busy}
                  onClick={() => moderate('comments', comment.id, 'soft_delete')}
                  className='rounded-xl border border-yellow-800 bg-yellow-950 px-3 py-2 text-sm text-yellow-200'
                >
                  Soft delete
                </button>
                <button
                  disabled={!!busy}
                  onClick={() => moderate('comments', comment.id, 'restore')}
                  className='rounded-xl border border-emerald-800 bg-emerald-950 px-3 py-2 text-sm text-emerald-200'
                >
                  Restore
                </button>
                <button
                  disabled={!!busy}
                  onClick={() => hardDelete('comments', comment.id)}
                  className='rounded-xl border border-red-900 bg-red-950 px-3 py-2 text-sm text-red-200'
                >
                  Hard delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className='rounded-[28px] border border-zinc-800 bg-black/70 p-6 shadow-xl'>
        <h2 className='text-2xl font-semibold text-white'>Recent uploads</h2>
        <div className='mt-5 space-y-4'>
          {photos.map((photo) => (
            <div key={photo.id} className='rounded-2xl border border-zinc-800 bg-zinc-950 p-4'>
              <p className='text-sm font-medium text-white'>
                {profileMap.get(photo.user_id || '') || 'Unknown user'}
              </p>
              <div className='mt-3 flex items-center gap-4'>
                <div className='h-16 w-16 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900'>
                  {photo.image_url ? (
                    <img src={photo.image_url} alt='Upload preview' className='h-full w-full object-cover' />
                  ) : null}
                </div>
                <div>
                  <p className='text-sm text-zinc-300'>
                    {placeMap.get(photo.place_id || '') || 'Unknown place'}
                  </p>
                  <p className='mt-1 text-xs text-zinc-500'>
                    {new Date(photo.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className='mt-4 flex flex-wrap gap-2'>
                <button
                  disabled={!!busy}
                  onClick={() => moderate('photos', photo.id, 'hide')}
                  className='rounded-xl border border-zinc-700 px-3 py-2 text-sm text-white'
                >
                  Hide
                </button>
                <button
                  disabled={!!busy}
                  onClick={() => moderate('photos', photo.id, 'soft_delete')}
                  className='rounded-xl border border-yellow-800 bg-yellow-950 px-3 py-2 text-sm text-yellow-200'
                >
                  Soft delete
                </button>
                <button
                  disabled={!!busy}
                  onClick={() => moderate('photos', photo.id, 'restore')}
                  className='rounded-xl border border-emerald-800 bg-emerald-950 px-3 py-2 text-sm text-emerald-200'
                >
                  Restore
                </button>
                <button
                  disabled={!!busy}
                  onClick={() => hardDelete('photos', photo.id)}
                  className='rounded-xl border border-red-900 bg-red-950 px-3 py-2 text-sm text-red-200'
                >
                  Hard delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
