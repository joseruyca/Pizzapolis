import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/is-admin'
import { AdminShell } from '@/components/admin/admin-shell'
import { setStaffRole } from './actions'

export default async function AdminUsersPage() {
  await requireAdmin()
  const supabase = await createClient()

  const [profilesRes, adminUsersRes] = await Promise.all([
    supabase.from('profiles').select('id, email, full_name').order('email', { ascending: true }).limit(100),
    supabase.from('admin_users').select('user_id, role'),
  ])

  const profiles = profilesRes.data ?? []
  const adminUsers = adminUsersRes.data ?? []
  const roleMap = new Map(adminUsers.map((row) => [row.user_id, row.role]))

  return (
    <AdminShell
      title='Users'
      description='Manage internal staff roles. Full auth-user deletion should be done later with a secure service-role backend.'
    >
      <div className='space-y-4'>
        {profiles.map((profile) => {
          const currentRole = roleMap.get(profile.id) ?? 'user'

          return (
            <div key={profile.id} className='rounded-[28px] border border-zinc-800 bg-black/70 p-6 shadow-xl'>
              <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
                <div>
                  <h2 className='text-lg font-semibold text-white'>
                    {profile.full_name || profile.email || 'Unknown user'}
                  </h2>
                  <p className='mt-1 text-sm text-zinc-400'>{profile.email || 'No email'}</p>
                  <p className='mt-2 text-xs uppercase tracking-[0.16em] text-zinc-500'>
                    current role: {currentRole}
                  </p>
                </div>

                <form action={setStaffRole} className='flex flex-wrap items-center gap-3'>
                  <input type='hidden' name='user_id' value={profile.id} />
                  <select
                    name='role'
                    defaultValue={currentRole}
                    className='rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white'
                  >
                    <option value='user'>user</option>
                    <option value='moderator'>moderator</option>
                    <option value='editor'>editor</option>
                    <option value='admin'>admin</option>
                  </select>

                  <button
                    type='submit'
                    className='rounded-2xl bg-white px-5 py-3 font-medium text-black transition hover:opacity-90'
                  >
                    Save role
                  </button>
                </form>
              </div>
            </div>
          )
        })}
      </div>
    </AdminShell>
  )
}
