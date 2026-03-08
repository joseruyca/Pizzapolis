import Link from 'next/link'
import { AppHeader } from '@/components/layout/app-header'
import { createPublicClient } from '@/lib/supabase/public'

type Guide = {
  id: string
  slug: string
  title: string
  subtitle: string | null
  description: string | null
  cover_image_url: string | null
}

function GuideCard({ guide }: { guide: Guide }) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className='block overflow-hidden rounded-[28px] border border-zinc-800 bg-[linear-gradient(180deg,rgba(80,10,10,0.20),rgba(0,0,0,0.82))] p-8 shadow-xl transition hover:border-zinc-700 hover:bg-[linear-gradient(180deg,rgba(100,15,15,0.22),rgba(0,0,0,0.86))]'
    >
      <div className='flex min-h-[240px] flex-col justify-end'>
        <p className='text-sm uppercase tracking-[0.2em] text-red-400'>Guide</p>
        <h2 className='mt-4 text-3xl font-bold text-white'>{guide.title}</h2>
        {guide.subtitle ? (
          <p className='mt-3 text-lg text-zinc-300'>{guide.subtitle}</p>
        ) : null}
        {guide.description ? (
          <p className='mt-5 line-clamp-3 text-base leading-7 text-zinc-400'>
            {guide.description}
          </p>
        ) : null}

        <div className='mt-8 inline-flex items-center gap-2 text-sm font-medium text-white'>
          <span>Open guide</span>
          <span>→</span>
        </div>
      </div>
    </Link>
  )
}

export default async function GuidesPage() {
  const supabase = createPublicClient()

  const { data: guides, error } = await supabase
    .from('guides')
    .select('id, slug, title, subtitle, description, cover_image_url')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

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
              Handpicked guides to NYC&apos;s finest slices. Clean, fast and actually useful.
            </p>
          </div>

          {error ? (
            <div className='mt-10 rounded-2xl border border-red-900 bg-red-950 p-4 text-red-200'>
              Error loading guides: {error.message}
            </div>
          ) : null}

          <div className='mt-14 grid gap-6 lg:grid-cols-2'>
            {(guides ?? []).map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
