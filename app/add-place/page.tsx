import Link from 'next/link'
import { AppHeader } from '@/components/layout/app-header'
import { createPlace } from './actions'

export default async function AddPlacePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <main className='min-h-screen bg-black text-white'>
      <AppHeader />

      <div className='min-h-screen bg-[linear-gradient(180deg,rgba(60,0,0,0.28),rgba(0,0,0,0.96)_28%)]'>
        <div className='mx-auto max-w-4xl px-6 py-10'>
          <div className='rounded-[30px] border border-zinc-800 bg-black/80 p-8 shadow-2xl'>
            <div className='mb-8 flex items-center justify-between gap-4'>
              <div>
                <div className='inline-flex items-center gap-3 rounded-full border border-red-900/60 bg-[rgba(120,10,10,0.18)] px-5 py-2 text-sm font-medium uppercase tracking-[0.18em] text-red-400'>
                  <span>⊙</span>
                  <span>Suggest a Spot</span>
                </div>

                <h1 className='mt-6 text-5xl font-bold tracking-tight'>
                  Know a great slice?
                </h1>

                <p className='mt-5 max-w-2xl text-xl leading-8 text-zinc-300'>
                  Drop the details. If it makes the cut, it goes on the map.
                </p>
              </div>

              <Link
                href='/explorar'
                className='hidden rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white transition hover:bg-zinc-900 sm:inline-flex'
              >
                Back
              </Link>
            </div>

            {params.error ? (
              <div className='mb-6 rounded-2xl border border-red-900 bg-red-950 p-4 text-red-200'>
                {params.error}
              </div>
            ) : null}

            <form
              action={createPlace}
              className='space-y-6'
            >
              <div>
                <label className='mb-2 block text-base text-zinc-300'>Place Name *</label>
                <input
                  type='text'
                  name='name'
                  required
                  className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-4 text-white outline-none'
                  placeholder="e.g. Joe's Pizza"
                />
              </div>

              <div className='grid gap-6 md:grid-cols-2'>
                <div>
                  <label className='mb-2 block text-base text-zinc-300'>Neighborhood</label>
                  <input
                    type='text'
                    name='neighborhood'
                    className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-4 text-white outline-none'
                    placeholder='e.g. West Village'
                  />
                </div>

                <div>
                  <label className='mb-2 block text-base text-zinc-300'>Borough *</label>
                  <select
                    name='borough'
                    className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-4 text-white outline-none'
                    defaultValue=''
                  >
                    <option value=''>Select</option>
                    <option value='Manhattan'>Manhattan</option>
                    <option value='Brooklyn'>Brooklyn</option>
                    <option value='Queens'>Queens</option>
                    <option value='Bronx'>Bronx</option>
                    <option value='Staten Island'>Staten Island</option>
                  </select>
                </div>
              </div>

              <div className='grid gap-6 md:grid-cols-2'>
                <div>
                  <label className='mb-2 block text-base text-zinc-300'>Pizza Style</label>
                  <input
                    type='text'
                    name='pizza_style'
                    className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-4 text-white outline-none'
                    placeholder='Select style'
                  />
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
              </div>

              <div>
                <label className='mb-2 block text-base text-zinc-300'>Address</label>
                <input
                  type='text'
                  name='address'
                  className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-4 text-white outline-none'
                  placeholder='Full street address'
                />
              </div>

              <div>
                <label className='mb-2 block text-base text-zinc-300'>Description</label>
                <textarea
                  name='description'
                  rows={5}
                  className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-4 text-white outline-none'
                  placeholder='Why does this place deserve to be on the map?'
                />
              </div>

              <div className='grid gap-6 md:grid-cols-2'>
                <div>
                  <label className='mb-2 block text-base text-zinc-300'>Latitude *</label>
                  <input
                    type='number'
                    step='any'
                    name='latitude'
                    required
                    className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-4 text-white outline-none'
                    placeholder='40.730599'
                  />
                </div>

                <div>
                  <label className='mb-2 block text-base text-zinc-300'>Longitude *</label>
                  <input
                    type='number'
                    step='any'
                    name='longitude'
                    required
                    className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-5 py-4 text-white outline-none'
                    placeholder='-74.002684'
                  />
                </div>
              </div>

              <div className='flex justify-end'>
                <button
                  type='submit'
                  className='rounded-2xl bg-red-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-red-500'
                >
                  Submit spot
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
