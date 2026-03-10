'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, Shield, Trash2, RotateCcw, Ban, Filter } from 'lucide-react'

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
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'banned' | 'deleted'>('all')

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

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesQuery =
        !query ||
        `${user.email ?? ''} ${user.id}`.toLowerCase().includes(query.toLowerCase())

      const isBanned = !!user.banned_until
      const isDeleted = !!user.deleted_at

      const matchesStatus =
        status === 'all' ||
        (status === 'active' && !isBanned && !isDeleted) ||
        (status === 'banned' && isBanned) ||
        (status === 'deleted' && isDeleted)

      return matchesQuery && matchesStatus
    })
  }, [users, query, status])

  if (loading) {
    return (
      <div className='rounded-[28px] border border-[#2a3040] bg-[#101115]/95 p-6 shadow-xl text-[#a4adbf]'>
        Loading users...
      </div>
    )
  }

  return (
    <div className='space-y-5'>
      <div className='rounded-[28px] border border-[#2a3040] bg-[#101115]/95 p-5 shadow-xl'>
        <div className='grid gap-4 lg:grid-cols-[1.4fr_220px]'>
          <div className='relative'>
            <Search className='pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b8497]' />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Search by email or user id...'
              className='w-full rounded-2xl border border-[#2a3040] bg-[#151821] py-3 pl-11 pr-4 text-white outline-none'
            />
          </div>

          <div className='relative'>
            <Filter className='pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b8497]' />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className='w-full rounded-2xl border border-[#2a3040] bg-[#151821] py-3 pl-11 pr-4 text-white outline-none'
            >
              <option value='all'>All users</option>
              <option value='active'>Active</option>
              <option value='banned'>Banned</option>
              <option value='deleted'>Deleted</option>
            </select>
          </div>
        </div>

        <div className='mt-4 flex flex-wrap gap-3 text-sm text-[#a4adbf]'>
          <span>{filteredUsers.length} shown</span>
          <span>·</span>
          <span>{users.length} total</span>
        </div>
      </div>

      {error ? (
        <div className='rounded-2xl border border-red-900 bg-red-950 p-4 text-red-200'>
          {error}
        </div>
      ) : null}

      {filteredUsers.length === 0 && !error ? (
        <div className='rounded-[28px] border border-[#2a3040] bg-[#101115]/95 p-6 shadow-xl text-[#a4adbf]'>
          No users found.
        </div>
      ) : null}

      {filteredUsers.map((user) => {
        const isBanned = !!user.banned_until
        const isDeleted = !!user.deleted_at

        return (
          <div
            key={user.id}
            className='rounded-[28px] border border-[#2a3040] bg-[#101115]/95 p-5 shadow-xl'
          >
            <div className='flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between'>
              <div className='min-w-0'>
                <div className='flex flex-wrap items-center gap-2'>
                  <h2 className='truncate text-lg font-semibold text-white'>
                    {user.email || 'No email'}
                  </h2>

                  {isBanned ? (
                    <span className='rounded-full border border-yellow-800 bg-yellow-950 px-3 py-1 text-[11px] text-yellow-200'>
                      banned
                    </span>
                  ) : null}

                  {isDeleted ? (
                    <span className='rounded-full border border-red-900 bg-red-950 px-3 py-1 text-[11px] text-red-200'>
                      deleted
                    </span>
                  ) : null}

                  {!isBanned && !isDeleted ? (
                    <span className='rounded-full border border-[#254746] bg-[#183130] px-3 py-1 text-[11px] text-[#d5f1ee]'>
                      active
                    </span>
                  ) : null}
                </div>

                <p className='mt-2 break-all text-sm text-[#7b8497]'>{user.id}</p>
              </div>

              <div className='flex flex-wrap gap-2'>
                <button
                  onClick={() =>
                    doAction(user.id, 'PATCH', {
                      action: 'ban',
                      duration: '876000h',
                    })
                  }
                  className='inline-flex items-center gap-2 rounded-xl border border-yellow-800 bg-yellow-950 px-4 py-2 text-sm text-yellow-200'
                >
                  <Ban className='h-4 w-4' />
                  Ban
                </button>

                <button
                  onClick={() => doAction(user.id, 'PATCH', { action: 'unban' })}
                  className='inline-flex items-center gap-2 rounded-xl border border-emerald-800 bg-emerald-950 px-4 py-2 text-sm text-emerald-200'
                >
                  <RotateCcw className='h-4 w-4' />
                  Unban
                </button>

                <button
                  onClick={() => doAction(user.id, 'DELETE', {})}
                  className='inline-flex items-center gap-2 rounded-xl border border-[#34384a] bg-[#151821] px-4 py-2 text-sm text-white'
                >
                  <Shield className='h-4 w-4' />
                  Soft delete
                </button>

                <button
                  onClick={() => doAction(user.id, 'DELETE', { hardDelete: true })}
                  className='inline-flex items-center gap-2 rounded-xl border border-red-900 bg-red-950 px-4 py-2 text-sm text-red-200'
                >
                  <Trash2 className='h-4 w-4' />
                  Hard delete
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
