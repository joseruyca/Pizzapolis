'use client'

import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useState } from 'react'
import type { DivIcon, LatLngExpression } from 'leaflet'

type RoutePlace = {
  id: string
  slug: string
  name: string
  borough: string | null
  neighborhood: string | null
  latitude: number | null
  longitude: number | null
  cheapest_slice_price: number | null
}

type RouteStop = {
  id: string
  sort_order: number
  stop_note: string | null
  place: RoutePlace | null
}

type ReactLeafletModule = typeof import('react-leaflet')

const defaultCenter: [number, number] = [40.73061, -73.935242]

function makeNumberedPinHtml(index: number) {
  return `
    <div style="position: relative; width: 52px; height: 66px; display:flex; align-items:center; justify-content:center;">
      <div style="
        width: 42px;
        height: 42px;
        border-radius: 9999px;
        background: #ef4444;
        border: 3px solid white;
        box-shadow: 0 0 22px rgba(239,68,68,0.55);
        color: white;
        font-weight: 800;
        font-size: 15px;
        display:flex;
        align-items:center;
        justify-content:center;
      ">${index}</div>
      <div style="
        position:absolute;
        bottom:8px;
        left:50%;
        width:14px;
        height:14px;
        background:#ef4444;
        transform:translateX(-50%) rotate(45deg);
        border-bottom:3px solid white;
        border-right:3px solid white;
      "></div>
    </div>
  `
}

export function RouteMap({ stops }: { stops: RouteStop[] }) {
  const [mounted, setMounted] = useState(false)
  const [rl, setRl] = useState<ReactLeafletModule | null>(null)
  const [icons, setIcons] = useState<Record<string, DivIcon>>({})

  const validStops = useMemo(
    () =>
      stops.filter(
        (stop) =>
          stop.place &&
          typeof stop.place.latitude === 'number' &&
          typeof stop.place.longitude === 'number'
      ),
    [stops]
  )

  const polylinePoints = useMemo(
    () =>
      validStops.map(
        (stop) => [stop.place!.latitude!, stop.place!.longitude!] as LatLngExpression
      ),
    [validStops]
  )

  const center = useMemo(() => {
    if (!validStops.length) return defaultCenter
    return [validStops[0].place!.latitude!, validStops[0].place!.longitude!] as [number, number]
  }, [validStops])

  useEffect(() => {
    let active = true

    async function loadMap() {
      const reactLeaflet = await import('react-leaflet')
      const L = await import('leaflet')

      if (!active) return

      const nextIcons: Record<string, DivIcon> = {}

      validStops.forEach((stop, index) => {
        nextIcons[stop.id] = L.divIcon({
          className: 'custom-route-pin',
          html: makeNumberedPinHtml(index + 1),
          iconSize: [52, 66],
          iconAnchor: [26, 58],
          popupAnchor: [0, -48],
        })
      })

      setRl(reactLeaflet)
      setIcons(nextIcons)
      setMounted(true)
    }

    loadMap()

    return () => {
      active = false
    }
  }, [validStops])

  if (!mounted || !rl) {
    return (
      <div className='flex min-h-[420px] w-full items-center justify-center rounded-[28px] border border-zinc-800 bg-[#080b10] text-zinc-400'>
        Loading route map...
      </div>
    )
  }

  const { MapContainer, Marker, Popup, Polyline, TileLayer, ZoomControl } = rl

  return (
    <div className='overflow-hidden rounded-[28px] border border-zinc-800 bg-black/70 shadow-xl'>
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={true}
        zoomControl={false}
        className='min-h-[420px] w-full'
      >
        <ZoomControl position='topleft' />

        <TileLayer
          attribution='&copy; CARTO'
          url='https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        />

        {polylinePoints.length >= 2 ? (
          <Polyline
            positions={polylinePoints}
            pathOptions={{
              color: '#ef4444',
              weight: 5,
              opacity: 0.85,
            }}
          />
        ) : null}

        {validStops.map((stop, index) => (
          <Marker
            key={stop.id}
            position={[stop.place!.latitude!, stop.place!.longitude!]}
            icon={icons[stop.id]}
          >
            <Popup>
              <div style={{ width: '220px' }}>
                <p style={{ margin: 0, fontSize: '11px', letterSpacing: '.12em', textTransform: 'uppercase', color: '#6b7280' }}>
                  Stop {index + 1}
                </p>

                <h3 style={{ margin: '8px 0 0', fontSize: '18px', fontWeight: 700 }}>
                  {stop.place!.name}
                </h3>

                <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#6b7280' }}>
                  {[stop.place!.neighborhood, stop.place!.borough].filter(Boolean).join(', ')}
                </p>

                {typeof stop.place!.cheapest_slice_price === 'number' ? (
                  <p style={{ margin: '12px 0 0', fontSize: '13px', color: '#374151' }}>
                    <strong>Cheapest slice:</strong> ${stop.place!.cheapest_slice_price}
                  </p>
                ) : null}

                {stop.stop_note ? (
                  <p style={{ margin: '12px 0 0', fontSize: '13px', color: '#4b5563' }}>
                    {stop.stop_note}
                  </p>
                ) : null}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
