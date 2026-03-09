import { createClient } from '@/lib/supabase/server'
import { requireEditor } from '@/lib/auth/is-admin'
import { AdminShell } from '@/components/admin/admin-shell'
import { PlacesClient } from '@/components/admin/places-client'
import { deletePlace, updatePlaceBasics } from './actions'
import { restorePlace, softDeletePlace } from './restore-actions'

export default async function AdminPlacesPage() {
  await requireEditor()
  const supabase = await createClient()

  const { data: places, error } = await supabase
    .from('places')
    .select(`
      id,
      slug,
      name,
      borough,
      neighborhood,
      pizza_style,
      best_known_for,
      best_slice,
      best_whole_pie,
      first_order_recommendation,
      why_go,
      price_confidence,
      cheapest_slice_price,
      whole_pie_price,
      value_score,
      is_best_under_5,
      is_best_under_10,
      is_late_night,
      is_worth_the_trip,
      is_first_timer_friendly,
      price_range,
      average_rating,
      is_deleted,
      deleted_at
    `)
    .order('average_rating', { ascending: false })
    .limit(120)

  return (
    <AdminShell
      title='Places'
      description='Search, filter and update place intelligence in a much cleaner editing workflow.'
    >
      {error ? (
        <div className='rounded-2xl border border-red-900 bg-red-950 p-4 text-red-200'>
          Error loading places: {error.message}
        </div>
      ) : null}

      <PlacesClient
        places={places ?? []}
        updatePlaceBasics={updatePlaceBasics}
        softDeletePlace={softDeletePlace}
        restorePlace={restorePlace}
        deletePlace={deletePlace}
      />
    </AdminShell>
  )
}
