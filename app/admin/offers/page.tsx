import { createClient } from '@/lib/supabase/server'
import { requireEditor } from '@/lib/auth/is-admin'
import { AdminShell } from '@/components/admin/admin-shell'
import { createOffer, toggleOffer } from './actions'

export default async function AdminOffersPage() {
  await requireEditor()
  const supabase = await createClient()

  const [offersRes, placesRes] = await Promise.all([
    supabase.from('offers').select('id, title, description, place_id, cta_label, cta_url, is_active, created_at').order('created_at', { ascending: false }),
    supabase.from('places').select('id, name').order('name', { ascending: true }).limit(100),
  ])

  const offers = offersRes.data ?? []
  const places = placesRes.data ?? []
  const placeMap = new Map(places.map((p) => [p.id, p.name]))

  return (
    <AdminShell
      title='Offers'
      description='Create and manage pizzeria promotions, partnerships and sponsored deals.'
    >
      <div className='grid gap-6 xl:grid-cols-[380px_1fr]'>
        <section className='rounded-[28px] border border-zinc-800 bg-black/70 p-6 shadow-xl'>
          <h2 className='text-2xl font-semibold text-white'>Create offer</h2>
          <form action={createOffer} className='mt-5 space-y-4'>
            <input name='title' placeholder='2-for-1 weekday slices' className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />
            <textarea name='description' rows={4} placeholder='Short offer description' className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />
            <select name='place_id' className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white'>
              <option value=''>No linked place</option>
              {places.map((place) => (
                <option key={place.id} value={place.id}>{place.name}</option>
              ))}
            </select>
            <input name='cta_label' placeholder='Claim deal' className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />
            <input name='cta_url' placeholder='https://...' className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />
            <button type='submit' className='w-full rounded-2xl bg-white px-5 py-3 font-medium text-black transition hover:opacity-90'>
              Create offer
            </button>
          </form>
        </section>

        <section className='space-y-4'>
          {offers.map((offer) => (
            <div key={offer.id} className='rounded-[28px] border border-zinc-800 bg-black/70 p-6 shadow-xl'>
              <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                <div>
                  <div className='flex flex-wrap items-center gap-3'>
                    <h2 className='text-xl font-semibold text-white'>{offer.title}</h2>
                    <span className={`rounded-full px-3 py-1 text-xs ${offer.is_active ? 'border border-emerald-800 bg-emerald-950 text-emerald-300' : 'border border-zinc-700 bg-zinc-900 text-zinc-400'}`}>
                      {offer.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {offer.description ? (
                    <p className='mt-3 text-zinc-400'>{offer.description}</p>
                  ) : null}
                  <p className='mt-3 text-sm text-zinc-500'>
                    {offer.place_id ? `Place: ${placeMap.get(offer.place_id) || 'Unknown place'}` : 'No linked place'}
                  </p>
                </div>

                <form action={toggleOffer}>
                  <input type='hidden' name='id' value={offer.id} />
                  <input type='hidden' name='next_value' value={offer.is_active ? 'false' : 'true'} />
                  <button type='submit' className='rounded-2xl border border-zinc-700 px-5 py-3 text-sm text-white transition hover:bg-zinc-900'>
                    {offer.is_active ? 'Deactivate' : 'Activate'}
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
