import Link from 'next/link'
import { AppHeader } from '@/components/layout/app-header'
import { createPublicClient } from '@/lib/supabase/public'
import {
  createGuide,
  deleteGuide,
  toggleGuidePublished,
} from './actions'

type Guide = {
  id: string
  slug: string
  title: string
  subtitle: string | null
  description: string | null
  is_published: boolean
  created_at: string
}

export default async function AdminGuidesPage() {
  const supabase = createPublicClient()

  const { data: guides, error } = await supabase
    .from('guides')
    .select('id, slug, title, subtitle, description, is_published, created_at')
    .order('created_at', { ascending: false })

  return (
    <main className='min-h-screen bg-black text-white'>
      <AppHeader />

      <div className='min-h-screen bg-[linear-gradient(180deg,rgba(60,0,0,0.28),rgba(0,0,0,0.96)_28%)]'>
        <div className='mx-auto max-w-6xl px-6 py-10'>
          <div className='mb-8 flex items-center justify-between gap-4'>
            <div>
              <p className='text-sm uppercase tracking-[0.22em] text-red-400'>
                Admin
              </p>
              <h1 className='mt-3 text-4xl font-bold tracking-tight'>
                Manage Guides
              </h1>
              <p className='mt-3 max-w-2xl text-lg text-zinc-400'>
                Create, publish and manage editorial pizza guides.
              </p>
            </div>

            <Link
              href='/guides'
              className='rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white transition hover:bg-zinc-900'
            >
              View public guides
            </Link>
          </div>

          <div className='grid gap-6 xl:grid-cols-[420px_1fr]'>
            <section className='rounded-[28px] border border-zinc-800 bg-black/70 p-6 shadow-xl'>
              <h2 className='text-2xl font-semibold text-white'>Create Guide</h2>

              <form action={createGuide} className='mt-6 space-y-4'>
                <div>
                  <label className='mb-2 block text-sm text-zinc-400'>Title *</label>
                  <input
                    type='text'
                    name='title'
                    required
                    className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none'
                    placeholder='Best Queens Pizza'
                  />
                </div>

                <div>
                  <label className='mb-2 block text-sm text-zinc-400'>Subtitle</label>
                  <input
                    type='text'
                    name='subtitle'
                    className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none'
                    placeholder='Hidden gems and essentials'
                  />
                </div>

                <div>
                  <label className='mb-2 block text-sm text-zinc-400'>Description</label>
                  <textarea
                    name='description'
                    rows={5}
                    className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none'
                    placeholder='Write a short editorial description for this guide.'
                  />
                </div>

                <button
                  type='submit'
                  className='w-full rounded-2xl bg-red-600 px-5 py-3 font-medium text-white transition hover:bg-red-500'
                >
                  Create guide
                </button>
              </form>
            </section>

            <section className='rounded-[28px] border border-zinc-800 bg-black/70 p-6 shadow-xl'>
              <div className='mb-6 flex items-center justify-between gap-4'>
                <h2 className='text-2xl font-semibold text-white'>Existing Guides</h2>
                <p className='text-sm text-zinc-500'>{(guides ?? []).length} total</p>
              </div>

              {error ? (
                <div className='rounded-2xl border border-red-900 bg-red-950 p-4 text-red-200'>
                  Error loading guides: {error.message}
                </div>
              ) : null}

              <div className='space-y-4'>
                {(guides ?? []).map((guide: Guide) => (
                  <div
                    key={guide.id}
                    className='rounded-3xl border border-zinc-800 bg-zinc-950 p-5'
                  >
                    <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                      <div className='min-w-0'>
                        <div className='flex flex-wrap items-center gap-3'>
                          <h3 className='text-xl font-semibold text-white'>
                            {guide.title}
                          </h3>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              guide.is_published
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-900'
                                : 'bg-zinc-900 text-zinc-400 border border-zinc-700'
                            }`}
                          >
                            {guide.is_published ? 'Published' : 'Draft'}
                          </span>
                        </div>

                        {guide.subtitle ? (
                          <p className='mt-2 text-zinc-300'>{guide.subtitle}</p>
                        ) : null}

                        {guide.description ? (
                          <p className='mt-3 line-clamp-2 text-sm leading-7 text-zinc-400'>
                            {guide.description}
                          </p>
                        ) : null}

                        <p className='mt-3 text-xs uppercase tracking-[0.18em] text-zinc-500'>
                          slug: {guide.slug}
                        </p>
                      </div>

                      <div className='flex flex-wrap gap-2'>
                        <Link
                          href={`/guides/${guide.slug}`}
                          className='rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white transition hover:bg-zinc-900'
                        >
                          View
                        </Link>

                        <form action={toggleGuidePublished}>
                          <input type='hidden' name='id' value={guide.id} />
                          <input
                            type='hidden'
                            name='next_value'
                            value={guide.is_published ? 'false' : 'true'}
                          />
                          <button
                            type='submit'
                            className='rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white transition hover:bg-zinc-900'
                          >
                            {guide.is_published ? 'Unpublish' : 'Publish'}
                          </button>
                        </form>

                        <form action={deleteGuide}>
                          <input type='hidden' name='id' value={guide.id} />
                          <button
                            type='submit'
                            className='rounded-xl border border-red-900 bg-red-950 px-4 py-2 text-sm text-red-200 transition hover:bg-red-900'
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
