'use client'

import { useState } from 'react'
import { CommentForm } from '@/components/places/comment-form'
import { CommentsList } from '@/components/places/comments-list'
import { PhotoGallery } from '@/components/places/photo-gallery'
import { PhotoUpload } from '@/components/places/photo-upload'
import { StarRatingForm } from '@/components/places/star-rating-form'

type Comment = {
  id: string
  body: string
  created_at: string
  user_id: string
}

type Photo = {
  id: string
  image_url: string
  caption: string | null
}

export function PlaceDetailTabs({
  placeId,
  slug,
  userId,
  comments,
  photos,
  bestKnownFor,
  description,
  address,
  googleMapsUrl,
  hoursText,
  userRating,
}: {
  placeId: string
  slug: string
  userId?: string
  comments: Comment[]
  photos: Photo[]
  bestKnownFor?: string | null
  description?: string | null
  address?: string | null
  googleMapsUrl: string
  hoursText?: string | null
  userRating?: number
}) {
  const [tab, setTab] = useState<'info' | 'comments' | 'photos'>('info')

  return (
    <div className='mt-8 overflow-hidden rounded-[28px] border border-zinc-800 bg-black/70'>
      <div className='border-b border-zinc-800 px-6 py-6'>
        <p className='text-xs uppercase tracking-[0.18em] text-zinc-500'>
          Your rating
        </p>

        <StarRatingForm
          placeId={placeId}
          slug={slug}
          userId={userId}
          initialRating={userRating || 0}
        />
      </div>

      <div className='border-b border-zinc-800'>
        <div className='grid grid-cols-3'>
          <button
            type='button'
            onClick={() => setTab('info')}
            className={`px-4 py-4 text-center text-base transition ${
              tab === 'info'
                ? 'border-b-2 border-red-500 font-semibold text-white'
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            Info
          </button>

          <button
            type='button'
            onClick={() => setTab('comments')}
            className={`px-4 py-4 text-center text-base transition ${
              tab === 'comments'
                ? 'border-b-2 border-red-500 font-semibold text-white'
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            Comments
          </button>

          <button
            type='button'
            onClick={() => setTab('photos')}
            className={`px-4 py-4 text-center text-base transition ${
              tab === 'photos'
                ? 'border-b-2 border-red-500 font-semibold text-white'
                : 'text-zinc-500 hover:text-white'
            }`}
          >
            Photos
          </button>
        </div>
      </div>

      <div className='p-6'>
        {tab === 'info' ? (
          <div className='space-y-8'>
            <div>
              <p className='text-xs uppercase tracking-[0.18em] text-zinc-500'>
                Best known for
              </p>
              <p className='mt-3 text-3xl font-bold text-white'>
                {bestKnownFor || 'Signature slice'}
              </p>
            </div>

            <div>
              <p className='text-xs uppercase tracking-[0.18em] text-zinc-500'>
                About
              </p>
              <p className='mt-3 text-lg leading-8 text-zinc-300'>
                {description || 'No description yet.'}
              </p>
            </div>

            {hoursText ? (
              <div>
                <p className='text-xs uppercase tracking-[0.18em] text-zinc-500'>
                  Hours
                </p>
                <p className='mt-3 text-lg text-zinc-300'>{hoursText}</p>
              </div>
            ) : null}

            {address ? (
              <div>
                <p className='text-xs uppercase tracking-[0.18em] text-zinc-500'>
                  Address
                </p>
                <p className='mt-3 text-lg text-zinc-300'>{address}</p>
              </div>
            ) : null}

            <div>
              <a
                href={googleMapsUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-3 rounded-xl text-base font-medium text-red-400 transition hover:text-red-300'
              >
                <span>↗</span>
                <span>Open in Google Maps</span>
              </a>
            </div>

            <div>
              <p className='text-xs uppercase tracking-[0.18em] text-zinc-500'>
                User photos
              </p>

              <div className='mt-4'>
                {photos.length ? (
                  <PhotoGallery photos={photos} />
                ) : (
                  <div className='flex flex-col items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-950 px-6 py-16 text-center'>
                    <div className='text-5xl text-zinc-700'>⌂</div>
                    <p className='mt-6 text-lg text-zinc-500'>
                      No photos yet. Add the first!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {tab === 'comments' ? (
          <div className='space-y-6'>
            <CommentForm placeId={placeId} slug={slug} userId={userId} />

            {comments.length ? (
              <CommentsList comments={comments} />
            ) : (
              <div className='flex flex-col items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-950 px-6 py-16 text-center'>
                <div className='text-5xl text-zinc-700'>◔</div>
                <p className='mt-6 text-lg text-zinc-500'>
                  No comments yet. Be the first!
                </p>
              </div>
            )}
          </div>
        ) : null}

        {tab === 'photos' ? (
          <div className='space-y-6'>
            <PhotoUpload placeId={placeId} userId={userId} />

            {photos.length ? (
              <PhotoGallery photos={photos} />
            ) : (
              <div className='flex flex-col items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-950 px-6 py-16 text-center'>
                <button
                  type='button'
                  className='rounded-xl bg-white px-5 py-3 font-medium text-black transition hover:opacity-90'
                >
                  Add Photo
                </button>

                <div className='mt-10 text-5xl text-zinc-700'>⌂</div>
                <p className='mt-6 text-lg text-zinc-500'>
                  No photos yet. Add the first!
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
