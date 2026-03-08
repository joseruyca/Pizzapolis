'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function saveStarRating(formData: FormData) {
  const placeId = String(formData.get('place_id') || '').trim()
  const slug = String(formData.get('slug') || '').trim()
  const overallRating = Number(formData.get('overall_rating'))

  if (!placeId || !slug || Number.isNaN(overallRating) || overallRating < 1 || overallRating > 5) {
    redirect(`/places/${slug}?error=Invalid rating`)
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?error=You need to sign in before rating`)
  }

  const { error } = await supabase.from('reviews').upsert(
    {
      place_id: placeId,
      user_id: user.id,
      overall_rating: overallRating,
    },
    {
      onConflict: 'place_id,user_id',
    }
  )

  if (error) {
    redirect(`/places/${slug}?error=${encodeURIComponent(error.message)}`)
  }

  redirect(`/places/${slug}?success=Rating saved`)
}

export async function addComment(formData: FormData) {
  const placeId = String(formData.get('place_id') || '').trim()
  const slug = String(formData.get('slug') || '').trim()
  const body = String(formData.get('body') || '').trim()

  if (!placeId || !slug || !body) {
    redirect(`/places/${slug}?error=Missing comment data`)
  }

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/login?error=You need to sign in before commenting`)
  }

  const { error } = await supabase.from('comments').insert({
    place_id: placeId,
    user_id: user.id,
    body,
  })

  if (error) {
    redirect(`/places/${slug}?error=${encodeURIComponent(error.message)}`)
  }

  redirect(`/places/${slug}?success=Comment added`)
}
