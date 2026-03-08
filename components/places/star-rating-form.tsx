'use client'

import { useRef } from 'react'
import { saveStarRating } from '@/app/places/[slug]/actions'

export function StarRatingForm({
  placeId,
  slug,
  userId,
  initialRating = 0,
}: {
  placeId: string
  slug: string
  userId?: string
  initialRating?: number
}) {
  const formRef = useRef<HTMLFormElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  if (!userId) {
    return (
      <div className='mt-4'>
        <div className='flex gap-2 text-3xl text-zinc-600'>
          <span>★</span>
          <span>★</span>
          <span>★</span>
          <span>★</span>
          <span>★</span>
        </div>

        <p className='mt-3 text-sm text-zinc-500'>
          Sign in to rate this place.
        </p>
      </div>
    )
  }

  function handleRate(value: number) {
    if (!inputRef.current || !formRef.current) return
    inputRef.current.value = String(value)
    formRef.current.requestSubmit()
  }

  return (
    <form ref={formRef} action={saveStarRating} className='mt-4'>
      <input type='hidden' name='place_id' value={placeId} />
      <input type='hidden' name='slug' value={slug} />
      <input ref={inputRef} type='hidden' name='overall_rating' value={initialRating || 0} />

      <div className='flex gap-2'>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type='button'
            onClick={() => handleRate(star)}
            className={`text-3xl transition ${
              star <= initialRating
                ? 'text-amber-400'
                : 'text-zinc-600 hover:text-zinc-400'
            }`}
            aria-label={`Rate ${star} stars`}
            title={`Rate ${star} stars`}
          >
            ★
          </button>
        ))}
      </div>
    </form>
  )
}
