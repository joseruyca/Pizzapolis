import { createClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/auth/is-admin'
import { AdminShell } from '@/components/admin/admin-shell'

export default async function AdminModerationPage() {
  await requireStaff()
  const supabase = await createClient()

  const [commentsRes, photosRes, profilesRes, placesRes] = await Promise.all([
    supabase.from('comments').select('id, content, created_at, user_id, place_id').order('created_at', { ascending: false }).limit(20),
    supabase.from('photos').select('id, image_url, created_at, user_id, place_id').order('created_at', { ascending: false }).limit(20),
    supabase.from('profiles').select('id, email, full_name'),
    supabase.from('places').select('id, name, slug'),
  ])

  const profiles = profilesRes.data ?? []
  const places = placesRes.data ?? []
  const comments = commentsRes.data ?? []
  const photos = photosRes.data ?? []

  const profileMap = new Map(profiles.map((p) => [p.id, p.full_name || p.email || 'Unknown user']))
  const placeMap = new Map(places.map((p) => [p.id, p.name]))

  return (
    <AdminShell
      title='Moderation'
      description='Review the latest user comments and media uploads.'
    >
      <div className='grid gap-6 xl:grid-cols-2'>
        <section className='rounded-[28px] border border-zinc-800 bg-black/70 p-6 shadow-xl'>
          <h2 className='text-2xl font-semibold text-white'>Recent comments</h2>
          <div className='mt-5 space-y-4'>
            {comments.map((comment) => (
              <div key={comment.id} className='rounded-2xl border border-zinc-800 bg-zinc-950 p-4'>
                <p className='text-sm font-medium text-white'>{profileMap.get(comment.user_id) || 'Unknown user'}</p>
                <p className='mt-2 text-sm leading-6 text-zinc-400'>{comment.content}</p>
                <div className='mt-3 flex items-center justify-between gap-4 text-xs text-zinc-500'>
                  <span>{placeMap.get(comment.place_id) || 'Unknown place'}</span>
                  <span>{new Date(comment.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className='rounded-[28px] border border-zinc-800 bg-black/70 p-6 shadow-xl'>
          <h2 className='text-2xl font-semibold text-white'>Recent uploads</h2>
          <div className='mt-5 space-y-4'>
            {photos.map((photo) => (
              <div key={photo.id} className='rounded-2xl border border-zinc-800 bg-zinc-950 p-4'>
                <p className='text-sm font-medium text-white'>{profileMap.get(photo.user_id) || 'Unknown user'}</p>
                <div className='mt-3 flex items-center gap-4'>
                  <div className='h-16 w-16 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900'>
                    {photo.image_url ? (
                      <img src={photo.image_url} alt='Upload preview' className='h-full w-full object-cover' />
                    ) : null}
                  </div>
                  <div>
                    <p className='text-sm text-zinc-300'>{placeMap.get(photo.place_id) || 'Unknown place'}</p>
                    <p className='mt-1 text-xs text-zinc-500'>{new Date(photo.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  )
}
