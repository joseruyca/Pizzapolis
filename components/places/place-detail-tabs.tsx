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

function InfoCard({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className='rounded-[24px] border border-[#2a3040] bg-[#151821] p-5'>
      <p className='text-xs uppercase tracking-[0.18em] text-[#7b8497]'>
        {label}
      </p>
      <div className='mt-3'>{children}</div>
    </div>
  )
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
    <div className='mt-8 overflow-hidden rounded-[28px] border border-[#2a3040] bg-[#111216]/95'>
      <div className='border-b border-[#2a3040] bg-[#171922] px-6 py-6'>
        <p className='text-xs uppercase tracking-[0.18em] text-[#7b8497]'>
          Your rating
        </p>

        <StarRatingForm
          placeId={placeId}
          slug={slug}
          userId={userId}
          initialRating={userRating || 0}
        />
      </div>

      <div className='border-b border-[#2a3040] bg-[#141720]'>
        <div className='grid grid-cols-3 gap-0'>
          <button
            type='button'
            onClick={() => setTab('info')}
            className={`px-4 py-4 text-center text-base transition ${
              tab === 'info'
                ? 'border-b-2 border-[#d94b5c] font-semibold text-white bg-[#171922]'
                : 'text-[#7b8497] hover:text-white'
            }`}
          >
            Info
          </button>

          <button
            type='button'
            onClick={() => setTab('comments')}
            className={`px-4 py-4 text-center text-base transition ${
              tab === 'comments'
                ? 'border-b-2 border-[#d94b5c] font-semibold text-white bg-[#171922]'
                : 'text-[#7b8497] hover:text-white'
            }`}
          >
            Comments
          </button>

          <button
            type='button'
            onClick={() => setTab('photos')}
            className={`px-4 py-4 text-center text-base transition ${
              tab === 'photos'
                ? 'border-b-2 border-[#d94b5c] font-semibold text-white bg-[#171922]'
                : 'text-[#7b8497] hover:text-white'
            }`}
          >
            Photos
          </button>
        </div>
      </div>

      <div className='p-6'>
        {tab === 'info' ? (
          <div className='space-y-5'>
            <InfoCard label='Best known for'>
              <p className='text-3xl font-bold text-white'>
                {bestKnownFor || 'Signature slice'}
              </p>
            </InfoCard>

            <InfoCard label='About'>
              <p className='text-lg leading-8 text-zinc-300'>
                {description || 'No description yet.'}
              </p>
            </InfoCard>

            <div className='grid gap-5 md:grid-cols-2'>
              {hoursText ? (
                <InfoCard label='Hours'>
                  <p className='text-lg text-zinc-300'>{hoursText}</p>
                </InfoCard>
              ) : null}

              {address ? (
                <InfoCard label='Address'>
                  <p className='text-lg text-zinc-300'>{address}</p>
                </InfoCard>
              ) : null}
            </div>

            <div className='flex flex-wrap gap-3'>
              <a
                href={googleMapsUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-3 rounded-xl bg-[#f4ede2] px-5 py-3 text-base font-semibold text-[#181510] transition hover:opacity-90'
              >
                <span>↗</span>
                <span>Open in Google Maps</span>
              </a>
            </div>

            <InfoCard label='User photos'>
              {photos.length ? (
                <PhotoGallery photos={photos} />
              ) : (
                <div className='flex flex-col items-center justify-center rounded-3xl border border-[#2a3040] bg-[#101319] px-6 py-16 text-center'>
                  <div className='text-5xl text-[#4a5263]'>⌂</div>
                  <p className='mt-6 text-lg text-zinc-500'>
                    No photos yet. Add the first!
                  </p>
                </div>
              )}
            </InfoCard>
          </div>
        ) : null}

        {tab === 'comments' ? (
          <div className='space-y-6'>
            <CommentForm placeId={placeId} slug={slug} userId={userId} />

            {comments.length ? (
              <CommentsList comments={comments} />
            ) : (
              <div className='flex flex-col items-center justify-center rounded-3xl border border-[#2a3040] bg-[#101319] px-6 py-16 text-center'>
                <div className='text-5xl text-[#4a5263]'>◔</div>
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
              <div className='flex flex-col items-center justify-center rounded-3xl border border-[#2a3040] bg-[#101319] px-6 py-16 text-center'>
                <button
                  type='button'
                  className='rounded-xl bg-[#f4ede2] px-5 py-3 font-semibold text-[#181510] transition hover:opacity-90'
                >
                  Add Photo
                </button>

                <div className='mt-10 text-5xl text-[#4a5263]'>⌂</div>
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
