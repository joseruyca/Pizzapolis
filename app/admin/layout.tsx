import { requireStaff } from '@/lib/auth/is-admin'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireStaff()
  return <>{children}</>
}
