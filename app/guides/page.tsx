import { AppHeader } from '@/components/layout/app-header'

function GuideCard({
  title,
  subtitle,
  count,
}: {
  title: string
  subtitle: string
  count: string
}) {
  return (
    <div className='rounded-[28px] border border-zinc-800 bg-[linear-gradient(180deg,rgba(80,10,10,0.25),rgba(0,0,0,0.75))] p-8 shadow-xl'>
      <div className='flex h-56 flex-col justify-end'>
        <h3 className='text-3xl font-bold text-white'>{title}</h3>
        <p className='mt-3 text-lg text-zinc-300'>{subtitle}</p>
        <p className='mt-5 text-sm text-zinc-500'>⊙ {count}</p>
      </div>
    </div>
  )
}

export default function GuidesPage() {
  return (
    <main className='min-h-screen bg-black text-white'>
      <AppHeader />

      <div className='min-h-screen bg-[linear-gradient(180deg,rgba(60,0,0,0.28),rgba(0,0,0,0.96)_28%)]'>
        <div className='mx-auto max-w-6xl px-6 py-10'>
          <div className='text-center'>
            <div className='inline-flex items-center gap-3 rounded-full border border-red-900/60 bg-[rgba(120,10,10,0.18)] px-5 py-2 text-sm font-medium uppercase tracking-[0.18em] text-red-400'>
              <span>⊙</span>
              <span>Editorial Guides</span>
            </div>

            <h1 className='mt-8 text-5xl font-bold tracking-tight'>
              Curated Pizza Lists
            </h1>

            <p className='mx-auto mt-5 max-w-2xl text-xl leading-9 text-zinc-300'>
              Handpicked guides to NYC&apos;s finest slices. No fluff, just crust.
            </p>
          </div>

          <div className='mt-14 grid gap-6 lg:grid-cols-2'>
            <GuideCard
              title='Best Cheap Slices'
              subtitle="NYC's finest under $5"
              count='5 spots'
            />
            <GuideCard
              title='Best Premium Pizza'
              subtitle='Worth the splurge'
              count='6 spots'
            />
            <GuideCard
              title='Late Night Pizza'
              subtitle='Best slices after dark'
              count='4 spots'
            />
            <GuideCard
              title='Classic NY Slice'
              subtitle='Old-school essentials'
              count='7 spots'
            />
          </div>
        </div>
      </div>
    </main>
  )
}
