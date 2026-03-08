import { createClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/auth/is-admin'
import { AdminShell } from '@/components/admin/admin-shell'

export default async function AdminAnalyticsPage() {
  await requireStaff()
  const supabase = await createClient()

  const [reviewsRes, photosRes, placesRes, logsRes, reportsRes] = await Promise.all([
    supabase.from('reviews').select('place_id'),
    supabase.from('photos').select('place_id'),
    supabase.from('places').select('id, name, slug'),
    supabase.from('admin_audit_logs').select('id, action, created_at').order('created_at', { ascending: false }).limit(20),
    supabase.from('content_reports').select('id, status, created_at').order('created_at', { ascending: false }).limit(20),
  ])

  const places = placesRes.data ?? []
  const reviews = reviewsRes.data ?? []
  const photos = photosRes.data ?? []
  const logs = logsRes.data ?? []
  const reports = reportsRes.data ?? []

  const placeMap = new Map(places.map((p) => [p.id, p]))

  const reviewCounts = new Map<string, number>()
  for (const row of reviews) {
    if (!row.place_id) continue
    reviewCounts.set(row.place_id, (reviewCounts.get(row.place_id) ?? 0) + 1)
  }

  const photoCounts = new Map<string, number>()
  for (const row of photos) {
    if (!row.place_id) continue
    photoCounts.set(row.place_id, (photoCounts.get(row.place_id) ?? 0) + 1)
  }

  const topReviewed = Array.from(reviewCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id, count]) => ({ place: placeMap.get(id), count }))

  const topPhotographed = Array.from(photoCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id, count]) => ({ place: placeMap.get(id), count }))

  return (
    <AdminShell
      title='Analytics'
      description='Operational analytics from current platform data.'
    >
      <div className='grid gap-6 xl:grid-cols-2'>
        <section className='rounded-[28px] border border-zinc-800 bg-black/70 p-6 shadow-xl'>
          <h2 className='text-2xl font-semibold text-white'>Top reviewed places</h2>
          <div className='mt-5 space-y-3'>
            {topReviewed.map((item) => (
              <div key={item.place?.id || Math.random()} className='rounded-2xl border border-zinc-800 bg-zinc-950 p-4'>
                <div className='flex items-center justify-between gap-4'>
                  <p className='text-white'>{item.place?.name || 'Unknown place'}</p>
                  <span className='text-sm text-zinc-400'>{item.count} reviews</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className='rounded-[28px] border border-zinc-800 bg-black/70 p-6 shadow-xl'>
          <h2 className='text-2xl font-semibold text-white'>Top photographed places</h2>
          <div className='mt-5 space-y-3'>
            {topPhotographed.map((item) => (
              <div key={item.place?.id || Math.random()} className='rounded-2xl border border-zinc-800 bg-zinc-950 p-4'>
                <div className='flex items-center justify-between gap-4'>
                  <p className='text-white'>{item.place?.name || 'Unknown place'}</p>
                  <span className='text-sm text-zinc-400'>{item.count} uploads</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className='rounded-[28px] border border-zinc-800 bg-black/70 p-6 shadow-xl'>
          <h2 className='text-2xl font-semibold text-white'>Recent admin actions</h2>
          <div className='mt-5 space-y-3'>
            {logs.map((log) => (
              <div key={log.id} className='rounded-2xl border border-zinc-800 bg-zinc-950 p-4'>
                <div className='flex items-center justify-between gap-4'>
                  <p className='text-white'>{log.action}</p>
                  <span className='text-sm text-zinc-400'>{new Date(log.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className='rounded-[28px] border border-zinc-800 bg-black/70 p-6 shadow-xl'>
          <h2 className='text-2xl font-semibold text-white'>Recent reports</h2>
          <div className='mt-5 space-y-3'>
            {reports.map((report) => (
              <div key={report.id} className='rounded-2xl border border-zinc-800 bg-zinc-950 p-4'>
                <div className='flex items-center justify-between gap-4'>
                  <p className='text-white'>{report.status}</p>
                  <span className='text-sm text-zinc-400'>{new Date(report.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminShell>
  )
}
