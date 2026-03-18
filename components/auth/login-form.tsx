'use client'

import { useEffect, useState } from 'react'
import {
  signInWithGoogle,
  signInWithMagicLink,
  signInWithPassword,
  signUpWithPassword,
  sendPasswordReset,
} from '@/lib/actions/auth'

type Mode = 'signin' | 'signup' | 'forgot' | 'magic'

function ModeButton({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? 'bg-white text-black'
          : 'border border-zinc-700 bg-zinc-950 text-zinc-300 hover:bg-zinc-900'
      }`}
    >
      {children}
    </button>
  )
}

export function LoginForm({
  error,
  success,
  initialMode = 'signin',
}: {
  error?: string
  success?: string
  initialMode?: Mode
}) {
  const [mode, setMode] = useState<Mode>(initialMode)

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  return (
    <div className='mx-auto max-w-md rounded-[28px] border border-zinc-800 bg-zinc-900 p-6 text-white shadow-2xl'>
      <h1 className='text-3xl font-bold'>Access your account</h1>
      <p className='mt-2 text-sm leading-6 text-zinc-400'>
        Simple sign in, cleaner recovery, and less friction.
      </p>

      {error ? (
        <div className='mt-4 rounded-xl border border-red-900 bg-red-950 px-4 py-3 text-sm text-red-200'>
          {error}
        </div>
      ) : null}

      {success ? (
        <div className='mt-4 rounded-xl border border-emerald-900 bg-emerald-950 px-4 py-3 text-sm text-emerald-200'>
          {success}
        </div>
      ) : null}

      <form action={signInWithGoogle} className='mt-6'>
        <button
          type='submit'
          className='w-full rounded-2xl border border-zinc-700 bg-white px-4 py-3 font-semibold text-black transition hover:opacity-90'
        >
          Continue with Google
        </button>
      </form>

      <div className='my-6 flex items-center gap-3'>
        <div className='h-px flex-1 bg-zinc-800' />
        <span className='text-xs uppercase tracking-[0.18em] text-zinc-500'>or</span>
        <div className='h-px flex-1 bg-zinc-800' />
      </div>

      <div className='mb-5 flex flex-wrap gap-2'>
        <ModeButton active={mode === 'signin'} onClick={() => setMode('signin')}>
          Sign in
        </ModeButton>
        <ModeButton active={mode === 'signup'} onClick={() => setMode('signup')}>
          Create account
        </ModeButton>
        <ModeButton active={mode === 'forgot'} onClick={() => setMode('forgot')}>
          Reset password
        </ModeButton>
        <ModeButton active={mode === 'magic'} onClick={() => setMode('magic')}>
          Magic link
        </ModeButton>
      </div>

      {mode === 'signin' ? (
        <div className='space-y-4'>
          <form action={signInWithPassword} className='space-y-4'>
            <div>
              <label className='mb-2 block text-sm text-zinc-300'>Email</label>
              <input
                type='email'
                name='email'
                placeholder='you@example.com'
                className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-500'
                required
              />
            </div>

            <div>
              <label className='mb-2 block text-sm text-zinc-300'>Password</label>
              <input
                type='password'
                name='password'
                placeholder='Your password'
                className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-500'
                required
              />
            </div>

            <div className='flex items-center justify-between gap-3 text-sm'>
              <button
                type='button'
                onClick={() => setMode('forgot')}
                className='text-zinc-400 transition hover:text-white'
              >
                Forgot password?
              </button>

              <button
                type='button'
                onClick={() => setMode('magic')}
                className='text-zinc-400 transition hover:text-white'
              >
                Use magic link instead
              </button>
            </div>

            <button
              type='submit'
              className='w-full rounded-2xl bg-[#d94b5c] px-4 py-3 font-semibold text-white transition hover:bg-[#e15d6d]'
            >
              Sign in
            </button>
          </form>
        </div>
      ) : null}

      {mode === 'signup' ? (
        <form action={signUpWithPassword} className='space-y-4'>
          <div>
            <label className='mb-2 block text-sm text-zinc-300'>Email</label>
            <input
              type='email'
              name='email'
              placeholder='you@example.com'
              className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-500'
              required
            />
          </div>

          <div>
            <label className='mb-2 block text-sm text-zinc-300'>Password</label>
            <input
              type='password'
              name='password'
              placeholder='At least 8 characters'
              className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-500'
              required
            />
          </div>

          <div>
            <label className='mb-2 block text-sm text-zinc-300'>Confirm password</label>
            <input
              type='password'
              name='confirm_password'
              placeholder='Repeat password'
              className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-500'
              required
            />
          </div>

          <p className='text-xs leading-6 text-zinc-500'>
            Use at least 8 characters. After sign up, we’ll send a confirmation email.
          </p>

          <button
            type='submit'
            className='w-full rounded-2xl bg-[#d94b5c] px-4 py-3 font-semibold text-white transition hover:bg-[#e15d6d]'
          >
            Create account
          </button>
        </form>
      ) : null}

      {mode === 'forgot' ? (
        <form action={sendPasswordReset} className='space-y-4'>
          <div>
            <label className='mb-2 block text-sm text-zinc-300'>Email</label>
            <input
              type='email'
              name='email'
              placeholder='you@example.com'
              className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-500'
              required
            />
          </div>

          <p className='text-xs leading-6 text-zinc-500'>
            We’ll send you a password reset link.
          </p>

          <button
            type='submit'
            className='w-full rounded-2xl bg-[#d94b5c] px-4 py-3 font-semibold text-white transition hover:bg-[#e15d6d]'
          >
            Send reset link
          </button>
        </form>
      ) : null}

      {mode === 'magic' ? (
        <form action={signInWithMagicLink} className='space-y-4'>
          <div>
            <label className='mb-2 block text-sm text-zinc-300'>Email</label>
            <input
              type='email'
              name='email'
              placeholder='you@example.com'
              className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-500'
              required
            />
          </div>

          <p className='text-xs leading-6 text-zinc-500'>
            We’ll email you a secure sign-in link.
          </p>

          <button
            type='submit'
            className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 font-semibold text-white transition hover:bg-zinc-800'
          >
            Send magic link
          </button>

          <button
            type='button'
            onClick={() => setMode('signin')}
            className='w-full rounded-2xl border border-zinc-700 px-4 py-3 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900 hover:text-white'
          >
            Back to password sign in
          </button>
        </form>
      ) : null}
    </div>
  )
}