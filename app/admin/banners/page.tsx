import { createClient } from '@/lib/supabase/server'
import { requireEditor } from '@/lib/auth/is-admin'
import { AdminShell } from '@/components/admin/admin-shell'
import { createBanner, toggleBanner } from './actions'

export default async function AdminBannersPage() {
  await requireEditor()
  const supabase = await createClient()

  const { data: banners } = await supabase
    .from('banners')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <AdminShell
      title='Banners'
      description='Manage promotional and sponsored banner placements.'
    >
      <div className='grid gap-6 xl:grid-cols-[380px_1fr]'>
        <section className='rounded-[28px] border border-zinc-800 bg-black/70 p-6 shadow-xl'>
          <h2 className='text-2xl font-semibold text-white'>Create banner</h2>

          <form action={createBanner} className='mt-5 space-y-4'>
            <input name='placement' placeholder='home / explore / place' className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />
            <input name='title' placeholder='Banner title' className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />
            <input name='subtitle' placeholder='Subtitle' className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />
            <input name='image_url' placeholder='Image URL' className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />
            <input name='link_url' placeholder='Link URL' className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />

            <button type='submit' className='w-full rounded-2xl bg-white px-5 py-3 font-medium text-black transition hover:opacity-90'>
              Create banner
            </button>
          </form>
        </section>

        <section className='space-y-4'>
          {(banners ?? []).map((banner) => (
            <div key={banner.id} className='rounded-[28px] border border-zinc-800 bg-black/70 p-6 shadow-xl'>
              <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                <div>
                  <div className='flex flex-wrap items-center gap-3'>
                    <h2 className='text-xl font-semibold text-white'>{banner.title}</h2>
                    <span className={`rounded-full px-3 py-1 text-xs ${banner.is_active ? 'border border-emerald-800 bg-emerald-950 text-emerald-300' : 'border border-zinc-700 bg-zinc-900 text-zinc-400'}`}>
                      {banner.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className='mt-2 text-sm text-zinc-400'>placement: {banner.placement}</p>
                  {banner.subtitle ? <p className='mt-2 text-zinc-400'>{banner.subtitle}</p> : null}
                </div>

                <form action={toggleBanner}>
                  <input type='hidden' name='id' value={banner.id} />
                  <input type='hidden' name='next_value' value={banner.is_active ? 'false' : 'true'} />
                  <button type='submit' className='rounded-2xl border border-zinc-700 px-5 py-3 text-sm text-white transition hover:bg-zinc-900'>
                    {banner.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </form>
              </div>
            </div>
          ))}
        </section>
      </div>
    </AdminShell>
  )
}
