'use server'

import { revalidatePath } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/public'
import { slugify } from '@/lib/utils'

export async function createGuide(formData: FormData) {
  const title = String(formData.get('title') || '').trim()
  const subtitle = String(formData.get('subtitle') || '').trim()
  const description = String(formData.get('description') || '').trim()

  if (!title) return

  const supabase = createPublicClient()
  const slug = slugify(title)

  await supabase.from('guides').insert({
    slug,
    title,
    subtitle: subtitle || null,
    description: description || null,
    is_published: false,
  })

  revalidatePath('/admin/guides')
  revalidatePath('/guides')
}

export async function toggleGuidePublished(formData: FormData) {
  const id = String(formData.get('id') || '').trim()
  const nextValue = String(formData.get('next_value') || '').trim() === 'true'

  if (!id) return

  const supabase = createPublicClient()

  await supabase
    .from('guides')
    .update({ is_published: nextValue })
    .eq('id', id)

  revalidatePath('/admin/guides')
  revalidatePath('/guides')
}

export async function deleteGuide(formData: FormData) {
  const id = String(formData.get('id') || '').trim()

  if (!id) return

  const supabase = createPublicClient()

  await supabase.from('guides').delete().eq('id', id)

  revalidatePath('/admin/guides')
  revalidatePath('/guides')
}
