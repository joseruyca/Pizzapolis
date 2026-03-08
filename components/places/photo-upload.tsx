'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'

export function PhotoUpload({
  placeId,
  userId,
}: {
  placeId: string
  userId?: string
}) {
  const [caption, setCaption] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!userId) {
    return (
      <div className='rounded-3xl border border-zinc-800 bg-zinc-950 p-5'>
        <h3 className='text-base font-semibold text-white'>Upload photos</h3>
        <p className='mt-2 text-sm text-zinc-400'>
          You need to sign in before uploading photos.
        </p>
      </div>
    )
  }

  async function handleUpload(formData: FormData) {
    const file = formData.get('photo') as File | null

    if (!file) {
      setMessage('Please select an image')
      return
    }

    startTransition(async () => {
      try {
        const supabase = createClient()
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'
        const fileName = `${placeId}/${crypto.randomUUID()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('place-photos')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          setMessage(uploadError.message)
          return
        }

        const { data: publicUrlData } = supabase.storage
          .from('place-photos')
          .getPublicUrl(fileName)

        const { error: dbError } = await supabase.from('photos').insert({
          place_id: placeId,
          user_id: userId,
          image_url: publicUrlData.publicUrl,
          caption: caption || null,
          is_approved: true,
        })

        if (dbError) {
          setMessage(dbError.message)
          return
        }

        setCaption('')
        setMessage('Photo uploaded successfully')
        window.location.reload()
      } catch {
        setMessage('Something went wrong while uploading the photo')
      }
    })
  }

  return (
    <div className='rounded-3xl border border-zinc-800 bg-zinc-950 p-5'>
      <h3 className='text-base font-semibold text-white'>Upload photos</h3>
      <p className='mt-2 text-sm text-zinc-400'>
        Add real photos to make this place page more useful.
      </p>

      <form action={handleUpload} className='mt-4 space-y-4'>
        <div>
          <label className='mb-2 block text-sm text-zinc-300'>Photo</label>
          <input
            type='file'
            name='photo'
            accept='image/*'
            required
            className='block w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-white'
          />
        </div>

        <div>
          <label className='mb-2 block text-sm text-zinc-300'>Caption</label>
          <input
            type='text'
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder='Fresh slices, outdoor seating, etc.'
            className='w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none'
          />
        </div>

        {message ? (
          <div className='rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300'>
            {message}
          </div>
        ) : null}

        <button
          type='submit'
          disabled={isPending}
          className='rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:opacity-90 disabled:opacity-60'
        >
          {isPending ? 'Uploading...' : 'Upload photo'}
        </button>
      </form>
    </div>
  )
}
