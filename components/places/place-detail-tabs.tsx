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
    <div className='rounded-[22px] border border-[#2a3040] bg-[#151821] p-4 sm:p-5'>
      <p className='text-[10px] uppercase tracking-[0.18em] text-[#7b8497]'>
        {label}
      </p>
      <div className='mt-2.5'>{children}</div>
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
    <div className='overflow-hidden rounded-[24px] border border-[#2a3040] bg-[#111216]/95'>
      <div className='border-b border-[#2a3040] bg-[#171922] px-4 py-4 sm:px-6 sm:py-5'>
        <p className='text-[10px] uppercase tracking-[0.18em] text-[#7b8497]'>
          Rate this place
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
            className={`px-3 py-3 text-center text-sm sm:text-base transition ${
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
            className={`px-3 py-3 text-center text-sm sm:text-base transition ${
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
            className={`px-3 py-3 text-center text-sm sm:text-base transition ${
              tab === 'photos'
                ? 'border-b-2 border-[#d94b5c] font-semibold text-white bg-[#171922]'
                : 'text-[#7b8497] hover:text-white'
            }`}
          >
            Photos
          </button>
        </div>
      </div>

      <div className='p-4 sm:p-6'>
        {tab === 'info' ? (
          <div className='space-y-4'>
            <InfoCard label='Best known for'>
              <p className='text-2xl font-bold text-white sm:text-3xl'>
                {bestKnownFor || 'Signature slice'}
              </p>
            </InfoCard>

            <InfoCard label='About'>
              <p className='text-base leading-7 text-zinc-300 sm:text-lg sm:leading-8'>
                {description || 'No description yet.'}
              </p>
            </InfoCard>

            <div className='grid gap-4 md:grid-cols-2'>
              {hoursText ? (
                <InfoCard label='Hours'>
                  <p className='text-base text-zinc-300 sm:text-lg'>{hoursText}</p>
                </InfoCard>
              ) : null}

              {address ? (
                <InfoCard label='Address'>
                  <p className='text-base text-zinc-300 sm:text-lg'>{address}</p>
                </InfoCard>
              ) : null}
            </div>

            <div className='flex flex-wrap gap-3'>
              <a
                href={googleMapsUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-3 rounded-xl bg-[#f4ede2] px-4 py-3 text-sm font-semibold text-[#181510] transition hover:opacity-90 sm:px-5 sm:text-base'
              >
                <span>↗</span>
                <span>Open in Google Maps</span>
              </a>
            </div>

            <InfoCard label='User photos'>
              {photos.length ? (
                <PhotoGallery photos={photos} />
              ) : (
                <div className='flex flex-col items-center justify-center rounded-3xl border border-[#2a3040] bg-[#101319] px-6 py-12 text-center sm:py-16'>
                  <div className='text-4xl text-[#4a5263] sm:text-5xl'>⌂</div>
                  <p className='mt-5 text-base text-zinc-500 sm:mt-6 sm:text-lg'>
                    No photos yet. Add the first!
                  </p>
                </div>
              )}
            </InfoCard>
          </div>
        ) : null}

        {tab === 'comments' ? (
          <div className='space-y-5'>
            <CommentForm placeId={placeId} slug={slug} userId={userId} />

            {comments.length ? (
              <CommentsList comments={comments} />
            ) : (
              <div className='flex flex-col items-center justify-center rounded-3xl border border-[#2a3040] bg-[#101319] px-6 py-12 text-center sm:py-16'>
                <div className='text-4xl text-[#4a5263] sm:text-5xl'>◔</div>
                <p className='mt-5 text-base text-zinc-500 sm:mt-6 sm:text-lg'>
                  No comments yet. Be the first!
                </p>
              </div>
            )}
          </div>
        ) : null}

        {tab === 'photos' ? (
          <div className='space-y-5'>
            <PhotoUpload placeId={placeId} userId={userId} />

            {photos.length ? (
              <PhotoGallery photos={photos} />
            ) : (
              <div className='flex flex-col items-center justify-center rounded-3xl border border-[#2a3040] bg-[#101319] px-6 py-12 text-center sm:py-16'>
                <button
                  type='button'
                  className='rounded-xl bg-[#f4ede2] px-4 py-3 text-sm font-semibold text-[#181510] transition hover:opacity-90 sm:px-5 sm:text-base'
                >
                  Add Photo
                </button>

                <div className='mt-8 text-4xl text-[#4a5263] sm:mt-10 sm:text-5xl'>⌂</div>
                <p className='mt-5 text-base text-zinc-500 sm:mt-6 sm:text-lg'>
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
