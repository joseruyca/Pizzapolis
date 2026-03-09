'use client'

import { useMemo, useState } from 'react'
import {
  Search,
  ChevronDown,
  ChevronUp,
  Star,
  DollarSign,
  MapPin,
  Trash2,
  RotateCcw,
  Save,
  Tags,
} from 'lucide-react'

type PlaceItem = {
  id: string
  slug: string
  name: string
  borough: string | null
  neighborhood: string | null
  pizza_style: string | null
  best_known_for: string | null
  best_slice: string | null
  best_whole_pie: string | null
  first_order_recommendation: string | null
  why_go: string | null
  price_confidence: string | null
  cheapest_slice_price: number | null
  whole_pie_price: number | null
  value_score: number | null
  is_best_under_5: boolean | null
  is_best_under_10: boolean | null
  is_late_night: boolean | null
  is_worth_the_trip: boolean | null
  is_first_timer_friendly: boolean | null
  price_range: string | null
  average_rating: number | null
  is_deleted: boolean | null
  deleted_at: string | null
}

type PlacesClientProps = {
  places: PlaceItem[]
  updatePlaceBasics: (formData: FormData) => Promise<void>
  softDeletePlace: (formData: FormData) => Promise<void>
  restorePlace: (formData: FormData) => Promise<void>
  deletePlace: (formData: FormData) => Promise<void>
}

function QuickBadge({
  label,
  active,
}: {
  label: string
  active?: boolean | null
}) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs ${
        active
          ? 'border-red-800 bg-red-950 text-red-200'
          : 'border-zinc-800 bg-zinc-950 text-zinc-500'
      }`}
    >
      {label}
    </span>
  )
}

export function PlacesClient({
  places,
  updatePlaceBasics,
  softDeletePlace,
  restorePlace,
  deletePlace,
}: PlacesClientProps) {
  const [query, setQuery] = useState('')
  const [borough, setBorough] = useState('all')
  const [status, setStatus] = useState('all')
  const [expandedId, setExpandedId] = useState<string | null>(places[0]?.id ?? null)

  const boroughs = useMemo(() => {
    return Array.from(new Set(places.map((p) => p.borough).filter(Boolean))) as string[]
  }, [places])

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      const matchesQuery =
        !query ||
        [
          place.name,
          place.slug,
          place.borough,
          place.neighborhood,
          place.pizza_style,
          place.best_known_for,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(query.toLowerCase())

      const matchesBorough = borough === 'all' || place.borough === borough

      const matchesStatus =
        status === 'all' ||
        (status === 'active' && !place.is_deleted) ||
        (status === 'deleted' && place.is_deleted) ||
        (status === 'under5' && place.is_best_under_5) ||
        (status === 'under10' && place.is_best_under_10) ||
        (status === 'late' && place.is_late_night)

      return matchesQuery && matchesBorough && matchesStatus
    })
  }, [places, query, borough, status])

  return (
    <div className='space-y-5'>
      <div className='rounded-[28px] border border-zinc-800 bg-[#0e0e10]/90 p-5 shadow-xl'>
        <div className='grid gap-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr]'>
          <div className='relative'>
            <Search className='pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500' />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Search by place, borough, style, slug...'
              className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 py-3 pl-11 pr-4 text-white outline-none'
            />
          </div>

          <select
            value={borough}
            onChange={(e) => setBorough(e.target.value)}
            className='rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none'
          >
            <option value='all'>All boroughs</option>
            {boroughs.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className='rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none'
          >
            <option value='all'>All statuses</option>
            <option value='active'>Active only</option>
            <option value='deleted'>Soft deleted</option>
            <option value='under5'>Best under $5</option>
            <option value='under10'>Best under $10</option>
            <option value='late'>Late night</option>
          </select>
        </div>

        <div className='mt-4 flex flex-wrap items-center gap-3 text-sm text-zinc-400'>
          <span>{filteredPlaces.length} places shown</span>
          <span>·</span>
          <span>{places.length} total loaded</span>
        </div>
      </div>

      <div className='space-y-4'>
        {filteredPlaces.map((place) => {
          const expanded = expandedId === place.id

          return (
            <div
              key={place.id}
              className='rounded-[28px] border border-zinc-800 bg-[#0e0e10]/90 shadow-xl'
            >
              <button
                type='button'
                onClick={() => setExpandedId(expanded ? null : place.id)}
                className='flex w-full items-center justify-between gap-4 p-5 text-left'
              >
                <div className='min-w-0'>
                  <div className='flex flex-wrap items-center gap-3'>
                    <h2 className='text-xl font-semibold text-white'>{place.name}</h2>

                    {place.is_deleted ? (
                      <span className='rounded-full border border-yellow-800 bg-yellow-950 px-3 py-1 text-xs text-yellow-200'>
                        Soft deleted
                      </span>
                    ) : null}
                  </div>

                  <div className='mt-3 flex flex-wrap items-center gap-4 text-sm text-zinc-400'>
                    <span className='inline-flex items-center gap-2'>
                      <MapPin className='h-4 w-4' />
                      {[place.neighborhood, place.borough].filter(Boolean).join(', ') || 'No area'}
                    </span>

                    <span className='inline-flex items-center gap-2'>
                      <Star className='h-4 w-4' />
                      {place.average_rating ?? 0}
                    </span>

                    <span className='inline-flex items-center gap-2'>
                      <DollarSign className='h-4 w-4' />
                      {place.price_range ?? 'n/a'}
                    </span>

                    <span className='inline-flex items-center gap-2'>
                      <Tags className='h-4 w-4' />
                      {place.pizza_style ?? 'No style'}
                    </span>
                  </div>

                  <div className='mt-3 flex flex-wrap gap-2'>
                    <QuickBadge label='Best under $5' active={place.is_best_under_5} />
                    <QuickBadge label='Best under $10' active={place.is_best_under_10} />
                    <QuickBadge label='Late night' active={place.is_late_night} />
                    <QuickBadge label='Worth the trip' active={place.is_worth_the_trip} />
                    <QuickBadge label='First-timer friendly' active={place.is_first_timer_friendly} />
                  </div>
                </div>

                <div className='shrink-0 rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-zinc-400'>
                  {expanded ? <ChevronUp className='h-5 w-5' /> : <ChevronDown className='h-5 w-5' />}
                </div>
              </button>

              {expanded ? (
                <div className='border-t border-zinc-800 p-5'>
                  <form action={updatePlaceBasics} className='space-y-6'>
                    <input type='hidden' name='id' value={place.id} />

                    <div className='grid gap-6 xl:grid-cols-2'>
                      <div className='space-y-4'>
                        <h3 className='text-lg font-semibold text-white'>Core info</h3>

                        <div className='grid gap-4 md:grid-cols-2'>
                          <input name='name' defaultValue={place.name} placeholder='Name' className='rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />
                          <input name='borough' defaultValue={place.borough ?? ''} placeholder='Borough' className='rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />
                          <input name='neighborhood' defaultValue={place.neighborhood ?? ''} placeholder='Neighborhood' className='rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />
                          <input name='pizza_style' defaultValue={place.pizza_style ?? ''} placeholder='Pizza style' className='rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />
                          <input name='best_known_for' defaultValue={place.best_known_for ?? ''} placeholder='Best known for' className='rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white md:col-span-2' />
                        </div>
                      </div>

                      <div className='space-y-4'>
                        <h3 className='text-lg font-semibold text-white'>Recommendation layer</h3>

                        <div className='grid gap-4 md:grid-cols-2'>
                          <input name='best_slice' defaultValue={place.best_slice ?? ''} placeholder='Best slice' className='rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />
                          <input name='best_whole_pie' defaultValue={place.best_whole_pie ?? ''} placeholder='Best whole pie' className='rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />
                          <input
                            name='first_order_recommendation'
                            defaultValue={place.first_order_recommendation ?? ''}
                            placeholder='First order recommendation'
                            className='rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white md:col-span-2'
                          />
                        </div>

                        <textarea
                          name='why_go'
                          defaultValue={place.why_go ?? ''}
                          rows={4}
                          placeholder='Why go'
                          className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white'
                        />
                      </div>
                    </div>

                    <div className='grid gap-6 xl:grid-cols-[0.9fr_1.1fr]'>
                      <div className='space-y-4'>
                        <h3 className='text-lg font-semibold text-white'>Pricing</h3>

                        <div className='grid gap-4 md:grid-cols-2'>
                          <input
                            name='cheapest_slice_price'
                            type='number'
                            step='0.01'
                            defaultValue={place.cheapest_slice_price ?? ''}
                            placeholder='Cheapest slice'
                            className='rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white'
                          />
                          <input
                            name='whole_pie_price'
                            type='number'
                            step='0.01'
                            defaultValue={place.whole_pie_price ?? ''}
                            placeholder='Whole pie'
                            className='rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white'
                          />
                          <input
                            name='value_score'
                            type='number'
                            step='0.1'
                            defaultValue={place.value_score ?? ''}
                            placeholder='Value score'
                            className='rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white'
                          />
                          <input
                            name='price_confidence'
                            defaultValue={place.price_confidence ?? ''}
                            placeholder='Price confidence'
                            className='rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white'
                          />
                        </div>
                      </div>

                      <div className='space-y-4'>
                        <h3 className='text-lg font-semibold text-white'>Editorial flags</h3>

                        <div className='grid gap-3 md:grid-cols-2'>
                          <label className='flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300'>
                            <input type='checkbox' name='is_best_under_5' defaultChecked={place.is_best_under_5 ?? false} />
                            Best under $5
                          </label>

                          <label className='flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300'>
                            <input type='checkbox' name='is_best_under_10' defaultChecked={place.is_best_under_10 ?? false} />
                            Best under $10
                          </label>

                          <label className='flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300'>
                            <input type='checkbox' name='is_late_night' defaultChecked={place.is_late_night ?? false} />
                            Late night
                          </label>

                          <label className='flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300'>
                            <input type='checkbox' name='is_worth_the_trip' defaultChecked={place.is_worth_the_trip ?? false} />
                            Worth the trip
                          </label>

                          <label className='flex items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-300 md:col-span-2'>
                            <input type='checkbox' name='is_first_timer_friendly' defaultChecked={place.is_first_timer_friendly ?? false} />
                            First-timer friendly
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className='flex flex-wrap items-center gap-3 text-sm text-zinc-500'>
                      <span>slug: {place.slug}</span>
                      <span>rating: {place.average_rating ?? 0}</span>
                      <span>price range: {place.price_range ?? 'n/a'}</span>
                    </div>

                    <div className='flex flex-wrap gap-3'>
                      <button
                        type='submit'
                        className='inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 font-medium text-black transition hover:opacity-90'
                      >
                        <Save className='h-4 w-4' />
                        Save changes
                      </button>
                    </div>
                  </form>

                  <div className='mt-6 border-t border-zinc-800 pt-6'>
                    <h3 className='text-lg font-semibold text-white'>Danger zone</h3>

                    <div className='mt-4 flex flex-wrap gap-3'>
                      <form action={softDeletePlace}>
                        <input type='hidden' name='id' value={place.id} />
                        <button
                          type='submit'
                          className='inline-flex items-center gap-2 rounded-2xl border border-yellow-800 bg-yellow-950 px-5 py-3 font-medium text-yellow-200 transition hover:bg-yellow-900'
                        >
                          <Trash2 className='h-4 w-4' />
                          Soft delete
                        </button>
                      </form>

                      <form action={restorePlace}>
                        <input type='hidden' name='id' value={place.id} />
                        <button
                          type='submit'
                          className='inline-flex items-center gap-2 rounded-2xl border border-emerald-800 bg-emerald-950 px-5 py-3 font-medium text-emerald-200 transition hover:bg-emerald-900'
                        >
                          <RotateCcw className='h-4 w-4' />
                          Restore
                        </button>
                      </form>

                      <form action={deletePlace}>
                        <input type='hidden' name='id' value={place.id} />
                        <button
                          type='submit'
                          className='inline-flex items-center gap-2 rounded-2xl border border-red-900 bg-red-950 px-5 py-3 font-medium text-red-200 transition hover:bg-red-900'
                        >
                          <Trash2 className='h-4 w-4' />
                          Hard delete
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
