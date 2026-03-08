import { createClient } from '@/lib/supabase/server'
import { requireEditor } from '@/lib/auth/is-admin'
import { AdminShell } from '@/components/admin/admin-shell'
import { deletePlace, updatePlaceBasics } from './actions'

export default async function AdminPlacesPage() {
  await requireEditor()
  const supabase = await createClient()

  const { data: places, error } = await supabase
    .from('places')
    .select('id, slug, name, borough, neighborhood, pizza_style, best_known_for, cheapest_slice_price, price_range, average_rating')
    .order('average_rating', { ascending: false })
    .limit(40)

  return (
    <AdminShell
      title='Places'
      description='Edit core place information, pricing and editorial metadata.'
    >
      {error ? (
        <div className='rounded-2xl border border-red-900 bg-red-950 p-4 text-red-200'>
          Error loading places: {error.message}
        </div>
      ) : null}

      <div className='space-y-5'>
        {(places ?? []).map((place) => (
          <div key={place.id} className='rounded-[28px] border border-zinc-800 bg-black/70 p-6 shadow-xl'>
            <form action={updatePlaceBasics} className='space-y-4'>
              <input type='hidden' name='id' value={place.id} />

              <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
                <div>
                  <label className='mb-2 block text-sm text-zinc-400'>Name</label>
                  <input name='name' defaultValue={place.name} className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />
                </div>
                <div>
                  <label className='mb-2 block text-sm text-zinc-400'>Neighborhood</label>
                  <input name='neighborhood' defaultValue={place.neighborhood ?? ''} className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />
                </div>
                <div>
                  <label className='mb-2 block text-sm text-zinc-400'>Borough</label>
                  <input name='borough' defaultValue={place.borough ?? ''} className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />
                </div>
                <div>
                  <label className='mb-2 block text-sm text-zinc-400'>Pizza style</label>
                  <input name='pizza_style' defaultValue={place.pizza_style ?? ''} className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />
                </div>
                <div>
                  <label className='mb-2 block text-sm text-zinc-400'>Best known for</label>
                  <input name='best_known_for' defaultValue={place.best_known_for ?? ''} className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />
                </div>
                <div>
                  <label className='mb-2 block text-sm text-zinc-400'>Cheapest slice price</label>
                  <input
                    name='cheapest_slice_price'
                    type='number'
                    step='0.01'
                    defaultValue={place.cheapest_slice_price ?? ''}
                    className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white'
                  />
                </div>
              </div>

              <div className='flex flex-wrap items-center gap-3 text-sm text-zinc-500'>
                <span>slug: {place.slug}</span>
                <span>rating: {place.average_rating ?? 0}</span>
                <span>price range: {place.price_range ?? 'n/a'}</span>
              </div>

              <div className='flex flex-wrap gap-3'>
                <button type='submit' className='rounded-2xl bg-white px-5 py-3 font-medium text-black transition hover:opacity-90'>
                  Save changes
                </button>
              </div>
            </form>

            <div className='mt-4 border-t border-zinc-800 pt-4'>
              <form action={deletePlace}>
                <input type='hidden' name='id' value={place.id} />
                <button
                  type='submit'
                  className='rounded-2xl border border-red-900 bg-red-950 px-5 py-3 font-medium text-red-200 transition hover:bg-red-900'
                >
                  Delete place
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  )
}
