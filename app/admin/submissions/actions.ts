'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireEditor } from '@/lib/auth/is-admin'
import { slugify } from '@/lib/utils'
import { logAdminAction } from '@/lib/admin/audit'

export async function reviewSubmission(formData: FormData) {
  const session = await requireEditor()
  const supabase = await createClient()

  const id = String(formData.get('id') || '')
  const status = String(formData.get('status') || '')
  const reviewNotes = String(formData.get('review_notes') || '').trim()

  if (status === 'approved') {
    const { data: submission } = await supabase
      .from('place_submissions')
      .select('*')
      .eq('id', id)
      .single()

    if (submission) {
      const slug = `${slugify(submission.name)}-${Math.random().toString(36).slice(2, 6)}`
      const price =
        typeof submission.cheapest_slice_price === 'number'
          ? Number(submission.cheapest_slice_price)
          : null

      const priceRange =
        price === null ? null : price < 5 ? '$' : price < 12 ? '$$' : '$$$'

      const { data: place } = await supabase
        .from('places')
        .insert({
          slug,
          name: submission.name,
          address: submission.address,
          borough: submission.borough,
          neighborhood: submission.neighborhood,
          latitude: submission.latitude,
          longitude: submission.longitude,
          pizza_style: submission.pizza_style,
          cheapest_slice_price: price,
          price_range: priceRange,
          best_known_for: submission.best_known_for,
          description: submission.notes,
          price_updated_at: price !== null ? new Date().toISOString() : null,
        })
        .select('id')
        .single()

      await supabase
        .from('place_submissions')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: session.user.id,
          review_notes: reviewNotes || null,
          approved_place_id: place?.id ?? null,
        })
        .eq('id', id)

      await logAdminAction({
        action: 'submission.approve',
        entityType: 'place_submission',
        entityId: id,
        meta: { actor: session.user.email, approvedPlaceId: place?.id ?? null },
      })
    }
  } else {
    await supabase
      .from('place_submissions')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: session.user.id,
        review_notes: reviewNotes || null,
      })
      .eq('id', id)

    await logAdminAction({
      action: `submission.${status}`,
      entityType: 'place_submission',
      entityId: id,
      meta: { actor: session.user.email },
    })
  }

  revalidatePath('/admin/submissions')
  revalidatePath('/explorar')
}
