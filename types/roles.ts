export type AdminRole = 'moderator' | 'editor' | 'admin'
export type AppRole = 'user' | AdminRole

export const ADMIN_ROLES: AdminRole[] = ['moderator', 'editor', 'admin']
