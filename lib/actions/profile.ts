'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const username = String(formData.get('username') || '').trim().toLowerCase()
  const displayName = String(formData.get('display_name') || '').trim()
  const bio = String(formData.get('bio') || '').trim()
  const favoriteBorough = String(formData.get('favorite_borough') || '').trim()
  const favoriteStyle = String(formData.get('favorite_style') || '').trim()

  if (!username || username.length < 3) {
    redirect('/account?error=Username must have at least 3 characters')
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      username,
      display_name: displayName || null,
      bio: bio || null,
      favorite_borough: favoriteBorough || null,
      favorite_style: favoriteStyle || null,
    })
    .eq('id', user.id)

  if (error) {
    redirect(`/account?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/account')
  revalidatePath(`/profile/${username}`)
  redirect('/account?success=Profile updated')
}

export async function followUser(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const followingId = String(formData.get('following_id') || '')
  const username = String(formData.get('username') || '')

  if (!followingId || followingId === user.id) return

  await supabase.from('user_follows').upsert(
    {
      follower_id: user.id,
      following_id: followingId,
    },
    { onConflict: 'follower_id,following_id' }
  )

  revalidatePath('/account')
  revalidatePath(`/profile/${username}`)
}

export async function unfollowUser(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const followingId = String(formData.get('following_id') || '')
  const username = String(formData.get('username') || '')

  await supabase
    .from('user_follows')
    .delete()
    .eq('follower_id', user.id)
    .eq('following_id', followingId)

  revalidatePath('/account')
  revalidatePath(`/profile/${username}`)
}

export async function savePlace(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const placeId = String(formData.get('place_id') || '')
  const slug = String(formData.get('slug') || '')

  if (!placeId) return

  await supabase.from('user_saved_places').upsert(
    {
      user_id: user.id,
      place_id: placeId,
    },
    { onConflict: 'user_id,place_id' }
  )

  revalidatePath('/account')
  revalidatePath(`/places/${slug}`)
}

export async function unsavePlace(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const placeId = String(formData.get('place_id') || '')
  const slug = String(formData.get('slug') || '')

  if (!placeId) return

  await supabase
    .from('user_saved_places')
    .delete()
    .eq('user_id', user.id)
    .eq('place_id', placeId)

  revalidatePath('/account')
  revalidatePath(`/places/${slug}`)
}
