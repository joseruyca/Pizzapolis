import { createClient } from '@/lib/supabase/server'
import { requireStaff } from '@/lib/auth/is-admin'
import { AdminShell } from '@/components/admin/admin-shell'
import { updateReportStatus } from './actions'

function statusTone(status: string | null) {
  if (status === 'resolved') return 'border-emerald-800 bg-emerald-950 text-emerald-200'
  if (status === 'dismissed') return 'border-zinc-700 bg-zinc-900 text-zinc-300'
  if (status === 'reviewing') return 'border-yellow-800 bg-yellow-950 text-yellow-200'
  return 'border-red-900 bg-red-950 text-red-200'
}

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
      description='Track flagged content with a cleaner workflow: open, reviewing, resolved or dismissed.'
    >
      {error ? (
        <div className='rounded-2xl border border-red-900 bg-red-950 p-4 text-red-200'>
          Error loading reports: {error.message}
        </div>
      ) : null}

      <div className='space-y-4'>
        {(reports ?? []).map((report) => (
          <div key={report.id} className='rounded-[28px] border border-[#2a3040] bg-[#101115]/95 p-5 shadow-xl'>
            <div className='flex flex-wrap items-center gap-3'>
              <span className='rounded-full border border-[#34384a] bg-[#151821] px-3 py-1 text-[11px] text-[#dbe3f5]'>
                {report.target_type}
              </span>
              <span className={`rounded-full border px-3 py-1 text-[11px] ${statusTone(report.status)}`}>
                {report.status}
              </span>
            </div>

            <p className='mt-4 text-sm font-semibold text-white'>Target: {report.target_id}</p>
            <p className='mt-2 text-sm leading-6 text-[#a4adbf]'>{report.reason || 'No reason provided'}</p>
            <p className='mt-3 text-xs text-[#7b8497]'>{new Date(report.created_at).toLocaleString()}</p>

            <form action={updateReportStatus} className='mt-5 grid gap-3 md:grid-cols-[180px_1fr_auto]'>
              <input type='hidden' name='id' value={report.id} />
              <select
                name='status'
                defaultValue={report.status}
                className='rounded-2xl border border-[#2a3040] bg-[#151821] px-4 py-3 text-white'
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
                className='rounded-2xl border border-[#2a3040] bg-[#151821] px-4 py-3 text-white'
              />

              <button
                type='submit'
                className='rounded-2xl bg-[#f4ede2] px-5 py-3 font-semibold text-[#181510] transition hover:opacity-90'
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
