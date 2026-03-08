import Link from 'next/link'
import { AppHeader } from '@/components/layout/app-header'

function StoreButton({
  labelTop,
  labelBottom,
  icon,
}: {
  labelTop: string
  labelBottom: string
  icon: string
}) {
  return (
    <button
      type='button'
      className='flex min-w-[210px] items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 text-left transition hover:border-zinc-700 hover:bg-zinc-900'
    >
      <span className='text-2xl'>{icon}</span>
      <span>
        <span className='block text-xs text-zinc-500'>{labelTop}</span>
        <span className='block text-lg font-semibold text-white'>{labelBottom}</span>
      </span>
    </button>
  )
}

export default function HomePage() {
  return (
    <main className='min-h-screen bg-black text-white'>
      <AppHeader />

      <div className="min-h-screen bg-[linear-gradient(180deg,rgba(60,0,0,0.40),rgba(0,0,0,0.96)_32%),linear-gradient(to_right,rgba(255,60,60,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,60,60,0.05)_1px,transparent_1px)] bg-[length:auto,64px_64px,64px_64px]">
        <section className='mx-auto max-w-6xl px-6 pb-20 pt-16 text-center lg:px-8 lg:pt-24'>
          <div className='mx-auto max-w-4xl'>
            <div className='inline-flex items-center gap-3 rounded-full border border-red-900/60 bg-[rgba(120,10,10,0.18)] px-5 py-2 text-sm font-medium uppercase tracking-[0.18em] text-red-400'>
              <span className='inline-flex h-2.5 w-2.5 rounded-full bg-red-500' />
              NYC Pizza Discovery
            </div>

            <h1 className='mt-10 text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl'>
              The ultimate
              <br />
              guide to
              <br />
              <span className='bg-gradient-to-r from-red-400 via-orange-300 to-yellow-200 bg-clip-text text-transparent'>
                New York&apos;s
              </span>
              <br />
              best pizza
            </h1>

            <p className='mx-auto mt-8 max-w-2xl text-xl leading-9 text-zinc-300'>
              Discover the best slices in NYC with a clean map, smart filters and curated picks.
            </p>

            <div className='mt-10'>
              <Link
                href='/explorar'
                className='inline-flex items-center gap-3 rounded-full bg-red-600 px-8 py-4 text-lg font-semibold text-white shadow-[0_10px_40px_rgba(239,68,68,0.35)] transition hover:bg-red-500'
              >
                <span>📍</span>
                <span>Explore the map</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </section>

        <section className='mx-auto max-w-5xl px-6 py-6 lg:px-8'>
          <div className='rounded-[32px] border border-zinc-800 bg-[linear-gradient(180deg,rgba(60,0,0,0.22),rgba(0,0,0,0.84))] p-8 shadow-2xl'>
            <p className='text-sm uppercase tracking-[0.22em] text-red-400'>
              Restaurant of the Week
            </p>

            <div className='mt-5 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center'>
              <div>
                <h2 className='text-4xl font-bold tracking-tight text-white sm:text-5xl'>
                  L&apos;Industrie Pizzeria
                </h2>

                <p className='mt-4 text-lg text-zinc-300'>
                  Williamsburg, Brooklyn
                </p>

                <p className='mt-6 max-w-2xl text-lg leading-8 text-zinc-400'>
                  A modern NYC favorite with polished slices, strong ingredients and one of the most talked-about bites in the city.
                </p>

                <div className='mt-8 flex flex-wrap gap-3'>
                  <span className='rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300'>
                    Artisan
                  </span>
                  <span className='rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300'>
                    Burrata slice
                  </span>
                  <span className='rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-300'>
                    $5
                  </span>
                </div>

                <div className='mt-8'>
                  <Link
                    href='/places/lindustrie-williamsburg'
                    className='inline-flex items-center gap-3 rounded-xl border border-zinc-700 px-5 py-3 text-base font-medium text-white transition hover:bg-zinc-900'
                  >
                    View restaurant
                  </Link>
                </div>
              </div>

              <div className='overflow-hidden rounded-[28px] border border-zinc-800 bg-zinc-950'>
                <div className='flex h-[280px] items-center justify-center bg-[linear-gradient(180deg,rgba(70,10,10,0.20),rgba(0,0,0,0.92))] text-zinc-500'>
                  Restaurant image
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='mx-auto max-w-5xl px-6 py-14 lg:px-8'>
          <div className='rounded-[32px] border border-zinc-800 bg-black/60 p-8 text-center'>
            <p className='text-sm uppercase tracking-[0.22em] text-red-400'>
              Mobile app
            </p>

            <h2 className='mt-5 text-4xl font-bold tracking-tight sm:text-5xl'>
              Take it with you
            </h2>

            <p className='mx-auto mt-5 max-w-2xl text-lg leading-8 text-zinc-400'>
              Coming soon to iOS and Android. The web version already works great on mobile.
            </p>

            <div className='mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row'>
              <StoreButton
                icon='🍎'
                labelTop='Download on the'
                labelBottom='App Store'
              />
              <StoreButton
                icon='▶️'
                labelTop='Get it on'
                labelBottom='Google Play'
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
