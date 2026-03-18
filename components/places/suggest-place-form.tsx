'use client'

import { useEffect, useRef, useState } from 'react'
import { createPlace } from '@/app/add-place/actions'
import { SuggestPlacePickerMap } from '@/components/places/suggest-place-picker-map'

declare global {
  interface Window {
    google?: any
  }
}

type SelectedPlace = {
  name: string
  address: string
  latitude: string
  longitude: string
}

export function SuggestPlaceForm() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [apiLoaded, setApiLoaded] = useState(false)
  const [selected, setSelected] = useState<SelectedPlace | null>(null)
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

  useEffect(() => {
    if (!apiKey) return

    if (window.google?.maps?.places) {
      setApiLoaded(true)
      return
    }

    const existing = document.querySelector('script[data-google-places="true"]') as HTMLScriptElement | null

    if (existing) {
      existing.addEventListener('load', () => setApiLoaded(true))
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.dataset.googlePlaces = 'true'
    script.onload = () => setApiLoaded(true)
    document.head.appendChild(script)
  }, [apiKey])

  useEffect(() => {
    if (!apiLoaded || !inputRef.current || !window.google?.maps?.places) return

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      fields: ['name', 'formatted_address', 'geometry'],
      types: ['establishment'],
      componentRestrictions: { country: 'us' },
    })

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      const lat = place?.geometry?.location?.lat?.()
      const lng = place?.geometry?.location?.lng?.()

      const nextSelected = {
        name: place?.name || '',
        address: place?.formatted_address || '',
        latitude: lat ? String(lat) : '',
        longitude: lng ? String(lng) : '',
      }

      setSelected(nextSelected)
      setName(nextSelected.name)
      setAddress(nextSelected.address)
      setLatitude(nextSelected.latitude)
      setLongitude(nextSelected.longitude)
    })
  }, [apiLoaded])

  const canSubmit = !!name.trim() && !!latitude && !!longitude

  return (
    <form action={createPlace} className='space-y-6'>
      <input
        type='text'
        name='website'
        tabIndex={-1}
        autoComplete='off'
        className='hidden'
      />

      <div className='space-y-3'>
        <label className='block text-base text-zinc-300'>Search by address or place name</label>
        <input
          ref={inputRef}
          type='text'
          placeholder={apiKey ? 'Search a place or street…' : 'Google Places key not configured'}
          disabled={!apiKey}
          className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-4 text-white outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed disabled:opacity-60'
        />
        <p className='text-sm text-zinc-500'>
          You can search first, click directly on the map, or use your current location.
        </p>
      </div>

      <div className='grid gap-6 lg:grid-cols-[1fr_320px]'>
        <div className='space-y-6'>
          <SuggestPlacePickerMap
            latitude={latitude}
            longitude={longitude}
            onChange={({ latitude, longitude }) => {
              setLatitude(latitude)
              setLongitude(longitude)
            }}
          />

          <div className='grid gap-5'>
            <div>
              <label className='mb-2 block text-base text-zinc-300'>Place name *</label>
              <input
                type='text'
                name='name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-4 text-white outline-none'
                placeholder="e.g. Joe's Pizza"
              />
            </div>

            <div>
              <label className='mb-2 block text-base text-zinc-300'>Address</label>
              <input
                type='text'
                name='address'
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-4 text-white outline-none'
                placeholder='Optional'
              />
            </div>
          </div>
        </div>

        <div className='space-y-5'>
          <div className='rounded-[28px] border border-zinc-800 bg-zinc-950 p-5'>
            <p className='text-sm uppercase tracking-[0.18em] text-zinc-500'>Quick submit</p>
            <h2 className='mt-3 text-xl font-semibold text-white'>Keep it simple</h2>
            <p className='mt-3 text-sm leading-7 text-zinc-400'>
              Search, drop a pin, add the name, and send it. The exact location matters most.
            </p>
          </div>

          <div>
            <label className='mb-2 block text-base text-zinc-300'>Cheapest slice price</label>
            <input
              type='number'
              step='0.01'
              name='cheapest_slice_price'
              className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-4 text-white outline-none'
              placeholder='e.g. 4.50'
            />
          </div>

          <div>
            <label className='mb-2 block text-base text-zinc-300'>Quick note</label>
            <textarea
              name='description'
              rows={5}
              className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-4 text-white outline-none'
              placeholder='Anything useful about this spot?'
            />
          </div>

          <div className='rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400'>
            Suggestions should go to review first, not directly live.
          </div>

          <button
            type='submit'
            disabled={!canSubmit}
            className='w-full rounded-2xl bg-red-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50'
          >
            Send for review
          </button>
        </div>
      </div>

      <input type='hidden' name='latitude' value={latitude} />
      <input type='hidden' name='longitude' value={longitude} />
      <input type='hidden' name='selected_google_name' value={selected?.name || ''} />
    </form>
  )
}