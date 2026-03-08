import { createClient } from '@/lib/supabase/server'
import { requireEditor } from '@/lib/auth/is-admin'
import { AdminShell } from '@/components/admin/admin-shell'
import { deletePlace, updatePlaceBasics } from './actions'
import { restorePlace, softDeletePlace } from './restore-actions'

export default async function AdminPlacesPage() {
  await requireEditor()
  const supabase = await createClient()

  const { data: places, error } = await supabase
    .from('places')
    .select('id, slug, name, borough, neighborhood, pizza_style, best_known_for, cheapest_slice_price, price_range, average_rating, is_deleted, deleted_at')
    .order('average_rating', { ascending: false })
    .limit(60)

  return (
    <AdminShell
      title='Places'
      description='Edit places, soft delete/restore them and keep pricing current.'
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

              <div className='flex flex-wrap items-center gap-3'>
                <h2 className='text-xl font-semibold text-white'>{place.name}</h2>
                {place.is_deleted ? (
                  <span className='rounded-full border border-yellow-800 bg-yellow-950 px-3 py-1 text-xs text-yellow-200'>
                    Soft deleted
                  </span>
                ) : null}
              </div>

              <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
                <input name='name' defaultValue={place.name} className='rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />
                <input name='neighborhood' defaultValue={place.neighborhood ?? ''} className='rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />
                <input name='borough' defaultValue={place.borough ?? ''} className='rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />
                <input name='pizza_style' defaultValue={place.pizza_style ?? ''} className='rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />
                <input name='best_known_for' defaultValue={place.best_known_for ?? ''} className='rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />
                <input name='cheapest_slice_price' type='number' step='0.01' defaultValue={place.cheapest_slice_price ?? ''} className='rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />
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

            <div className='mt-4 flex flex-wrap gap-3 border-t border-zinc-800 pt-4'>
              <form action={softDeletePlace}>
                <input type='hidden' name='id' value={place.id} />
                <button type='submit' className='rounded-2xl border border-yellow-800 bg-yellow-950 px-5 py-3 font-medium text-yellow-200 transition hover:bg-yellow-900'>
                  Soft delete
                </button>
              </form>

              <form action={restorePlace}>
                <input type='hidden' name='id' value={place.id} />
                <button type='submit' className='rounded-2xl border border-emerald-800 bg-emerald-950 px-5 py-3 font-medium text-emerald-200 transition hover:bg-emerald-900'>
                  Restore
                </button>
              </form>

              <form action={deletePlace}>
                <input type='hidden' name='id' value={place.id} />
                <button type='submit' className='rounded-2xl border border-red-900 bg-red-950 px-5 py-3 font-medium text-red-200 transition hover:bg-red-900'>
                  Hard delete
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  )
}
