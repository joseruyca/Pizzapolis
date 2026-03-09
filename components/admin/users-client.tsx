'use client'

import { useEffect, useState } from 'react'

type AuthUser = {
  id: string
  email?: string | null
  banned_until?: string | null
  deleted_at?: string | null
  user_metadata?: Record<string, unknown>
}

export function UsersClient() {
  const [users, setUsers] = useState<AuthUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  async function safeJson(res: Response) {
    const text = await res.text()
    if (!text) return {}
    try {
      return JSON.parse(text)
    } catch {
      throw new Error(text.slice(0, 300) || 'Invalid server response')
    }
  }

  async function loadUsers() {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/users', { cache: 'no-store' })
      const json = await safeJson(res)

      if (!res.ok) {
        throw new Error(json.error || 'Failed to load users')
      }

      setUsers(json.users ?? [])
    } catch (err) {
      setUsers([])
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  async function doAction(
    id: string,
    method: 'PATCH' | 'DELETE',
    body?: Record<string, unknown>
  ) {
    setError('')

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body ?? {}),
      })

      const json = await safeJson(res)

      if (!res.ok) {
        throw new Error(json.error || 'User action failed')
      }

      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'User action failed')
    }
  }

  if (loading) {
    return (
      <div className='rounded-[28px] border border-zinc-800 bg-black/70 p-6 shadow-xl text-zinc-400'>
        Loading users...
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {error ? (
        <div className='rounded-2xl border border-red-900 bg-red-950 p-4 text-red-200'>
          {error}
        </div>
      ) : null}

      {users.length === 0 && !error ? (
        <div className='rounded-[28px] border border-zinc-800 bg-black/70 p-6 shadow-xl text-zinc-400'>
          No users found.
        </div>
      ) : null}

      {users.map((user) => (
        <div
          key={user.id}
          className='rounded-[28px] border border-zinc-800 bg-black/70 p-6 shadow-xl'
        >
          <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            <div>
              <h2 className='text-lg font-semibold text-white'>
                {user.email || 'No email'}
              </h2>
              <p className='mt-1 break-all text-sm text-zinc-500'>{user.id}</p>

              <div className='mt-3 flex flex-wrap gap-2 text-xs'>
                {user.banned_until ? (
                  <span className='rounded-full border border-yellow-800 bg-yellow-950 px-3 py-1 text-yellow-200'>
                    banned
                  </span>
                ) : null}

                {user.deleted_at ? (
                  <span className='rounded-full border border-red-900 bg-red-950 px-3 py-1 text-red-200'>
                    soft deleted
                  </span>
                ) : null}
              </div>
            </div>

            <div className='flex flex-wrap gap-2'>
              <button
                onClick={() =>
                  doAction(user.id, 'PATCH', {
                    action: 'ban',
                    duration: '876000h',
                  })
                }
                className='rounded-xl border border-yellow-800 bg-yellow-950 px-4 py-2 text-sm text-yellow-200'
              >
                Ban
              </button>

              <button
                onClick={() => doAction(user.id, 'PATCH', { action: 'unban' })}
                className='rounded-xl border border-emerald-800 bg-emerald-950 px-4 py-2 text-sm text-emerald-200'
              >
                Unban
              </button>

              <button
                onClick={() => doAction(user.id, 'DELETE', {})}
                className='rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-white'
              >
                Soft delete
              </button>

              <button
                onClick={() => doAction(user.id, 'DELETE', { hardDelete: true })}
                className='rounded-xl border border-red-900 bg-red-950 px-4 py-2 text-sm text-red-200'
              >
                Hard delete + cascade
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
