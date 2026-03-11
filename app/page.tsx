import Link from 'next/link'
import {
  ArrowRight,
  Compass,
  MapPinned,
  Pizza,
  Star,
} from 'lucide-react'
import { AppHeader } from '@/components/layout/app-header'

function Tag({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <span className='rounded-full border border-[#3a3028] bg-[#1a1714] px-3 py-1.5 text-xs text-[#f1dcc2]'>
      {children}
    </span>
  )
}

export default function HomePage() {
  return (
    <main className='min-h-screen bg-[#09090b] text-white'>
      <AppHeader />

      <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(217,75,92,0.10),transparent_34%),linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[length:auto,72px_72px,72px_72px]">
        <section className='mx-auto max-w-6xl px-5 pb-10 pt-10 sm:px-6 lg:px-8 lg:pb-14 lg:pt-16'>
          <div className='mx-auto max-w-4xl text-center'>
            <div className='inline-flex items-center gap-2 rounded-full border border-[#4c3027] bg-[#241814] px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#ffcfad]'>
              <Pizza className='h-3.5 w-3.5 text-[#ff8a65]' />
              NYC Pizza Guide
            </div>

            <h1 className='mt-6 text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl'>
              Find the best
              <br />
              pizza in
              <br />
              <span className='bg-gradient-to-r from-[#ff7b6b] via-[#f1b561] to-[#f6ead7] bg-clip-text text-transparent'>
                New York
              </span>
            </h1>

            <p className='mx-auto mt-5 max-w-xl text-base leading-7 text-[#aeb6c8] sm:text-lg'>
              Clean map. Curated picks. The slices worth your time.
            </p>

            <div className='mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row'>
              <Link
                href='/explorar'
                className='inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#d94b5c] px-7 py-4 text-base font-semibold text-white shadow-[0_12px_40px_rgba(217,75,92,0.28)] transition hover:bg-[#e15d6d] sm:w-auto'
              >
                <MapPinned className='h-5 w-5' />
                <span>Explore map</span>
                <ArrowRight className='h-5 w-5' />
              </Link>

              <Link
                href='/guides'
                className='inline-flex w-full items-center justify-center gap-3 rounded-full border border-[#2a3040] bg-[#151821] px-7 py-4 text-base font-semibold text-white transition hover:bg-[#1a1f2b] sm:w-auto'
              >
                <Compass className='h-5 w-5' />
                <span>Guides</span>
              </Link>
            </div>
          </div>
        </section>

        <section className='mx-auto max-w-5xl px-5 py-6 sm:px-6 lg:px-8 lg:py-8'>
          <div className='overflow-hidden rounded-[30px] border border-[#2a3040] bg-[#101115]/95 shadow-[0_24px_70px_rgba(0,0,0,0.34)]'>
            <div className='grid lg:grid-cols-[1.05fr_0.95fr]'>
              <div className='p-6 sm:p-8'>
                <p className='text-[11px] uppercase tracking-[0.18em] text-[#ffb5bf]'>
                  Restaurant of the Week
                </p>

                <h2 className='mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl'>
                  L&apos;Industrie Pizzeria
                </h2>

                <p className='mt-3 text-sm text-[#aeb6c8] sm:text-base'>
                  Williamsburg, Brooklyn
                </p>

                <p className='mt-5 max-w-lg text-sm leading-7 text-[#a4adbf] sm:text-base'>
                  One of the city&apos;s modern favorites, known for polished slices,
                  strong ingredients and the kind of pizza people actively go out of their way for.
                </p>

                <div className='mt-5 flex flex-wrap gap-2'>
                  <Tag>Artisan</Tag>
                  <Tag>Burrata slice</Tag>
                  <Tag>$5</Tag>
                </div>

                <div className='mt-7'>
                  <Link
                    href='/places/lindustrie-williamsburg'
                    className='inline-flex items-center gap-3 rounded-xl bg-[#f4ede2] px-5 py-3 text-sm font-semibold text-[#181510] transition hover:opacity-90'
                  >
                    <span>View place</span>
                    <ArrowRight className='h-4 w-4' />
                  </Link>
                </div>
              </div>

              <div className='min-h-[220px] border-t border-[#2a3040] bg-[linear-gradient(180deg,rgba(52,34,24,0.92),rgba(16,17,21,1))] lg:min-h-full lg:border-l lg:border-t-0'>
                <div className='flex h-full items-center justify-center text-center text-[#8e7b69]'>
                  <div>
                    <Pizza className='mx-auto h-10 w-10 text-[#f1b561]' />
                    <p className='mt-3 text-sm font-medium text-[#f1dcc2]'>
                      Featured visual
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='mx-auto max-w-5xl px-5 pb-16 pt-6 sm:px-6 lg:px-8 lg:pb-20'>
          <div className='rounded-[30px] border border-[#2a3040] bg-[#101115]/95 px-6 py-8 text-center shadow-xl sm:px-8'>
            <p className='text-sm uppercase tracking-[0.18em] text-[#f1b561]'>
              PizzaHunt
            </p>

            <h2 className='mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl'>
              New York pizza, mapped better
            </h2>

            <div className='mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row'>
              <Link
                href='/explorar'
                className='inline-flex w-full items-center justify-center gap-3 rounded-full bg-[#d94b5c] px-7 py-4 text-base font-semibold text-white transition hover:bg-[#e15d6d] sm:w-auto'
              >
                <MapPinned className='h-5 w-5' />
                <span>Open map</span>
              </Link>

              <Link
                href='/guides'
                className='inline-flex w-full items-center justify-center gap-3 rounded-full border border-[#2a3040] bg-[#151821] px-7 py-4 text-base font-semibold text-white transition hover:bg-[#1a1f2b] sm:w-auto'
              >
                <Compass className='h-5 w-5' />
                <span>Read guides</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
