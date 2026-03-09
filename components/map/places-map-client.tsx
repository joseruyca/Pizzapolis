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

function toMiles(km: number) {
  return km * 0.621371
}

function formatMiles(distanceKm: number) {
  return `${toMiles(distanceKm).toFixed(1)} mi away`
}

function formatRadiusMiles(radiusKm: number) {
  return `${toMiles(radiusKm).toFixed(1)} mi`
}

function getRadiusZoom(radiusKm: number) {
  if (radiusKm <= 1) return 15
  if (radiusKm <= 3) return 14
  if (radiusKm <= 5) return 13
  return 12
}

function getPinColor(place: Place) {
  if (place.price_range === '$') return 'green'
  if (place.price_range === '$$$') return 'wine'
  return 'gold'
}

function getStyleTone(place: Place) {
  const style = place.pizza_style?.toLowerCase() || ''

  if (style.includes('sicilian') || style.includes('square')) {
    return {
      line: '#6f88b7',
      chip: '#213042',
      chipText: '#dce7ff',
      button: '#d7a54a',
      buttonText: '#16120b',
    }
  }

  if (style.includes('artisan') || style.includes('coal')) {
    return {
      line: '#d94b5c',
      chip: '#311922',
      chipText: '#ffd9df',
      button: '#f4ede2',
      buttonText: '#181510',
    }
  }

  if (style.includes('classic') || style.includes('ny')) {
    return {
      line: '#d7a54a',
      chip: '#332714',
      chipText: '#ffe8be',
      button: '#f4ede2',
      buttonText: '#181510',
    }
  }

  return {
    line: '#5b8c8a',
    chip: '#183130',
    chipText: '#d5f1ee',
    button: '#f4ede2',
    buttonText: '#181510',
  }
}

function getPinLabel(place: Place) {
  if (typeof place.cheapest_slice_price === 'number') {
    return `$${Math.round(place.cheapest_slice_price)}`
  }

  if (place.price_range === '$') return '$'
  if (place.price_range === '$$$') return '$$$'
  return '$$'
}

function makePinHtml(label: string, color: 'green' | 'gold' | 'wine') {
  const styles = {
    green: {
      bg: '#73B68C',
      glow: '0 0 0 4px rgba(115,182,140,0.18), 0 12px 26px rgba(115,182,140,0.26)',
    },
    gold: {
      bg: '#D7A54A',
      glow: '0 0 0 4px rgba(215,165,74,0.18), 0 12px 26px rgba(215,165,74,0.24)',
    },
    wine: {
      bg: '#D15C70',
      glow: '0 0 0 4px rgba(209,92,112,0.18), 0 12px 26px rgba(209,92,112,0.26)',
    },
  }

  const s = styles[color]

  return `
    <div style="position:relative;width:58px;height:70px;display:flex;align-items:center;justify-content:center;">
      <div style="
        width:46px;
        height:46px;
        border-radius:9999px;
        background:${s.bg};
        box-shadow:${s.glow};
        color:#fffaf2;
        font-weight:800;
        font-size:13px;
        display:flex;
        align-items:center;
        justify-content:center;
        line-height:1;
        letter-spacing:-0.01em;
      ">${label}</div>
      <div style="
        position:absolute;
        bottom:8px;
        left:50%;
        width:14px;
        height:14px;
        background:${s.bg};
        transform:translateX(-50%) rotate(45deg);
        box-shadow:4px 4px 16px rgba(0,0,0,0.18);
      "></div>
    </div>
  `
}

function makeUserHtml() {
  return `
    <div style="position:relative;width:26px;height:26px;display:flex;align-items:center;justify-content:center;">
      <div style="
        position:absolute;
        width:18px;
        height:18px;
        border-radius:9999px;
        background:#6F88B7;
        border:3px solid rgba(255,255,255,0.98);
        box-shadow:0 0 0 10px rgba(111,136,183,0.22);
      "></div>
      <div style="
        position:absolute;
        top:0px;
        width:0;
        height:0;
        border-left:5px solid transparent;
        border-right:5px solid transparent;
        border-bottom:9px solid #EEF4FF;
        transform:translateY(-1px);
        filter:drop-shadow(0 4px 8px rgba(111,136,183,0.25));
      "></div>
    </div>
  `
}

function PopupBadge({
  children,
  bg,
  color,
}: {
  children: React.ReactNode
  bg?: string
  color?: string
}) {
  return (
    <span
      className='inline-flex rounded-full border border-white/8 px-2.5 py-1 text-[11px] font-medium'
      style={{
        background: bg || '#24272E',
        color: color || '#e7e9ee',
      }}
    >
      {children}
    </span>
  )
}

function MapEffects({
  targetCenter,
  zoom,
  hasUserLocation,
  useMapHook,
}: {
  targetCenter: [number, number]
  zoom: number
  hasUserLocation: boolean
  useMapHook: () => any
}) {
  const map = useMapHook()

  useEffect(() => {
    map.invalidateSize()

    if (hasUserLocation) {
      map.flyTo(targetCenter, zoom, {
        animate: true,
        duration: 1.05,
      })
      return
    }

    map.setView(targetCenter, zoom, { animate: true })
  }, [map, targetCenter, zoom, hasUserLocation])

  return null
}

export function PlacesMapClient({
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
          iconAnchor: [29, 60],
          popupAnchor: [0, -46],
        })
      }

      const nextUserIcon = L.divIcon({
        className: 'custom-user-pin',
        html: makeUserHtml(),
        iconSize: [26, 26],
        iconAnchor: [13, 13],
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

  const hasUserLocation = typeof userLat === 'number' && typeof userLng === 'number'

  const center = useMemo(() => {
    if (hasUserLocation) {
      return [userLat as number, userLng as number] as [number, number]
    }

    return places.length > 0
      ? ([places[0].latitude, places[0].longitude] as [number, number])
      : defaultCenter
  }, [places, userLat, userLng, hasUserLocation])

  if (!mounted || !rl) {
    return (
      <div className='flex h-full min-h-[72vh] w-full items-center justify-center bg-[#111216] text-zinc-400'>
        Loading map...
      </div>
    )
  }

  const { MapContainer, Marker, Popup, TileLayer, ZoomControl, useMap, Circle } = rl
  const zoom = hasUserLocation ? getRadiusZoom(radiusKm) : 12

  return (
    <div className='h-full w-full'>
      <style jsx global>{`
        .pizza-popup .leaflet-popup-content-wrapper {
          background: #171922;
          color: #f4f1ea;
          border-radius: 24px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.48);
          padding: 0;
        }

        .pizza-popup .leaflet-popup-content {
          margin: 0;
        }

        .pizza-popup .leaflet-popup-tip {
          background: #171922;
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .pizza-popup .leaflet-popup-close-button {
          color: #9ca3af;
          padding: 12px 12px 0 0;
          font-size: 18px;
        }

        .pizza-popup .leaflet-popup-close-button:hover {
          color: #f4f1ea;
        }
      `}</style>

      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        zoomControl={false}
        className='h-full min-h-[72vh] w-full'
      >
        <ZoomControl position='topleft' />

        <TileLayer
          attribution='&copy; CARTO'
          url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        />

        <MapEffects
          targetCenter={center}
          zoom={zoom}
          hasUserLocation={hasUserLocation}
          useMapHook={useMap}
        />

        {hasUserLocation ? (
          <>
            <Circle
              center={[userLat as number, userLng as number]}
              radius={radiusKm * 1000}
              pathOptions={{
                color: '#B8CAE2',
                weight: 2.5,
                opacity: 0.95,
                fillColor: '#7E98C6',
                fillOpacity: 0.16,
              }}
            />
            <Circle
              center={[userLat as number, userLng as number]}
              radius={radiusKm * 1000}
              pathOptions={{
                color: '#EEF4FF',
                weight: 1,
                opacity: 0.58,
                fillOpacity: 0,
                dashArray: '6 8',
              }}
            />
          </>
        ) : null}

        {hasUserLocation && userIcon ? (
          <Marker position={[userLat as number, userLng as number]} icon={userIcon}>
            <Popup className='pizza-popup'>
              <div className='w-[208px] p-4'>
                <p className='text-[11px] uppercase tracking-[0.16em] text-zinc-500'>
                  Your location
                </p>
                <p className='mt-2 text-sm font-semibold text-[#F4F1EA]'>
                  Radius centered on you
                </p>
                <p className='mt-2 text-xs text-zinc-400'>
                  {formatRadiusMiles(radiusKm)}
                </p>
              </div>
            </Popup>
          </Marker>
        ) : null}

        {places.map((place) => {
          const tone = getStyleTone(place)

          return (
            <Marker
              key={place.id}
              position={[place.latitude, place.longitude]}
              icon={icons[place.id]}
            >
              <Popup className='pizza-popup'>
                <div
                  className='w-[262px] overflow-hidden rounded-[24px]'
                  style={{
                    background: `linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0))`,
                    borderTop: `3px solid ${tone.line}`,
                  }}
                >
                  <div className='p-4'>
                    <div className='flex flex-wrap gap-2'>
                      {place.pizza_style ? (
                        <PopupBadge bg={tone.chip} color={tone.chipText}>
                          {place.pizza_style}
                        </PopupBadge>
                      ) : null}
                      {place.is_best_under_5 ? (
                        <PopupBadge bg='#2f2615' color='#ffe2a6'>Under $5</PopupBadge>
                      ) : null}
                      {place.is_best_under_10 ? (
                        <PopupBadge bg='#2e1d23' color='#ffd9df'>Under $10</PopupBadge>
                      ) : null}
                    </div>

                    <div className='mt-3 flex items-start justify-between gap-3'>
                      <div className='min-w-0'>
                        <h3 className='truncate text-[20px] font-bold text-[#F4F1EA]'>
                          {place.name}
                        </h3>
                        <p className='mt-1 text-[13px] text-zinc-400'>
                          {[place.neighborhood, place.borough].filter(Boolean).join(', ')}
                        </p>
                      </div>

                      {typeof place.cheapest_slice_price === 'number' ? (
                        <div className='rounded-full border border-white/8 bg-[#232734] px-3 py-1.5 text-sm font-semibold text-[#FFF6EA]'>
                          ${place.cheapest_slice_price}
                        </div>
                      ) : null}
                    </div>

                    <div className='mt-4 flex items-center gap-3'>
                      <div className='inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-[#fff1ef]' style={{ background: 'rgba(217,75,92,0.18)' }}>
                        <span>★</span>
                        <span>{place.average_rating ?? 0}</span>
                      </div>

                      <span className='text-[13px] text-zinc-400'>
                        {place.review_count ?? 0} ratings
                      </span>
                    </div>

                    {place.best_known_for ? (
                      <div className='mt-4'>
                        <p className='text-[11px] uppercase tracking-[0.16em] text-zinc-500'>
                          Best known for
                        </p>
                        <p className='mt-1.5 text-[15px] font-semibold text-[#F4F1EA]'>
                          {place.best_known_for}
                        </p>
                      </div>
                    ) : null}

                    <div className='mt-5 flex items-center justify-between gap-3'>
                      <div className='text-xs text-zinc-400'>
                        {typeof place.distance_km === 'number'
                          ? formatMiles(place.distance_km)
                          : getRelativeTimeLabel(place.price_updated_at)}
                      </div>

                      <Link
                        href={`/places/${place.slug}`}
                        className='inline-flex rounded-xl px-4 py-2.5 text-sm font-semibold transition hover:opacity-92'
                        style={{
                          background: tone.button,
                          color: tone.buttonText,
                          boxShadow: '0 10px 24px rgba(0,0,0,0.18)',
                        }}
                      >
                        View place
                      </Link>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
