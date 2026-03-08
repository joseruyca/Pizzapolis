'use server'

import { redirect } from 'next/navigation'
import { createPublicClient } from '@/lib/supabase/public'
import { normalizeTag, slugify } from '@/lib/utils'

function getPriceRangeFromCheapestSlice(price?: number | null) {
  if (typeof price !== 'number' || Number.isNaN(price)) return null
  if (price < 5) return '$'
  if (price < 12) return '$$'
  return '$$$'
}

export async function createPlace(formData: FormData) {
  const name = String(formData.get('name') || '').trim()
  const neighborhood = String(formData.get('neighborhood') || '').trim()
  const borough = String(formData.get('borough') || '').trim()
  const address = String(formData.get('address') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const pizzaStyle = String(formData.get('pizza_style') || '').trim()
  const cheapestSlicePriceRaw = Number(formData.get('cheapest_slice_price'))
  const latitude = Number(formData.get('latitude'))
  const longitude = Number(formData.get('longitude'))

  if (!name || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    redirect('/add-place?error=Please fill in the required fields')
  }

  const baseSlug = slugify(name)
  const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`

  const cheapestSlicePrice = Number.isNaN(cheapestSlicePriceRaw)
    ? null
    : cheapestSlicePriceRaw

  const priceRange = getPriceRangeFromCheapestSlice(cheapestSlicePrice)

  const styleTags = pizzaStyle ? [normalizeTag(pizzaStyle)] : []

  const supabase = createPublicClient()

  const { error } = await supabase.from('places').insert({
    slug,
    name,
    neighborhood: neighborhood || null,
    borough: borough || null,
    address: address || null,
    description: description || null,
    hero_image_url: null,
    price_range: priceRange,
    pizza_style: pizzaStyle || null,
    cheapest_slice_price: cheapestSlicePrice,
    best_known_for: pizzaStyle || null,
    style_tags: styleTags,
    latitude,
    longitude,
    price_updated_at: cheapestSlicePrice !== null ? new Date().toISOString() : null,
  })

  if (error) {
    redirect(`/add-place?error=${encodeURIComponent(error.message)}`)
  }

  redirect(`/explorar?success=Place added successfully`)
}
