'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireEditor } from '@/lib/auth/is-admin'
import { slugify } from '@/lib/utils'
import { logAdminAction } from '@/lib/admin/audit'

export async function createGuide(formData: FormData) {
  const session = await requireEditor()

  const title = String(formData.get('title') || '').trim()
  const subtitle = String(formData.get('subtitle') || '').trim()
  const description = String(formData.get('description') || '').trim()

  if (!title) return

  const supabase = await createClient()
  const slug = slugify(title)

  const { data } = await supabase
    .from('guides')
    .insert({
      slug,
      title,
      subtitle: subtitle || null,
      description: description || null,
      is_published: false,
    })
    .select('id, slug')
    .single()

  await logAdminAction({
    action: 'guide.create',
    entityType: 'guide',
    entityId: data?.id,
    meta: {
      title,
      slug,
      actor: session.user.email,
    },
  })

  revalidatePath('/admin/guides')
  revalidatePath('/guides')
}

export async function toggleGuidePublished(formData: FormData) {
  const session = await requireEditor()

  const id = String(formData.get('id') || '').trim()
  const nextValue = String(formData.get('next_value') || '').trim() === 'true'

  if (!id) return

  const supabase = await createClient()

  await supabase
    .from('guides')
    .update({ is_published: nextValue })
    .eq('id', id)

  await logAdminAction({
    action: nextValue ? 'guide.publish' : 'guide.unpublish',
    entityType: 'guide',
    entityId: id,
    meta: {
      actor: session.user.email,
      nextValue,
    },
  })

  revalidatePath('/admin/guides')
  revalidatePath('/guides')
}

export async function deleteGuide(formData: FormData) {
  const session = await requireEditor()

  const id = String(formData.get('id') || '').trim()
  if (!id) return

  const supabase = await createClient()

  await supabase.from('guides').delete().eq('id', id)

  await logAdminAction({
    action: 'guide.delete',
    entityType: 'guide',
    entityId: id,
    meta: {
      actor: session.user.email,
    },
  })

  revalidatePath('/admin/guides')
  revalidatePath('/guides')
}
