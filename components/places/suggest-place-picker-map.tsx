'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useState } from 'react'
import type { DivIcon, LeafletMouseEvent } from 'leaflet'

type ReactLeafletModule = typeof import('react-leaflet')

const defaultCenter: [number, number] = [40.73061, -73.935242]

function makePinHtml() {
  return `
    <div style="position:relative;width:30px;height:42px;display:flex;align-items:center;justify-content:center;">
      <div style="
        width:22px;
        height:22px;
        border-radius:9999px;
        background:#d94b5c;
        border:3px solid rgba(255,255,255,0.95);
        box-shadow:0 8px 20px rgba(217,75,92,0.35);
      "></div>
      <div style="
        position:absolute;
        bottom:4px;
        left:50%;
        width:12px;
        height:12px;
        background:#d94b5c;
        transform:translateX(-50%) rotate(45deg);
      "></div>
    </div>
  `
}

function makeUserHtml() {
  return `
    <div style="position:relative;width:22px;height:22px;">
      <div style="
        width:16px;
        height:16px;
        border-radius:9999px;
        background:#6f88b7;
        border:3px solid rgba(255,255,255,0.98);
        box-shadow:0 0 0 10px rgba(111,136,183,0.22);
      "></div>
    </div>
  `
}

export function SuggestPlacePickerMap({
  latitude,
  longitude,
  onChange,
}: {
  latitude: string
  longitude: string
  onChange: (coords: { latitude: string; longitude: string }) => void
}) {
  const [mounted, setMounted] = useState(false)
  const [rl, setRl] = useState<ReactLeafletModule | null>(null)
  const [pinIcon, setPinIcon] = useState<DivIcon | null>(null)
  const [userIcon, setUserIcon] = useState<DivIcon | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter)
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null)

  const selectedPosition = useMemo<[number, number] | null>(() => {
    if (!latitude || !longitude) return null
    const lat = Number(latitude)
    const lng = Number(longitude)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
    return [lat, lng]
  }, [latitude, longitude])

  useEffect(() => {
    setMounted(true)

    let active = true

    async function loadMap() {
      const reactLeaflet = await import('react-leaflet')
      const L = await import('leaflet')

      if (!active) return

      setRl(reactLeaflet)

      setPinIcon(
        L.divIcon({
          className: 'suggest-place-pin',
          html: makePinHtml(),
          iconSize: [30, 42],
          iconAnchor: [15, 36],
        })
      )

      setUserIcon(
        L.divIcon({
          className: 'suggest-place-user',
          html: makeUserHtml(),
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        })
      )
    }

    loadMap()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (selectedPosition) {
      setMapCenter(selectedPosition)
      return
    }

    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next: [number, number] = [position.coords.latitude, position.coords.longitude]
        setUserPosition(next)
        setMapCenter(next)
      },
      () => {},
      {
        enableHighAccuracy: true,
        timeout: 7000,
        maximumAge: 60000,
      }
    )
  }, [selectedPosition])

  if (!mounted || !rl || !pinIcon || !userIcon) {
    return (
      <div className='flex h-[360px] items-center justify-center rounded-[28px] border border-zinc-800 bg-zinc-950 text-sm text-zinc-500'>
        Loading map…
      </div>
    )
  }

  const { MapContainer, TileLayer, Marker, useMap, useMapEvents } = rl

  function ClickHandler() {
    useMapEvents({
      click(event: LeafletMouseEvent) {
        onChange({
          latitude: String(event.latlng.lat),
          longitude: String(event.latlng.lng),
        })
      },
    })

    return null
  }

  function SyncView() {
    const map = useMap()

    useEffect(() => {
      const target = selectedPosition || mapCenter
      map.setView(target, selectedPosition ? 16 : 13, { animate: true })
      setTimeout(() => map.invalidateSize(), 50)
    }, [map])

    useEffect(() => {
      const target = selectedPosition || mapCenter
      map.setView(target, selectedPosition ? 16 : 13, { animate: true })
    }, [map, selectedPosition, mapCenter])

    return null
  }

  return (
    <div className='overflow-hidden rounded-[28px] border border-zinc-800 bg-zinc-950'>
      <div className='flex items-center justify-between gap-4 border-b border-zinc-800 px-4 py-3'>
        <div>
          <p className='text-sm font-medium text-white'>Pin the exact spot</p>
          <p className='text-xs text-zinc-500'>Click the map to drop the pin. Drag it to fine-tune.</p>
        </div>

        <button
          type='button'
          onClick={() => {
            if (!navigator.geolocation) return

            navigator.geolocation.getCurrentPosition(
              (position) => {
                const next = {
                  latitude: String(position.coords.latitude),
                  longitude: String(position.coords.longitude),
                }
                setUserPosition([position.coords.latitude, position.coords.longitude])
                setMapCenter([position.coords.latitude, position.coords.longitude])
                onChange(next)
              },
              () => {},
              {
                enableHighAccuracy: true,
                timeout: 7000,
                maximumAge: 60000,
              }
            )
          }}
          className='rounded-xl border border-zinc-700 px-3 py-2 text-xs font-medium text-white transition hover:bg-zinc-900'
        >
          Use my location
        </button>
      </div>

      <div className='h-[360px]'>
        <MapContainer
          center={selectedPosition || mapCenter}
          zoom={selectedPosition ? 16 : 13}
          scrollWheelZoom
          className='h-full w-full'
        >
          <SyncView />
          <ClickHandler />

          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />

          {userPosition ? <Marker position={userPosition} icon={userIcon} /> : null}

          {selectedPosition ? (
            <Marker
              position={selectedPosition}
              icon={pinIcon}
              draggable
              eventHandlers={{
                dragend: (event: any) => {
                  const marker = event.target
                  const pos = marker.getLatLng()
                  onChange({
                    latitude: String(pos.lat),
                    longitude: String(pos.lng),
                  })
                },
              }}
            />
          ) : null}
        </MapContainer>
      </div>

      <div className='grid gap-3 border-t border-zinc-800 px-4 py-3 sm:grid-cols-2'>
        <div className='rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3'>
          <p className='text-[11px] uppercase tracking-[0.18em] text-zinc-500'>Latitude</p>
          <p className='mt-1 text-sm text-zinc-200'>{latitude || 'Not selected yet'}</p>
        </div>

        <div className='rounded-2xl border border-zinc-800 bg-black/40 px-4 py-3'>
          <p className='text-[11px] uppercase tracking-[0.18em] text-zinc-500'>Longitude</p>
          <p className='mt-1 text-sm text-zinc-200'>{longitude || 'Not selected yet'}</p>
        </div>
      </div>
    </div>
  )
}
