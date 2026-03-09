'use client'

import { useState } from 'react'

export default function TemporaryAdminPage() {
  const [key, setKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/temporary-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      })

      const json = await res.json()

      if (!res.ok || !json.ok) {
        setError('Invalid key')
        setLoading(false)
        return
      }

      window.location.href = '/admin'
    } catch {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  return (
    <main className='min-h-screen bg-black px-4 py-10 text-white'>
      <div className='mx-auto max-w-md rounded-[28px] border border-zinc-800 bg-zinc-950 p-6 shadow-xl'>
        <p className='text-sm uppercase tracking-[0.18em] text-red-400'>Temporary admin access</p>
        <h1 className='mt-3 text-3xl font-bold'>Enter secret key</h1>
        <p className='mt-3 text-sm leading-7 text-zinc-400'>
          Temporary access page for admin testing on Vercel.
        </p>

        <form onSubmit={handleSubmit} className='mt-6 space-y-4'>
          <input
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder='Secret key'
            className='w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-white outline-none'
          />

          <button
            type='submit'
            disabled={loading}
            className='w-full rounded-2xl bg-white px-4 py-3 font-medium text-black transition hover:opacity-90 disabled:opacity-60'
          >
            {loading ? 'Checking…' : 'Open admin'}
          </button>
        </form>

        {error ? (
          <div className='mt-4 rounded-2xl border border-red-900 bg-red-950 px-4 py-3 text-sm text-red-200'>
            {error}
          </div>
        ) : null}
      </div>
    </main>
  )
}
