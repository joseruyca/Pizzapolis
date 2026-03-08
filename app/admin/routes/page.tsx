import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { requireEditor } from '@/lib/auth/is-admin'
import { AdminShell } from '@/components/admin/admin-shell'
import { createRoute, deleteRoute, toggleRoutePublished } from './actions'

export default async function AdminRoutesPage() {
  await requireEditor()
  const supabase = await createClient()

  const { data: routes, error } = await supabase
    .from('pizza_routes')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <AdminShell
      title='Routes'
      description='Create curated pizza routes and publish them on the public site.'
    >
      <div className='grid gap-6 xl:grid-cols-[420px_1fr]'>
        <section className='rounded-[28px] border border-zinc-800 bg-black/70 p-6 shadow-xl'>
          <h2 className='text-2xl font-semibold text-white'>Create route</h2>

          <form action={createRoute} className='mt-5 space-y-4'>
            <input
              name='title'
              placeholder='Best Cheap Slices in 90 Minutes'
              className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white'
            />
            <input
              name='subtitle'
              placeholder='A fast, cheap Manhattan route'
              className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white'
            />
            <textarea
              name='description'
              rows={4}
              placeholder='Short route description'
              className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white'
            />
            <input
              name='estimated_minutes'
              type='number'
              placeholder='90'
              className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white'
            />
            <input
              name='borough'
              placeholder='Manhattan'
              className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white'
            />
            <input
              name='route_type'
              placeholder='Cheap / Late Night / First-Timers'
              className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white'
            />
            <input
              name='cover_image_url'
              placeholder='Cover image URL'
              className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white'
            />

            <button
              type='submit'
              className='w-full rounded-2xl bg-white px-5 py-3 font-medium text-black transition hover:opacity-90'
            >
              Create route
            </button>
          </form>
        </section>

        <section className='space-y-4'>
          {error ? (
            <div className='rounded-2xl border border-red-900 bg-red-950 p-4 text-red-200'>
              Error loading routes: {error.message}
            </div>
          ) : null}

          {(routes ?? []).map((route) => (
            <div key={route.id} className='overflow-hidden rounded-[28px] border border-zinc-800 bg-black/70 shadow-xl'>
              {route.cover_image_url ? (
                <div className='h-40 w-full overflow-hidden border-b border-zinc-800 bg-zinc-950'>
                  <img
                    src={route.cover_image_url}
                    alt={route.title}
                    className='h-full w-full object-cover'
                  />
                </div>
              ) : null}

              <div className='p-6'>
                <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                  <div>
                    <div className='flex flex-wrap items-center gap-3'>
                      <h2 className='text-xl font-semibold text-white'>{route.title}</h2>
                      <span className={`rounded-full px-3 py-1 text-xs ${route.is_published ? 'border border-emerald-800 bg-emerald-950 text-emerald-300' : 'border border-zinc-700 bg-zinc-900 text-zinc-400'}`}>
                        {route.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    {route.subtitle ? (
                      <p className='mt-2 text-zinc-300'>{route.subtitle}</p>
                    ) : null}

                    <div className='mt-3 flex flex-wrap gap-3 text-sm text-zinc-500'>
                      {route.route_type ? <span>{route.route_type}</span> : null}
                      {route.borough ? <span>{route.borough}</span> : null}
                      {route.estimated_minutes ? <span>{route.estimated_minutes} min</span> : null}
                    </div>
                  </div>

                  <div className='flex flex-wrap gap-2'>
                    <Link
                      href={`/admin/routes/${route.id}`}
                      className='rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white transition hover:bg-zinc-900'
                    >
                      Edit stops
                    </Link>

                    <form action={toggleRoutePublished}>
                      <input type='hidden' name='id' value={route.id} />
                      <input type='hidden' name='next_value' value={route.is_published ? 'false' : 'true'} />
                      <button
                        type='submit'
                        className='rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white transition hover:bg-zinc-900'
                      >
                        {route.is_published ? 'Unpublish' : 'Publish'}
                      </button>
                    </form>

                    <form action={deleteRoute}>
                      <input type='hidden' name='id' value={route.id} />
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
            </div>
          ))}
        </section>
      </div>
    </AdminShell>
  )
}
