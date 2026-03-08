'use client'

import { useState } from 'react'
import { PlacesMap } from '@/components/map/places-map'
import { MapPriceLegend } from '@/components/map/map-price-legend'
import { AddPinFab } from '@/components/map/add-pin-fab'
import { PlaceOverlayPanel } from '@/components/places/place-overlay-panel'
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
}

export function ExploreMapShell({
  places,
  q,
  borough,
  price,
  style,
  minRating,
  sort,
}: {
  places: Place[]
  q?: string
  borough?: string
  price?: string
  style?: string
  minRating?: string
  sort?: string
}) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [listOpen, setListOpen] = useState(false)
  const featuredPlace = places[0] ?? null

  return (
    <>
      <section className='grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_430px]'>
        <div className='relative min-h-[72vh] overflow-hidden rounded-[32px] border border-zinc-800 bg-zinc-900'>
          <PlacesMap places={places} />

          <div className='absolute left-4 right-4 top-4 z-[500] flex items-start justify-between gap-3'>
            <form
              method='get'
              action='/explorar'
              className='flex w-full max-w-[720px] items-center gap-3'
            >
              <input type='hidden' name='borough' value={borough || ''} />
              <input type='hidden' name='price' value={price || ''} />
              <input type='hidden' name='style' value={style || ''} />
              <input type='hidden' name='minRating' value={minRating || ''} />
              <input type='hidden' name='sort' value={sort || ''} />

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

          {filtersOpen ? (
            <div className='absolute left-4 right-4 top-24 z-[520] max-w-[760px] pb-24'>
              <MapFiltersPanel
                q={q}
                borough={borough}
                price={price}
                style={style}
                minRating={minRating}
                sort={sort}
              />
            </div>
          ) : null}

          <div className='absolute left-4 top-28 z-[500] hidden max-w-xs lg:block'>
            <MapPriceLegend />
          </div>

          <div className='absolute bottom-20 left-4 z-[500] hidden max-w-sm lg:block'>
            <PlaceOverlayPanel place={featuredPlace} />
          </div>

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
