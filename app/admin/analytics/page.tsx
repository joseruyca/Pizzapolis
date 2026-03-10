import Link from 'next/link'
import {
  Activity,
  Camera,
  Flag,
  MessageSquare,
  ShieldCheck,
  Star,
  TrendingUp,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/auth/is-admin'
import { AdminShell } from '@/components/admin/admin-shell'

function SummaryCard({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string
  value: React.ReactNode
  hint?: string
  tone?: 'default' | 'gold' | 'red' | 'teal'
}) {
  const tones = {
    default: 'bg-[#101115] border-[#2a3040]',
    gold: 'bg-[#17140f] border-[#4a3a20]',
    red: 'bg-[#151018] border-[#4f2830]',
    teal: 'bg-[#101918] border-[#254746]',
  }

  return (
    <div className={`rounded-[24px] border p-4 ${tones[tone]}`}>
      <p className='text-[10px] uppercase tracking-[0.18em] text-[#7b8497]'>{label}</p>
      <p className='mt-2 text-3xl font-bold text-white'>{value}</p>
      {hint ? <p className='mt-2 text-xs text-[#a4adbf]'>{hint}</p> : null}
    </div>
  )
}

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className='rounded-[28px] border border-[#2a3040] bg-[#101115]/95 p-6 shadow-xl'>
      <div>
        <h2 className='text-2xl font-semibold text-white'>{title}</h2>
        {subtitle ? <p className='mt-2 text-sm text-[#a4adbf]'>{subtitle}</p> : null}
      </div>
      <div className='mt-5'>{children}</div>
    </section>
  )
}

function statusTone(status: string | null) {
  if (status === 'resolved') return 'border-emerald-800 bg-emerald-950 text-emerald-200'
  if (status === 'dismissed') return 'border-[#34384a] bg-[#151821] text-[#dbe3f5]'
  if (status === 'reviewing') return 'border-yellow-800 bg-yellow-950 text-yellow-200'
  return 'border-red-900 bg-red-950 text-red-200'
}

export default async function AdminAnalyticsPage() {
  await requireStaff()
  const supabase = await createClient()

  const [reviewsRes, photosRes, placesRes, logsRes, reportsRes] = await Promise.all([
    supabase.from('reviews').select('place_id'),
    supabase.from('photos').select('place_id'),
    supabase.from('places').select('id, name, slug'),
    supabase
      .from('admin_audit_logs')
      .select('id, action, created_at')
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('content_reports')
      .select('id, status, created_at')
      .order('created_at', { ascending: false })
      .limit(20),
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

  const openReports = reports.filter(
    (report) => report.status === 'open' || report.status === 'reviewing'
  ).length

  return (
    <AdminShell
      title='Analytics'
      description='Operational analytics from live platform activity: engagement, moderation flow and admin actions.'
    >
      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <SummaryCard
          label='Total reviews'
          value={reviews.length}
          hint='Review events across all places'
        />
        <SummaryCard
          label='Photo uploads'
          value={photos.length}
          hint='Image contribution volume'
          tone='teal'
        />
        <SummaryCard
          label='Recent admin actions'
          value={logs.length}
          hint='Last 20 staff events'
          tone='gold'
        />
        <SummaryCard
          label='Open / reviewing reports'
          value={openReports}
          hint='Needs active moderation'
          tone='red'
        />
      </div>

      <div className='mt-6 grid gap-6 xl:grid-cols-2'>
        <SectionCard
          title='Top reviewed places'
          subtitle='The places generating the most review activity.'
        >
          <div className='space-y-3'>
            {topReviewed.length === 0 ? (
              <p className='text-sm text-[#7b8497]'>No review activity yet.</p>
            ) : (
              topReviewed.map((item, index) => (
                <div key={item.place?.id || `${index}-${item.count}`} className='rounded-2xl border border-[#2a3040] bg-[#151821] p-4'>
                  <div className='flex items-center justify-between gap-4'>
                    <div className='min-w-0'>
                      {item.place?.slug ? (
                        <Link
                          href={`/places/${item.place.slug}`}
                          className='truncate text-white underline-offset-4 hover:underline'
                        >
                          {item.place.name}
                        </Link>
                      ) : (
                        <p className='text-white'>{item.place?.name || 'Unknown place'}</p>
                      )}
                      <p className='mt-1 text-xs text-[#7b8497]'>Rank #{index + 1}</p>
                    </div>

                    <span className='inline-flex items-center gap-2 rounded-full border border-[#4a3a20] bg-[#2f2615] px-3 py-1.5 text-sm text-[#ffe2a6]'>
                      <Star className='h-4 w-4' />
                      {item.count} reviews
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard
          title='Top photographed places'
          subtitle='Places generating the most visual community activity.'
        >
          <div className='space-y-3'>
            {topPhotographed.length === 0 ? (
              <p className='text-sm text-[#7b8497]'>No photo activity yet.</p>
            ) : (
              topPhotographed.map((item, index) => (
                <div key={item.place?.id || `${index}-${item.count}`} className='rounded-2xl border border-[#2a3040] bg-[#151821] p-4'>
                  <div className='flex items-center justify-between gap-4'>
                    <div className='min-w-0'>
                      {item.place?.slug ? (
                        <Link
                          href={`/places/${item.place.slug}`}
                          className='truncate text-white underline-offset-4 hover:underline'
                        >
                          {item.place.name}
                        </Link>
                      ) : (
                        <p className='text-white'>{item.place?.name || 'Unknown place'}</p>
                      )}
                      <p className='mt-1 text-xs text-[#7b8497]'>Rank #{index + 1}</p>
                    </div>

                    <span className='inline-flex items-center gap-2 rounded-full border border-[#254746] bg-[#183130] px-3 py-1.5 text-sm text-[#d5f1ee]'>
                      <Camera className='h-4 w-4' />
                      {item.count} uploads
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      <div className='mt-6 grid gap-6 xl:grid-cols-2'>
        <SectionCard
          title='Recent admin actions'
          subtitle='Latest staff actions recorded in the audit trail.'
        >
          <div className='space-y-3'>
            {logs.length === 0 ? (
              <p className='text-sm text-[#7b8497]'>No admin activity yet.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className='rounded-2xl border border-[#2a3040] bg-[#151821] p-4'>
                  <div className='flex items-center justify-between gap-4'>
                    <div className='min-w-0'>
                      <p className='inline-flex items-center gap-2 text-white'>
                        <ShieldCheck className='h-4 w-4 text-[#a4adbf]' />
                        {log.action}
                      </p>
                      <p className='mt-1 text-xs text-[#7b8497]'>Audit log entry</p>
                    </div>
                    <span className='text-sm text-[#a4adbf]'>
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard
          title='Recent reports'
          subtitle='Latest moderation reports and their current states.'
        >
          <div className='space-y-3'>
            {reports.length === 0 ? (
              <p className='text-sm text-[#7b8497]'>No reports yet.</p>
            ) : (
              reports.map((report) => (
                <div key={report.id} className='rounded-2xl border border-[#2a3040] bg-[#151821] p-4'>
                  <div className='flex items-center justify-between gap-4'>
                    <div className='min-w-0'>
                      <p className='inline-flex items-center gap-2 text-white'>
                        <Flag className='h-4 w-4 text-[#a4adbf]' />
                        Report #{report.id.slice(0, 8)}
                      </p>
                      <div className='mt-2'>
                        <span className={`rounded-full border px-3 py-1 text-[11px] ${statusTone(report.status)}`}>
                          {report.status}
                        </span>
                      </div>
                    </div>
                    <span className='text-sm text-[#a4adbf]'>
                      {new Date(report.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      <div className='mt-6 grid gap-6 xl:grid-cols-3'>
        <SectionCard
          title='Engagement signals'
          subtitle='Quick interpretation of current platform behavior.'
        >
          <div className='space-y-3'>
            <div className='rounded-2xl border border-[#2a3040] bg-[#151821] p-4'>
              <div className='flex items-center gap-3'>
                <TrendingUp className='h-5 w-5 text-[#a4adbf]' />
                <div>
                  <p className='text-sm font-medium text-white'>Review-led engagement</p>
                  <p className='mt-1 text-xs text-[#7b8497]'>
                    {reviews.length > photos.length
                      ? 'Reviews are currently outpacing photo uploads.'
                      : 'Photo uploads are currently matching or exceeding reviews.'}
                  </p>
                </div>
              </div>
            </div>

            <div className='rounded-2xl border border-[#2a3040] bg-[#151821] p-4'>
              <div className='flex items-center gap-3'>
                <MessageSquare className='h-5 w-5 text-[#a4adbf]' />
                <div>
                  <p className='text-sm font-medium text-white'>Community signal density</p>
                  <p className='mt-1 text-xs text-[#7b8497]'>
                    {reviews.length + photos.length} combined contribution events loaded.
                  </p>
                </div>
              </div>
            </div>

            <div className='rounded-2xl border border-[#2a3040] bg-[#151821] p-4'>
              <div className='flex items-center gap-3'>
                <Activity className='h-5 w-5 text-[#a4adbf]' />
                <div>
                  <p className='text-sm font-medium text-white'>Ops pulse</p>
                  <p className='mt-1 text-xs text-[#7b8497]'>
                    {logs.length} recent staff actions and {openReports} active moderation reports.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title='Most active review leader'
          subtitle='Top single place by review volume.'
        >
          {topReviewed[0]?.place ? (
            <div className='rounded-2xl border border-[#2a3040] bg-[#151821] p-5'>
              <p className='text-xs uppercase tracking-[0.18em] text-[#7b8497]'>Leader</p>
              <p className='mt-3 text-xl font-semibold text-white'>{topReviewed[0].place.name}</p>
              <p className='mt-2 text-sm text-[#a4adbf]'>{topReviewed[0].count} reviews</p>
            </div>
          ) : (
            <p className='text-sm text-[#7b8497]'>No leader yet.</p>
          )}
        </SectionCard>

        <SectionCard
          title='Most active photo leader'
          subtitle='Top single place by photo volume.'
        >
          {topPhotographed[0]?.place ? (
            <div className='rounded-2xl border border-[#2a3040] bg-[#151821] p-5'>
              <p className='text-xs uppercase tracking-[0.18em] text-[#7b8497]'>Leader</p>
              <p className='mt-3 text-xl font-semibold text-white'>{topPhotographed[0].place.name}</p>
              <p className='mt-2 text-sm text-[#a4adbf]'>{topPhotographed[0].count} uploads</p>
            </div>
          ) : (
            <p className='text-sm text-[#7b8497]'>No leader yet.</p>
          )}
        </SectionCard>
      </div>
    </AdminShell>
  )
}
