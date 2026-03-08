import { createClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/auth/is-admin'
import { AdminShell } from '@/components/admin/admin-shell'
import { updateReportStatus } from './actions'

export default async function AdminReportsPage() {
  await requireStaff()
  const supabase = await createClient()

  const { data: reports, error } = await supabase
    .from('content_reports')
    .select('id, target_type, target_id, reason, status, created_at, resolution_notes')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <AdminShell
      title='Reports'
      description='Review flagged content and update report status.'
    >
      {error ? (
        <div className='rounded-2xl border border-red-900 bg-red-950 p-4 text-red-200'>
          Error loading reports: {error.message}
        </div>
      ) : null}

      <div className='space-y-4'>
        {(reports ?? []).map((report) => (
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

            <form action={updateReportStatus} className='mt-5 grid gap-3 md:grid-cols-[180px_1fr_auto]'>
              <input type='hidden' name='id' value={report.id} />
              <select
                name='status'
                defaultValue={report.status}
                className='rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white'
              >
                <option value='open'>open</option>
                <option value='reviewing'>reviewing</option>
                <option value='resolved'>resolved</option>
                <option value='dismissed'>dismissed</option>
              </select>

              <input
                name='resolution_notes'
                defaultValue={report.resolution_notes ?? ''}
                placeholder='Resolution notes'
                className='rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white'
              />

              <button
                type='submit'
                className='rounded-2xl bg-white px-5 py-3 font-medium text-black transition hover:opacity-90'
              >
                Save
              </button>
            </form>
          </div>
        ))}
      </div>
    </AdminShell>
  )
}
