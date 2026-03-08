import { addReview } from '@/app/places/[slug]/actions'

export function ReviewForm({
  placeId,
  slug,
  userId,
}: {
  placeId: string
  slug: string
  userId?: string
}) {
  if (!userId) {
    return (
      <div className='rounded-3xl border border-zinc-800 bg-zinc-950 p-5'>
        <h3 className='text-base font-semibold text-white'>Leave a review</h3>
        <p className='mt-2 text-sm text-zinc-400'>
          You need to sign in before posting a review.
        </p>
      </div>
    )
  }

  return (
    <form
      action={addReview}
      className='rounded-3xl border border-zinc-800 bg-zinc-950 p-5'
    >
      <input type='hidden' name='place_id' value={placeId} />
      <input type='hidden' name='slug' value={slug} />
      <input type='hidden' name='user_id' value={userId} />

      <h3 className='text-base font-semibold text-white'>Leave a review</h3>

      <div className='mt-4'>
        <label className='mb-2 block text-sm text-zinc-300'>Rating</label>
        <select
          name='overall_rating'
          required
          defaultValue='5'
          className='w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none'
        >
          <option value='5'>5</option>
          <option value='4'>4</option>
          <option value='3'>3</option>
          <option value='2'>2</option>
          <option value='1'>1</option>
        </select>
      </div>

      <div className='mt-4'>
        <label className='mb-2 block text-sm text-zinc-300'>Comment</label>
        <textarea
          name='comment'
          rows={4}
          className='w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none'
          placeholder='Share your experience'
        />
      </div>

      <button
        type='submit'
        className='mt-4 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:opacity-90'
      >
        Submit review
      </button>
    </form>
  )
}
