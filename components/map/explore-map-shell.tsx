'use client'

import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import {
  List,
  LocateFixed,
  SlidersHorizontal,
  ChevronRight,
  Ruler,
  Check,
  MapPin,
} from 'lucide-react'
import { PlacesMap } from '@/components/map/places-map'
import { PlaceListDrawer } from '@/components/map/place-list-drawer'
import { MapFiltersPanel } from '@/components/map/map-filters-panel'
import { PlacesList } from '@/components/places/places-list'

type Place = {
  id: string
  slug: string
  name: string
  borough: string | null
  neighborhood?: string | null
  address: string | null
  description: string | null
  price_range: string | null
  style_tags: string[] | null
  average_rating: number | null
  review_count: number | null
  hero_image_url?: string | null
  latitude: number
  longitude: number
  cheapest_slice_price?: number | null
  pizza_style?: string | null
  best_known_for?: string | null
  price_updated_at?: string | null
  whole_pie_price?: number | null
  value_score?: number | null
  is_best_under_5?: boolean | null
  is_best_under_10?: boolean | null
  distance_km?: number | null
}

const radiusOptionsKm = [1, 3, 5, 8]

function toMiles(km: number) {
  return km * 0.621371
}

function formatRadiusLabel(radiusKm: number) {
  const miles = toMiles(radiusKm)
  return `${miles < 10 ? miles.toFixed(1) : Math.round(miles)} mi`
}

export function ExploreMapShell({
  places,
  q,
  price,
  style,
  minRating,
  sort,
  lat,
  lng,
  radius,
}: {
  places: Place[]
  q?: string
  price?: string
  style?: string
  minRating?: string
  sort?: string
  lat?: string
  lng?: string
  radius?: string
}) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [listOpen, setListOpen] = useState(false)
  const [locating, setLocating] = useState(false)
  const [radiusMenuOpen, setRadiusMenuOpen] = useState(false)
  const [selectedRadiusKm, setSelectedRadiusKm] = useState<number>(Number(radius || '3'))
  const radiusMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setSelectedRadiusKm(Number(radius || '3'))
  }, [radius])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!radiusMenuRef.current) return
      if (!radiusMenuRef.current.contains(event.target as Node)) {
        setRadiusMenuOpen(false)
      }
    }

    if (radiusMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [radiusMenuOpen])

  function buildExploreUrl(next: {
    nextLat?: string
    nextLng?: string
    nextRadiusKm?: number
    nextSort?: string
  }) {
    const params = new URLSearchParams()

    if (q) params.set('q', q)
    if (price) params.set('price', price)
    if (style) params.set('style', style)
    if (minRating) params.set('minRating', minRating)

    params.set('sort', next.nextSort || sort || 'featured')

    const finalLat = next.nextLat || lat
    const finalLng = next.nextLng || lng

    if (finalLat && finalLng) {
      params.set('lat', finalLat)
      params.set('lng', finalLng)
      params.set('radius', String(next.nextRadiusKm || selectedRadiusKm || 3))
    }

    return `/explorar?${params.toString()}`
  }

  function requestLocationAndGo(nextRadiusKm: number, nextSort = 'nearest') {
    if (!navigator.geolocation) {
      window.alert('Geolocation is not supported in this browser.')
      return
    }

    setLocating(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        window.location.href = buildExploreUrl({
          nextLat: String(position.coords.latitude),
          nextLng: String(position.coords.longitude),
          nextRadiusKm,
          nextSort,
        })
      },
      () => {
        setLocating(false)
        window.alert('Enable location to use distance around you.')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    )
  }

  function useMyLocation() {
    requestLocationAndGo(selectedRadiusKm, 'nearest')
  }

  function applyRadius(nextRadiusKm: number) {
    setSelectedRadiusKm(nextRadiusKm)
    setRadiusMenuOpen(false)

    if (lat && lng) {
      window.location.href = buildExploreUrl({
        nextRadiusKm,
        nextSort: 'nearest',
      })
      return
    }

    requestLocationAndGo(nextRadiusKm, 'nearest')
  }

  return (
    <>
      <section className='grid gap-4 xl:grid-cols-[minmax(0,1.12fr)_400px]'>
        <div className='space-y-4'>
          <div className='relative min-h-[74vh] overflow-hidden rounded-[32px] border border-[#2F343C] bg-[#0F1013] shadow-[0_24px_80px_rgba(0,0,0,0.44)]'>
            <PlacesMap
              places={places}
              userLat={lat ? Number(lat) : undefined}
              userLng={lng ? Number(lng) : undefined}
              radiusKm={selectedRadiusKm}
            />

            <div className='pointer-events-none absolute inset-x-0 top-0 z-[500] p-4'>
              <div className='pointer-events-auto rounded-[28px] border border-[#2F343C] bg-[rgba(23,25,30,0.76)] p-3 shadow-2xl backdrop-blur-xl'>
                <div className='flex items-center gap-3'>
                  <form
                    method='get'
                    action='/explorar'
                    className='flex min-w-0 flex-1 items-center gap-3'
                  >
                    <input type='hidden' name='price' value={price || ''} />
                    <input type='hidden' name='style' value={style || ''} />
                    <input type='hidden' name='minRating' value={minRating || ''} />
                    <input type='hidden' name='sort' value={sort || ''} />
                    <input type='hidden' name='lat' value={lat || ''} />
                    <input type='hidden' name='lng' value={lng || ''} />
                    <input type='hidden' name='radius' value={String(selectedRadiusKm)} />

                    <input
                      type='text'
                      name='q'
                      defaultValue={q || ''}
                      placeholder='Search pizza spots, neighborhood...'
                      className='min-w-0 flex-1 rounded-2xl border border-white/8 bg-[#F4F0E7] px-4 py-3 text-sm text-zinc-900 shadow-xl outline-none placeholder:text-zinc-500'
                    />
                  </form>

                  <button
                    type='button'
                    onClick={() => setFiltersOpen(true)}
                    className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/8 bg-[#8A4B55] text-white shadow-[0_12px_24px_rgba(138,75,85,0.24)] transition hover:bg-[#A35A66]'
                    aria-label='Open filters'
                  >
                    <SlidersHorizontal className='h-5 w-5' />
                  </button>
                </div>
              </div>
            </div>

            <div className='absolute bottom-4 left-4 z-[520] flex items-center gap-2'>
              <button
                type='button'
                onClick={useMyLocation}
                disabled={locating}
                className='inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#2F343C] bg-[rgba(23,25,30,0.94)] text-[#F4F1EA] shadow-xl backdrop-blur transition hover:bg-[#20232A] disabled:opacity-60'
                aria-label='Use my location'
                title='Use my location'
              >
                <LocateFixed className='h-4 w-4' />
              </button>

              <div className='relative' ref={radiusMenuRef}>
                <button
                  type='button'
                  onClick={() => setRadiusMenuOpen((v) => !v)}
                  className='inline-flex items-center gap-2 rounded-full border border-[#2F343C] bg-[rgba(23,25,30,0.94)] px-4 py-3 text-sm font-semibold text-[#F4F1EA] shadow-xl backdrop-blur transition hover:bg-[#20232A]'
                >
                  <Ruler className='h-4 w-4 text-zinc-400' />
                  <span>{formatRadiusLabel(selectedRadiusKm)}</span>
                </button>

                {radiusMenuOpen ? (
                  <div className='absolute bottom-[56px] left-0 w-[190px] rounded-[24px] border border-[#2F343C] bg-[rgba(23,25,30,0.98)] p-3 shadow-[0_24px_60px_rgba(0,0,0,0.42)] backdrop-blur-xl'>
                    <p className='mb-3 text-[11px] uppercase tracking-[0.18em] text-zinc-500'>
                      Distance
                    </p>

                    <div className='space-y-2'>
                      {radiusOptionsKm.map((item) => (
                        <button
                          key={item}
                          type='button'
                          onClick={() => applyRadius(item)}
                          className={`flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-sm transition ${
                            selectedRadiusKm === item
                              ? 'border-[#7C97BB] bg-[#25272E] text-white'
                              : 'border-[#363B45] bg-[#1B1E24] text-zinc-300 hover:bg-[#22262D]'
                          }`}
                        >
                          <span>{formatRadiusLabel(item)}</span>
                          {selectedRadiusKm === item ? (
                            <Check className='h-4 w-4 text-zinc-300' />
                          ) : null}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className='flex items-center justify-between gap-4'>
            <button
              type='button'
              onClick={() => setListOpen(true)}
              className='inline-flex items-center gap-3 rounded-full border border-[#2F343C] bg-[#17191E] px-5 py-3 text-[#F4F1EA] shadow-xl'
            >
              <List className='h-4 w-4 text-zinc-400' />
              <span className='text-base font-medium'>{places.length} places</span>
            </button>

            <Link
              href='/add-place'
              className='inline-flex min-w-[220px] items-center justify-center gap-3 rounded-full bg-[#8A4B55] px-6 py-4 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(138,75,85,0.22)] transition hover:bg-[#A35A66]'
            >
              <MapPin className='h-4 w-4' />
              <span>Suggest a Spot</span>
              <ChevronRight className='h-4 w-4' />
            </Link>
          </div>
        </div>

        <div className='hidden min-h-[74vh] xl:block'>
          <PlaceListDrawer places={places} resultsCount={places.length} />
        </div>
      </section>

      {filtersOpen ? (
        <div className='fixed inset-0 z-[4000]'>
          <button
            type='button'
            onClick={() => setFiltersOpen(false)}
            className='absolute inset-0 bg-black/70 backdrop-blur-sm'
            aria-label='Close filters backdrop'
          />

          <div className='absolute inset-x-0 bottom-0 top-auto sm:inset-0 sm:flex sm:items-center sm:justify-center sm:p-6'>
            <div className='h-[86vh] w-full sm:h-auto sm:max-h-[86vh] sm:max-w-[760px]'>
              <MapFiltersPanel
                q={q}
                price={price}
                style={style}
                minRating={minRating}
                sort={sort}
                lat={lat}
                lng={lng}
                radius={String(selectedRadiusKm)}
                distanceUnit='mi'
                onClose={() => setFiltersOpen(false)}
              />
            </div>
          </div>
        </div>
      ) : null}

      {listOpen ? (
        <div className='fixed inset-0 z-[4000] xl:hidden'>
          <button
            type='button'
            onClick={() => setListOpen(false)}
            className='absolute inset-0 bg-black/70 backdrop-blur-sm'
            aria-label='Close list backdrop'
          />

          <div className='absolute bottom-0 left-0 right-0 max-h-[80vh] rounded-t-[28px] border-t border-[#2F343C] bg-[#17191E] shadow-[0_-20px_60px_rgba(0,0,0,0.65)]'>
            <div className='flex items-center justify-between border-b border-[#2F343C] px-5 py-4'>
              <div className='flex items-center gap-3'>
                <div className='h-1.5 w-10 rounded-full bg-zinc-700' />
                <p className='text-sm uppercase tracking-[0.18em] text-zinc-500'>
                  Places
                </p>
              </div>

              <button
                type='button'
                onClick={() => setListOpen(false)}
                className='rounded-xl border border-[#363B45] px-3 py-2 text-sm text-white transition hover:bg-[#22262D]'
              >
                Close
              </button>
            </div>

            <div className='max-h-[calc(80vh-72px)] overflow-y-auto p-4'>
              <div className='mb-4 rounded-2xl border border-[#2F343C] bg-[#1B1E24] px-4 py-3'>
                <p className='text-sm text-zinc-400'>
                  {places.length} result{places.length === 1 ? '' : 's'}
                </p>
              </div>

              <PlacesList places={places} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
