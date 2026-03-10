'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireEditor } from '@/lib/auth/is-admin'
import { logAdminAction } from '@/lib/admin/audit'
import { slugify } from '@/lib/utils'

export async function createRoute(formData: FormData) {
  const session = await requireEditor()
  const supabase = await createClient()

  const title = String(formData.get('title') || '').trim()
  const subtitle = String(formData.get('subtitle') || '').trim()
  const description = String(formData.get('description') || '').trim()
  const estimatedMinutesRaw = String(formData.get('estimated_minutes') || '').trim()
  const borough = String(formData.get('borough') || '').trim()
  const routeType = String(formData.get('route_type') || '').trim()
  const coverImageUrl = String(formData.get('cover_image_url') || '').trim()

  if (!title) return

  const slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 6)}`
  const estimatedMinutes = estimatedMinutesRaw ? Number(estimatedMinutesRaw) : null

  const { data, error } = await supabase
    .from('pizza_routes')
    .insert({
      slug,
      title,
      subtitle: subtitle || null,
      description: description || null,
      estimated_minutes: estimatedMinutes,
      borough: borough || null,
      route_type: routeType || null,
      cover_image_url: coverImageUrl || null,
      is_published: false,
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  await logAdminAction({
    action: 'route.create',
    entityType: 'pizza_route',
    entityId: data?.id,
    meta: { actor: session.user.email, title },
  })

  revalidatePath('/admin/routes')
  revalidatePath('/routes')
}

export async function toggleRoutePublished(formData: FormData) {
  const session = await requireEditor()
  const supabase = await createClient()

  const id = String(formData.get('id') || '')
  const nextValue = String(formData.get('next_value') || '') === 'true'

  const { error } = await supabase.from('pizza_routes').update({ is_published: nextValue }).eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  await logAdminAction({
    action: nextValue ? 'route.publish' : 'route.unpublish',
    entityType: 'pizza_route',
    entityId: id,
    meta: { actor: session.user.email },
  })

  revalidatePath('/admin/routes')
  revalidatePath('/routes')
}

export async function deleteRoute(formData: FormData) {
  const session = await requireEditor()
  const supabase = await createClient()

  const id = String(formData.get('id') || '')
  const { error } = await supabase.from('pizza_routes').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  await logAdminAction({
    action: 'route.delete',
    entityType: 'pizza_route',
    entityId: id,
    meta: { actor: session.user.email },
  })

  revalidatePath('/admin/routes')
  revalidatePath('/routes')
}
