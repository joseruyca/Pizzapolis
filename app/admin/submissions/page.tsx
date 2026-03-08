import { createClient } from '@/lib/supabase/server'
import { requireEditor } from '@/lib/auth/is-admin'
import { AdminShell } from '@/components/admin/admin-shell'
import { reviewSubmission } from './actions'

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
      description='Review suggested pizza spots and approve them into the public map.'
    >
      <div className='space-y-4'>
        {(submissions ?? []).map((item) => (
          <div key={item.id} className='rounded-[28px] border border-zinc-800 bg-black/70 p-6 shadow-xl'>
            <div className='flex flex-wrap items-center gap-3'>
              <h2 className='text-xl font-semibold text-white'>{item.name}</h2>
              <span className='rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400'>
                {item.status}
              </span>
            </div>

            <p className='mt-2 text-zinc-400'>{item.address || 'No address'}</p>
            <p className='mt-2 text-sm text-zinc-500'>
              {[item.neighborhood, item.borough].filter(Boolean).join(', ')}
            </p>

            <form action={reviewSubmission} className='mt-5 grid gap-3 md:grid-cols-[180px_1fr_auto]'>
              <input type='hidden' name='id' value={item.id} />
              <select name='status' defaultValue={item.status} className='rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white'>
                <option value='pending'>pending</option>
                <option value='approved'>approved</option>
                <option value='rejected'>rejected</option>
                <option value='duplicate'>duplicate</option>
              </select>
              <input name='review_notes' defaultValue={item.review_notes ?? ''} placeholder='Review notes' className='rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white' />
              <button type='submit' className='rounded-2xl bg-white px-5 py-3 font-medium text-black transition hover:opacity-90'>
                Save
              </button>
            </form>
          </div>
        ))}
      </div>
    </AdminShell>
  )
}
