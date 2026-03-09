import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export type AdminRole = 'moderator' | 'editor' | 'admin'
export type AppRole = 'user' | AdminRole

const roleRank: Record<AppRole, number> = {
  user: 0,
  moderator: 1,
  editor: 2,
  admin: 3,
}

function normalizeRole(role: unknown): AppRole {
  if (role === 'moderator' || role === 'editor' || role === 'admin') {
    return role
  }
  return 'user'
}

function getDevBypassSession() {
  const bypassEnabled =
    process.env.NODE_ENV !== 'production' &&
    process.env.DEV_ADMIN_BYPASS === 'true'

  if (!bypassEnabled) return null

  return {
    user: {
      id: 'dev-admin-bypass',
      email: 'dev-admin@local.test',
    } as any,
    role: 'admin' as AppRole,
    isStaff: true,
    isAdmin: true,
  }
}

async function getTemporaryAdminSession() {
  const expected = process.env.ADMIN_TEMP_ACCESS_KEY
  if (!expected) return null

  const cookieStore = await cookies()
  const tempAdmin = cookieStore.get('temp_admin_access')?.value

  if (tempAdmin !== 'granted') return null

  return {
    user: {
      id: 'temporary-admin-access',
      email: 'temporary-admin@local.test',
    } as any,
    role: 'admin' as AppRole,
    isStaff: true,
    isAdmin: true,
  }
}

export async function getCurrentUserWithRole() {
  const devSession = getDevBypassSession()
  if (devSession) return devSession

  const tempSession = await getTemporaryAdminSession()
  if (tempSession) return tempSession

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      user: null,
      role: 'user' as AppRole,
      isStaff: false,
      isAdmin: false,
    }
  }

  const { data: adminRow } = await supabase
    .from('admin_users')
    .select('user_id, role')
    .eq('user_id', user.id)
    .maybeSingle()

  const role = normalizeRole(adminRow?.role)

  return {
    user,
    role,
    isStaff: role !== 'user',
    isAdmin: role === 'admin',
  }
}

export async function requireRole(minRole: AppRole) {
  const devSession = getDevBypassSession()
  if (devSession) return devSession

  const tempSession = await getTemporaryAdminSession()
  if (tempSession) return tempSession

  const session = await getCurrentUserWithRole()

  if (!session.user) {
    redirect('/login')
  }

  if (roleRank[session.role] < roleRank[minRole]) {
    redirect('/')
  }

  return session
}

export async function requireStaff() {
  return requireRole('moderator')
}

export async function requireEditor() {
  return requireRole('editor')
}

export async function requireAdmin() {
  return requireRole('admin')
}
