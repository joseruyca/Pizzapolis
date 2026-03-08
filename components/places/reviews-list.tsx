type Review = {
  id: string
  overall_rating: number
  comment: string | null
  created_at: string
  user_id: string
}

export function ReviewsList({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) {
    return (
      <div className='rounded-3xl border border-zinc-800 bg-zinc-950 p-5'>
        <p className='text-base text-zinc-500'>No reviews yet.</p>
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {reviews.map((review) => (
        <article
          key={review.id}
          className='rounded-3xl border border-zinc-800 bg-zinc-950 p-5'
        >
          <div className='flex items-center justify-between gap-4'>
            <p className='text-lg font-semibold text-white'>
              Rating: {review.overall_rating}/5
            </p>
            <p className='text-sm text-zinc-500'>
              {new Date(review.created_at).toLocaleDateString('en-US')}
            </p>
          </div>

          {review.comment ? (
            <p className='mt-4 text-base leading-7 text-zinc-300'>
              {review.comment}
            </p>
          ) : null}
        </article>
      ))}
    </div>
  )
}
