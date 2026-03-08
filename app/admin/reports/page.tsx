import { createClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/auth/is-admin'
import { AdminShell } from '@/components/admin/admin-shell'

export default async function AdminReportsPage() {
  await requireStaff()
  const supabase = await createClient()

  const { data: reports, error } = await supabase
    .from('content_reports')
    .select('id, target_type, target_id, reason, status, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <AdminShell
      title='Reports'
      description='Review flagged content and future moderation reports.'
    >
      {error ? (
        <div className='rounded-2xl border border-red-900 bg-red-950 p-4 text-red-200'>
          Error loading reports: {error.message}
        </div>
      ) : null}

      <div className='space-y-4'>
        {(reports ?? []).length === 0 ? (
          <div className='rounded-[28px] border border-zinc-800 bg-black/70 p-6 shadow-xl text-zinc-500'>
            No reports yet.
          </div>
        ) : (
          (reports ?? []).map((report) => (
            <div key={report.id} className='rounded-[28px] border border-zinc-800 bg-black/70 p-6 shadow-xl'>
              <div className='flex flex-wrap items-center gap-3'>
                <span className='rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400'>
                  {report.target_type}
                </span>
                <span className='rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400'>
                  {report.status}
                </span>
              </div>

              <p className='mt-4 text-white'>Target: {report.target_id}</p>
              <p className='mt-2 text-zinc-400'>{report.reason || 'No reason provided'}</p>
              <p className='mt-3 text-xs text-zinc-500'>{new Date(report.created_at).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </AdminShell>
  )
}
