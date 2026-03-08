import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/is-admin'
import { AdminShell } from '@/components/admin/admin-shell'
import { updateHomeSettings } from './actions'

export default async function AdminSettingsPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data } = await supabase
    .from('site_settings')
    .select('key, value')
    .eq('key', 'home')
    .maybeSingle()

  const value = (data?.value as {
    featuredTitle?: string
    featuredSubtitle?: string
    featuredDescription?: string
  } | null) ?? {}

  return (
    <AdminShell
      title='Settings'
      description='Control global content and future site-wide configuration.'
    >
      <section className='rounded-[28px] border border-zinc-800 bg-black/70 p-6 shadow-xl'>
        <h2 className='text-2xl font-semibold text-white'>Home featured copy</h2>

        <form action={updateHomeSettings} className='mt-5 space-y-4'>
          <div>
            <label className='mb-2 block text-sm text-zinc-400'>Featured title</label>
            <input
              name='featuredTitle'
              defaultValue={value.featuredTitle ?? ''}
              className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white'
            />
          </div>

          <div>
            <label className='mb-2 block text-sm text-zinc-400'>Featured subtitle</label>
            <input
              name='featuredSubtitle'
              defaultValue={value.featuredSubtitle ?? ''}
              className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white'
            />
          </div>

          <div>
            <label className='mb-2 block text-sm text-zinc-400'>Featured description</label>
            <textarea
              name='featuredDescription'
              rows={4}
              defaultValue={value.featuredDescription ?? ''}
              className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white'
            />
          </div>

          <button
            type='submit'
            className='rounded-2xl bg-white px-5 py-3 font-medium text-black transition hover:opacity-90'
          >
            Save settings
          </button>
        </form>
      </section>
    </AdminShell>
  )
}
