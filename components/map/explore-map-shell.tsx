'use client'

import Link from 'next/link'
import { useState } from 'react'
import { PlacesMap } from '@/components/map/places-map'
import { AddPinFab } from '@/components/map/add-pin-fab'
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
  distance_km?: number | null
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

  function useMyLocation() {
    if (!navigator.geolocation) {
      window.alert('Geolocation is not supported in this browser.')
      return
    }

    setLocating(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const params = new URLSearchParams()

        if (q) params.set('q', q)
        if (price) params.set('price', price)
        if (style) params.set('style', style)
        if (minRating) params.set('minRating', minRating)
        params.set('sort', 'nearest')
        params.set('lat', String(position.coords.latitude))
        params.set('lng', String(position.coords.longitude))
        params.set('radius', radius || '3')

        window.location.href = `/explorar?${params.toString()}`
      },
      () => {
        setLocating(false)
        window.alert('Location permission was denied or unavailable.')
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    )
  }

  return (
    <>
      <section className='grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_430px]'>
        <div className='space-y-4'>
          <div className='relative min-h-[72vh] overflow-hidden rounded-[32px] border border-zinc-800 bg-zinc-900'>
            <PlacesMap
              places={places}
              userLat={lat ? Number(lat) : undefined}
              userLng={lng ? Number(lng) : undefined}
            />

            <div className='absolute left-4 right-4 top-4 z-[500] flex flex-col gap-3'>
              <div className='flex items-start justify-between gap-3'>
                <form
                  method='get'
                  action='/explorar'
                  className='flex w-full max-w-[720px] items-center gap-3'
                >
                  <input type='hidden' name='price' value={price || ''} />
                  <input type='hidden' name='style' value={style || ''} />
                  <input type='hidden' name='minRating' value={minRating || ''} />
                  <input type='hidden' name='sort' value={sort || ''} />
                  <input type='hidden' name='lat' value={lat || ''} />
                  <input type='hidden' name='lng' value={lng || ''} />
                  <input type='hidden' name='radius' value={radius || ''} />

                  <input
                    type='text'
                    name='q'
                    defaultValue={q || ''}
                    placeholder='Search pizza spots, neighborhood...'
                    className='min-w-0 flex-1 rounded-2xl bg-white/95 px-4 py-3 text-sm text-zinc-900 shadow-xl outline-none backdrop-blur placeholder:text-zinc-500'
                  />

                  <button
                    type='submit'
                    className='hidden rounded-2xl bg-white px-4 py-3 text-sm font-medium text-black shadow-xl transition hover:opacity-90 sm:inline-flex'
                  >
                    Search
                  </button>

                  <button
                    type='button'
                    onClick={() => setFiltersOpen((v) => !v)}
                    className='flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-red-600 text-xl text-white shadow-2xl transition hover:bg-red-500'
                    aria-label='Open filters'
                  >
                    ☷
                  </button>
                </form>
              </div>
            </div>

            {filtersOpen ? (
              <div className='absolute left-4 right-4 top-24 z-[520] max-w-[760px] pb-24'>
                <MapFiltersPanel
                  q={q}
                  price={price}
                  style={style}
                  minRating={minRating}
                  sort={sort}
                  lat={lat}
                  lng={lng}
                  radius={radius}
                />
              </div>
            ) : null}

            <button
              type='button'
              onClick={useMyLocation}
              disabled={locating}
              className='absolute right-4 top-28 z-[500] flex h-12 w-12 items-center justify-center rounded-full border border-zinc-700 bg-[rgba(10,10,12,0.94)] text-white shadow-2xl backdrop-blur transition hover:bg-zinc-900 disabled:opacity-60'
              aria-label='Use my location'
              title='Use my location'
            >
              {locating ? '…' : '◎'}
            </button>

            <div className='absolute bottom-20 right-4 z-[500]'>
              <AddPinFab />
            </div>

            <div className='absolute bottom-4 left-1/2 z-[500] -translate-x-1/2'>
              <button
                type='button'
                onClick={() => setListOpen(true)}
                className='flex items-center gap-3 rounded-full border border-zinc-800 bg-[rgba(10,10,12,0.94)] px-5 py-3 text-white shadow-2xl backdrop-blur'
              >
                <span className='text-zinc-400'>☰</span>
                <span className='text-base font-medium'>{places.length} places</span>
                <span className='text-zinc-400'>⌃</span>
              </button>
            </div>
          </div>

          <div className='flex justify-center'>
            <Link
              href='/add-place'
              className='inline-flex items-center gap-3 rounded-full bg-red-600 px-6 py-4 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(239,68,68,0.35)] transition hover:bg-red-500'
            >
              <span>📍</span>
              <span>Suggest a Spot</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        <div className='hidden min-h-[72vh] xl:block'>
          <PlaceListDrawer places={places} resultsCount={places.length} />
        </div>
      </section>

      {listOpen ? (
        <div className='fixed inset-0 z-[4000] xl:hidden'>
          <button
            type='button'
            onClick={() => setListOpen(false)}
            className='absolute inset-0 bg-black/70 backdrop-blur-sm'
            aria-label='Close list backdrop'
          />

          <div className='absolute bottom-0 left-0 right-0 max-h-[78vh] rounded-t-[28px] border-t border-zinc-800 bg-[#090909] shadow-[0_-20px_60px_rgba(0,0,0,0.65)]'>
            <div className='flex items-center justify-between border-b border-zinc-800 px-5 py-4'>
              <div className='flex items-center gap-3'>
                <div className='h-1.5 w-10 rounded-full bg-zinc-700' />
                <p className='text-sm uppercase tracking-[0.18em] text-zinc-500'>
                  Places
                </p>
              </div>

              <button
                type='button'
                onClick={() => setListOpen(false)}
                className='rounded-xl border border-zinc-800 px-3 py-2 text-sm text-white transition hover:bg-zinc-900'
              >
                Close
              </button>
            </div>

            <div className='max-h-[calc(78vh-72px)] overflow-y-auto p-4'>
              <div className='mb-4 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3'>
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
