'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function sanitizeOptionalText(value: FormDataEntryValue | null, maxLength: number) {
  const text = String(value || '').trim()
  return text ? text.slice(0, maxLength) : null
}

function parseOptionalPrice(value: FormDataEntryValue | null) {
  const raw = String(value || '').trim()

  if (!raw) return null

  const price = Number(raw)
  return Number.isFinite(price) ? price : Number.NaN
}

export async function createPlace(formData: FormData) {
  const honeypot = String(formData.get('website') || '').trim()

  if (honeypot) {
    redirect('/explorar?success=Thanks! Your spot was sent for review.')
  }

  const name = String(formData.get('name') || '').trim()
  const address = sanitizeOptionalText(formData.get('address'), 180)
  const notes = sanitizeOptionalText(formData.get('description'), 600)

  const latitude = Number(formData.get('latitude'))
  const longitude = Number(formData.get('longitude'))

  const cheapestSlicePrice = parseOptionalPrice(formData.get('cheapest_slice_price'))

  if (!name || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    redirect('/add-place?error=Name and valid map location are required.')
  }

  if (name.length > 120) {
    redirect('/add-place?error=Place name is too long.')
  }

  if (latitude < 40.3 || latitude > 41.1 || longitude < -74.35 || longitude > -73.55) {
    redirect('/add-place?error=That location does not look like NYC.')
  }

  if (
    Number.isNaN(cheapestSlicePrice) ||
    (typeof cheapestSlicePrice === 'number' && (cheapestSlicePrice <= 0 || cheapestSlicePrice > 100))
  ) {
    redirect('/add-place?error=Slice price must be a valid number.')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('place_submissions').insert({
    name,
    address,
    latitude,
    longitude,
    cheapest_slice_price: cheapestSlicePrice,
    notes,
    status: 'pending',
    submitted_by: user?.id ?? null,
  })

  if (error) {
    redirect('/add-place?error=Could not send your suggestion right now. Please try again.')
  }

  redirect('/explorar?success=Thanks! Your spot was sent for review.')
}
