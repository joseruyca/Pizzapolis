'use client'

import 'leaflet/dist/leaflet.css'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import type { DivIcon } from 'leaflet'
import { getRelativeTimeLabel } from '@/lib/time'

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

type ReactLeafletModule = typeof import('react-leaflet')

const defaultCenter: [number, number] = [40.73061, -73.935242]

function getPinColor(place: Place) {
  if (place.price_range === '$') return 'green'
  if (place.price_range === '$$$') return 'red'
  return 'yellow'
}

function getPinLabel(place: Place) {
  if (typeof place.cheapest_slice_price === 'number') {
    return `$${Math.round(place.cheapest_slice_price)}`
  }

  if (place.price_range === '$') return '$'
  if (place.price_range === '$$$') return '$$$'
  return '$$'
}

function makePinHtml(label: string, color: 'green' | 'yellow' | 'red') {
  const styles = {
    green: { bg: '#22c55e', glow: '0 0 22px rgba(34,197,94,0.6)' },
    yellow: { bg: '#fbbf24', glow: '0 0 22px rgba(251,191,36,0.6)' },
    red: { bg: '#ef4444', glow: '0 0 22px rgba(239,68,68,0.6)' },
  }

  const s = styles[color]

  return `
    <div style="position: relative; width: 58px; height: 70px; display:flex; align-items:center; justify-content:center;">
      <div style="
        width: 46px;
        height: 46px;
        border-radius: 9999px;
        background: ${s.bg};
        border: 3px solid white;
        box-shadow: ${s.glow};
        color: white;
        font-weight: 800;
        font-size: 14px;
        display:flex;
        align-items:center;
        justify-content:center;
        line-height:1;
      ">${label}</div>
      <div style="
        position:absolute;
        bottom:8px;
        left:50%;
        width:14px;
        height:14px;
        background:${s.bg};
        transform:translateX(-50%) rotate(45deg);
        border-bottom:3px solid white;
        border-right:3px solid white;
      "></div>
    </div>
  `
}

function badgeHtml(label: string) {
  return `
    <span style="
      display:inline-flex;
      align-items:center;
      border:1px solid rgba(127,29,29,.45);
      background:rgba(120,10,10,.08);
      border-radius:9999px;
      padding:4px 8px;
      font-size:11px;
      font-weight:700;
      color:#991b1b;
      margin-right:6px;
      margin-bottom:6px;
    ">${label}</span>
  `
}

export function PlacesMapClient({
  places,
  userLat,
  userLng,
}: {
  places: Place[]
  userLat?: number
  userLng?: number
}) {
  const [mounted, setMounted] = useState(false)
  const [rl, setRl] = useState<ReactLeafletModule | null>(null)
  const [icons, setIcons] = useState<Record<string, DivIcon>>({})
  const [userIcon, setUserIcon] = useState<DivIcon | null>(null)

  useEffect(() => {
    let active = true

    async function loadMap() {
      const reactLeaflet = await import('react-leaflet')
      const L = await import('leaflet')

      if (!active) return

      const nextIcons: Record<string, DivIcon> = {}

      for (const place of places) {
        const color = getPinColor(place)
        const label = getPinLabel(place)

        nextIcons[place.id] = L.divIcon({
          className: 'custom-price-pin',
          html: makePinHtml(label, color),
          iconSize: [58, 70],
          iconAnchor: [29, 62],
          popupAnchor: [0, -52],
        })
      }

      const nextUserIcon = L.divIcon({
        className: 'custom-user-pin',
        html: `
          <div style="width:18px;height:18px;border-radius:9999px;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 8px rgba(59,130,246,0.18);"></div>
        `,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      })

      setRl(reactLeaflet)
      setIcons(nextIcons)
      setUserIcon(nextUserIcon)
      setMounted(true)
    }

    loadMap()

    return () => {
      active = false
    }
  }, [places])

  const center = useMemo(() => {
    if (typeof userLat === 'number' && typeof userLng === 'number') {
      return [userLat, userLng] as [number, number]
    }

    return places.length > 0
      ? ([places[0].latitude, places[0].longitude] as [number, number])
      : defaultCenter
  }, [places, userLat, userLng])

  if (!mounted || !rl) {
    return (
      <div className='flex h-full min-h-[72vh] w-full items-center justify-center bg-[#080b10] text-zinc-400'>
        Loading map...
      </div>
    )
  }

  const { MapContainer, Marker, Popup, TileLayer, ZoomControl } = rl

  return (
    <div className='h-full w-full'>
      <MapContainer
        center={center}
        zoom={typeof userLat === 'number' && typeof userLng === 'number' ? 13 : 12}
        scrollWheelZoom={true}
        zoomControl={false}
        className='h-full min-h-[72vh] w-full'
      >
        <ZoomControl position='topleft' />

        <TileLayer
          attribution='&copy; CARTO'
          url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        />

        {typeof userLat === 'number' && typeof userLng === 'number' && userIcon ? (
          <Marker position={[userLat, userLng]} icon={userIcon}>
            <Popup>
              <div style={{ fontWeight: 600 }}>Your location</div>
            </Popup>
          </Marker>
        ) : null}

        {places.map((place) => (
          <Marker
            key={place.id}
            position={[place.latitude, place.longitude]}
            icon={icons[place.id]}
          >
            <Popup>
              <div style={{ width: '260px' }}>
                <div style={{ marginBottom: '10px' }}>
                  {place.pizza_style ? (
                    <div style={{
                      display: 'inline-flex',
                      border: '1px solid rgba(127,29,29,.45)',
                      background: 'rgba(120,10,10,.08)',
                      borderRadius: '10px',
                      padding: '4px 8px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#1f2937',
                      marginBottom: '8px'
                    }}>
                      {place.pizza_style}
                    </div>
                  ) : null}

                  <div>
                    {place.is_best_under_5 ? (
                      <span dangerouslySetInnerHTML={{ __html: badgeHtml('Best under $5') }} />
                    ) : null}
                    {place.is_best_under_10 ? (
                      <span dangerouslySetInnerHTML={{ __html: badgeHtml('Best under $10') }} />
                    ) : null}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{place.name}</h3>
                    <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#6b7280' }}>
                      {[place.neighborhood, place.borough].filter(Boolean).join(', ')}
                    </p>
                  </div>

                  {typeof place.cheapest_slice_price === 'number' ? (
                    <div style={{
                      border: '1px solid #d1d5db',
                      borderRadius: '9999px',
                      padding: '6px 10px',
                      height: 'fit-content',
                      fontWeight: 700
                    }}>
                      ${place.cheapest_slice_price}
                    </div>
                  ) : null}
                </div>

                <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderRadius: '12px',
                    background: 'rgba(127,29,29,.12)',
                    padding: '8px 10px',
                    fontWeight: 700,
                    color: '#b91c1c'
                  }}>
                    <span>★</span>
                    <span>{place.average_rating ?? 0}</span>
                  </div>

                  <span style={{ fontSize: '13px', color: '#6b7280' }}>
                    {place.review_count ?? 0} ratings
                  </span>
                </div>

                <div style={{ marginTop: '14px', display: 'grid', gap: '8px' }}>
                  {typeof place.cheapest_slice_price === 'number' ? (
                    <p style={{ margin: 0, fontSize: '13px', color: '#374151' }}>
                      <strong>Cheapest slice:</strong> ${place.cheapest_slice_price}
                    </p>
                  ) : null}

                  {typeof place.whole_pie_price === 'number' ? (
                    <p style={{ margin: 0, fontSize: '13px', color: '#374151' }}>
                      <strong>Whole pie:</strong> ${place.whole_pie_price}
                    </p>
                  ) : null}

                  {typeof place.value_score === 'number' ? (
                    <p style={{ margin: 0, fontSize: '13px', color: '#374151' }}>
                      <strong>Value score:</strong> {place.value_score}/10
                    </p>
                  ) : null}
                </div>

                {typeof place.distance_km === 'number' ? (
                  <p style={{ marginTop: '12px', fontSize: '12px', color: '#6b7280' }}>
                    {place.distance_km.toFixed(1)} km away
                  </p>
                ) : null}

                {place.best_known_for ? (
                  <div style={{ marginTop: '14px' }}>
                    <p style={{
                      margin: 0,
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '.12em',
                      color: '#6b7280'
                    }}>
                      Best known for
                    </p>
                    <p style={{ margin: '6px 0 0', fontSize: '15px', fontWeight: 700 }}>
                      {place.best_known_for}
                    </p>
                  </div>
                ) : null}

                <p style={{ marginTop: '14px', fontSize: '12px', color: '#6b7280' }}>
                  {getRelativeTimeLabel(place.price_updated_at)}
                </p>

                <div style={{ marginTop: '16px' }}>
                  <Link
                    href={`/places/${place.slug}`}
                    style={{
                      display: 'inline-block',
                      borderRadius: '12px',
                      background: '#111827',
                      color: 'white',
                      padding: '10px 14px',
                      fontSize: '14px',
                      fontWeight: 600,
                      textDecoration: 'none'
                    }}
                  >
                    View place
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
