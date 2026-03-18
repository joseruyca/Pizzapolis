import Link from 'next/link'
import { AppHeader } from '@/components/layout/app-header'
import { SuggestPlaceForm } from '@/components/places/suggest-place-form'

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

                <h1 className='mt-6 text-4xl font-bold tracking-tight sm:text-5xl'>
                  Know a great slice?
                </h1>

                <p className='mt-5 max-w-2xl text-lg leading-8 text-zinc-300'>
                  Search the place and send it for review in seconds.
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

            <SuggestPlaceForm />
          </div>
        </div>
      </div>
    </main>
  )
}


