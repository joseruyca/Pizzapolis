import { AdminShell } from '@/components/admin/admin-shell'
import { UsersClient } from '@/components/admin/users-client'
import { requireAdmin } from '@/lib/auth/is-admin'

export default async function AdminUsersPage() {
  await requireAdmin()

  return (
    <AdminShell
      title='Users'
      description='Ban, unban, soft delete or hard delete auth users securely from the backend.'
    >
      <UsersClient />
    </AdminShell>
  )
}
