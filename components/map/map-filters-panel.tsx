'use client'

import { useMemo, useState } from 'react'

type MapFiltersPanelProps = {
  q?: string
  price?: string
  style?: string
  minRating?: string
  sort?: string
  lat?: string
  lng?: string
  radius?: string
}

const styleOptions = [
  'Classic NY Slice',
  'Neapolitan',
  'Square/Sicilian',
  'Coal-Fired',
  'Wood-Fired',
  'Detroit Style',
  'Grandma Style',
  'Artisan',
  'Late Night',
]

const ratingOptions = ['4.5', '4.0', '3.5']
const radiusOptions = ['1', '3', '5']

const sortOptions = [
  { value: 'featured', label: 'Featured' },
  { value: 'top-rated', label: 'Top rated' },
  { value: 'cheapest', label: 'Cheapest' },
  { value: 'newest', label: 'Newest' },
  { value: 'nearest', label: 'Nearest' },
]

function parseMulti(value?: string) {
  if (!value) return []
  return value.split(',').map((item) => item.trim()).filter(Boolean)
}

function toggleValue(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value]
}

function FilterChip({
  label,
  selected,
  onClick,
}: {
  label: string
  selected?: boolean
  onClick: () => void
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`rounded-2xl border px-4 py-2 text-sm transition ${
        selected
          ? 'border-white bg-zinc-800 text-white'
          : 'border-zinc-600 text-zinc-300 hover:bg-zinc-800'
      }`}
    >
      {label}
    </button>
  )
}

export function MapFiltersPanel({
  q,
  price,
  style,
  minRating,
  sort,
  lat,
  lng,
  radius,
}: MapFiltersPanelProps) {
  const [prices, setPrices] = useState<string[]>(() => parseMulti(price))
  const [styles, setStyles] = useState<string[]>(() => parseMulti(style))
  const [selectedRating, setSelectedRating] = useState(minRating || '')
  const [selectedSort, setSelectedSort] = useState(sort || 'featured')
  const [selectedRadius, setSelectedRadius] = useState(radius || '3')
  const [userLat, setUserLat] = useState(lat || '')
  const [userLng, setUserLng] = useState(lng || '')
  const [locating, setLocating] = useState(false)

  function applyFilters(nextLat = userLat, nextLng = userLng) {
    const params = new URLSearchParams()

    if (q) params.set('q', q)
    if (prices.length) params.set('price', prices.join(','))
    if (styles.length) params.set('style', styles.join(','))
    if (selectedRating) params.set('minRating', selectedRating)
    if (selectedSort) params.set('sort', selectedSort)
    if (nextLat && nextLng) {
      params.set('lat', nextLat)
      params.set('lng', nextLng)
      params.set('radius', selectedRadius || '3')
    }

    window.location.href = `/explorar?${params.toString()}`
  }

  function clearAll() {
    window.location.href = '/explorar'
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      window.alert('Geolocation is not supported in this browser.')
      return
    }

    setLocating(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLat = String(position.coords.latitude)
        const nextLng = String(position.coords.longitude)
        setUserLat(nextLat)
        setUserLng(nextLng)
        setSelectedSort('nearest')
        setLocating(false)
        applyFilters(nextLat, nextLng)
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

  const activeCount = useMemo(() => {
    return prices.length + styles.length + (selectedRating ? 1 : 0) + (userLat && userLng ? 1 : 0)
  }, [prices, styles, selectedRating, userLat, userLng])

  return (
    <div className='max-h-[70vh] overflow-y-auto rounded-[28px] border border-zinc-700 bg-[rgba(10,10,12,0.97)] p-5 shadow-2xl backdrop-blur'>
      <div className='mb-5 flex items-center justify-between gap-4'>
        <div>
          <p className='text-xs uppercase tracking-[0.2em] text-zinc-500'>
            Filters
          </p>
          <p className='mt-1 text-sm text-zinc-400'>
            {activeCount} active filter{activeCount === 1 ? '' : 's'}
          </p>
        </div>

        <button
          type='button'
          onClick={clearAll}
          className='rounded-xl border border-zinc-700 px-3 py-2 text-sm text-white transition hover:bg-zinc-800'
        >
          Clear all
        </button>
      </div>

      <div className='rounded-3xl border border-zinc-800 bg-zinc-950 p-4'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='text-sm font-medium text-white'>Near me</p>
            <p className='mt-1 text-sm text-zinc-500'>
              {userLat && userLng ? 'Location enabled' : 'Use your current location'}
            </p>
          </div>

          <button
            type='button'
            onClick={useMyLocation}
            disabled={locating}
            className='rounded-2xl border border-zinc-700 px-4 py-2 text-sm text-white transition hover:bg-zinc-900 disabled:opacity-60'
          >
            {locating ? 'Locating...' : 'Use my location'}
          </button>
        </div>

        <div className='mt-4'>
          <p className='mb-3 text-xs uppercase tracking-[0.2em] text-zinc-500'>
            Radius
          </p>

          <div className='flex flex-wrap gap-2'>
            {radiusOptions.map((item) => (
              <FilterChip
                key={item}
                label={`${item} km`}
                selected={selectedRadius === item}
                onClick={() => setSelectedRadius(item)}
              />
            ))}
          </div>
        </div>
      </div>

      <div className='mt-6'>
        <p className='mb-3 text-xs uppercase tracking-[0.2em] text-zinc-500'>
          Price range
        </p>

        <div className='flex flex-wrap gap-2'>
          {[
            { value: '$', label: '$ Budget' },
            { value: '$$', label: '$$ Mid' },
            { value: '$$$', label: '$$$ Premium' },
          ].map((item) => (
            <FilterChip
              key={item.value}
              label={item.label}
              selected={prices.includes(item.value)}
              onClick={() => setPrices((prev) => toggleValue(prev, item.value))}
            />
          ))}
        </div>
      </div>

      <div className='mt-6'>
        <p className='mb-3 text-xs uppercase tracking-[0.2em] text-zinc-500'>
          Pizza style
        </p>

        <div className='flex flex-wrap gap-2'>
          {styleOptions.map((item) => (
            <FilterChip
              key={item}
              label={item}
              selected={styles.includes(item)}
              onClick={() => setStyles((prev) => toggleValue(prev, item))}
            />
          ))}
        </div>
      </div>

      <div className='mt-6'>
        <p className='mb-3 text-xs uppercase tracking-[0.2em] text-zinc-500'>
          Minimum rating
        </p>

        <div className='flex flex-wrap gap-2'>
          {ratingOptions.map((item) => (
            <FilterChip
              key={item}
              label={`${item}+`}
              selected={selectedRating === item}
              onClick={() => setSelectedRating(selectedRating === item ? '' : item)}
            />
          ))}
        </div>
      </div>

      <div className='mt-6'>
        <p className='mb-3 text-xs uppercase tracking-[0.2em] text-zinc-500'>
          Sort by
        </p>

        <div className='grid gap-2 sm:grid-cols-2'>
          {sortOptions.map((item) => (
            <button
              key={item.value}
              type='button'
              onClick={() => setSelectedSort(item.value)}
              className={`rounded-2xl border px-4 py-3 text-left text-sm transition ${
                selectedSort === item.value
                  ? 'border-white bg-zinc-800 text-white'
                  : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className='mt-6 grid gap-3 sm:grid-cols-2'>
        <button
          type='button'
          onClick={() => applyFilters()}
          className='rounded-2xl bg-white px-5 py-3 font-medium text-black transition hover:opacity-90'
        >
          Apply filters
        </button>

        <button
          type='button'
          onClick={clearAll}
          className='rounded-2xl border border-zinc-600 px-5 py-3 text-white transition hover:bg-zinc-800'
        >
          Reset
        </button>
      </div>
    </div>
  )
}
