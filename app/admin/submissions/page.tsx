import { createClient } from '@/lib/supabase/server'
import { requireEditor } from '@/lib/auth/is-admin'
import { AdminShell } from '@/components/admin/admin-shell'
import { reviewSubmission } from './actions'

function statusTone(status: string | null) {
  if (status === 'approved') return 'border-emerald-800 bg-emerald-950 text-emerald-200'
  if (status === 'rejected') return 'border-red-900 bg-red-950 text-red-200'
  if (status === 'duplicate') return 'border-yellow-800 bg-yellow-950 text-yellow-200'
  return 'border-[#34384a] bg-[#151821] text-[#dbe3f5]'
}

export default async function AdminSubmissionsPage() {
  await requireEditor()
  const supabase = await createClient()

  const { data: submissions } = await supabase
    .from('place_submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <AdminShell
      title='Submissions'
      description='Review suggested places from the community and move them through a proper editorial workflow.'
    >
      <div className='space-y-4'>
        {(submissions ?? []).map((item) => (
          <div key={item.id} className='rounded-[28px] border border-[#2a3040] bg-[#101115]/95 p-5 shadow-xl'>
            <div className='flex flex-wrap items-center gap-3'>
              <h2 className='text-xl font-semibold text-white'>{item.name}</h2>
              <span className={`rounded-full border px-3 py-1 text-[11px] ${statusTone(item.status)}`}>
                {item.status}
              </span>
            </div>

            <p className='mt-3 text-sm text-[#dbe3f5]'>{item.address || 'No address'}</p>
            <p className='mt-1 text-sm text-[#7b8497]'>
              {[item.neighborhood, item.borough].filter(Boolean).join(', ')}
            </p>

            <form action={reviewSubmission} className='mt-5 grid gap-3 md:grid-cols-[180px_1fr_auto]'>
              <input type='hidden' name='id' value={item.id} />
              <select
                name='status'
                defaultValue={item.status}
                className='rounded-2xl border border-[#2a3040] bg-[#151821] px-4 py-3 text-white'
              >
                <option value='pending'>pending</option>
                <option value='approved'>approved</option>
                <option value='rejected'>rejected</option>
                <option value='duplicate'>duplicate</option>
              </select>
              <input
                name='review_notes'
                defaultValue={item.review_notes ?? ''}
                placeholder='Review notes'
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
