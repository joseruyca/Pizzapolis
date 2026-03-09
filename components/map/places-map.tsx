'use client'

import { PlacesMapClient } from '@/components/map/places-map-client'

type Place = {
  id: string
  slug: string
  name: string
  borough: string | null
  neighborhood?: string | null
  address: string | null
  latitude: number
  longitude: number
  average_rating: number | null
  review_count: number | null
  price_range?: string | null
  cheapest_slice_price?: number | null
  whole_pie_price?: number | null
  value_score?: number | null
  is_best_under_5?: boolean | null
  is_best_under_10?: boolean | null
  pizza_style?: string | null
  best_known_for?: string | null
  price_updated_at?: string | null
  distance_km?: number | null
}

export function PlacesMap({
  places,
  userLat,
  userLng,
  radiusKm,
}: {
  places: Place[]
  userLat?: number
  userLng?: number
  radiusKm: number
}) {
  return (
    <PlacesMapClient
      places={places}
      userLat={userLat}
      userLng={userLng}
      radiusKm={radiusKm}
    />
  )
}
