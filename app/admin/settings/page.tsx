import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/is-admin'
import { AdminShell } from '@/components/admin/admin-shell'
import { updateHomeSettings } from './actions'
import { updateRestaurantOfTheWeek } from './featured-actions'

export default async function AdminSettingsPage() {
  await requireAdmin()
  const supabase = await createClient()

  const [homeRes, featuredRes, placesRes] = await Promise.all([
    supabase.from('site_settings').select('key, value').eq('key', 'home').maybeSingle(),
    supabase.from('featured_slots').select('*').eq('key', 'restaurant_of_the_week').maybeSingle(),
    supabase.from('places').select('id, name').order('name', { ascending: true }).limit(100),
  ])

  const home = (homeRes.data?.value as {
    featuredTitle?: string
    featuredSubtitle?: string
    featuredDescription?: string
  } | null) ?? {}

  const featured = featuredRes.data
  const places = placesRes.data ?? []

  return (
    <AdminShell
      title='Settings'
      description='Control global content and featured sections.'
    >
      <div className='grid gap-6 xl:grid-cols-2'>
        <section className='rounded-[28px] border border-zinc-800 bg-black/70 p-6 shadow-xl'>
          <h2 className='text-2xl font-semibold text-white'>Home copy</h2>

          <form action={updateHomeSettings} className='mt-5 space-y-4'>
            <input name='featuredTitle' defaultValue={home.featuredTitle ?? ''} placeholder='Featured title' className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />
            <input name='featuredSubtitle' defaultValue={home.featuredSubtitle ?? ''} placeholder='Featured subtitle' className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />
            <textarea name='featuredDescription' rows={4} defaultValue={home.featuredDescription ?? ''} placeholder='Featured description' className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />
            <button type='submit' className='rounded-2xl bg-white px-5 py-3 font-medium text-black transition hover:opacity-90'>
              Save home settings
            </button>
          </form>
        </section>

        <section className='rounded-[28px] border border-zinc-800 bg-black/70 p-6 shadow-xl'>
          <h2 className='text-2xl font-semibold text-white'>Restaurant of the Week</h2>

          <form action={updateRestaurantOfTheWeek} className='mt-5 space-y-4'>
            <select name='place_id' defaultValue={featured?.place_id ?? ''} className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white'>
              <option value=''>No place selected</option>
              {places.map((place) => (
                <option key={place.id} value={place.id}>{place.name}</option>
              ))}
            </select>

            <input name='title' defaultValue={featured?.title ?? ''} placeholder='Section title' className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />
            <input name='subtitle' defaultValue={featured?.subtitle ?? ''} placeholder='Section subtitle' className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />
            <textarea name='description' rows={4} defaultValue={featured?.description ?? ''} placeholder='Short description' className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />

            <select name='is_active' defaultValue={featured?.is_active ? 'true' : 'false'} className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white'>
              <option value='true'>active</option>
              <option value='false'>inactive</option>
            </select>

            <button type='submit' className='rounded-2xl bg-white px-5 py-3 font-medium text-black transition hover:opacity-90'>
              Save featured restaurant
            </button>
          </form>
        </section>
      </div>
    </AdminShell>
  )
}
