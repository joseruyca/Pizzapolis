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

function TabButton({
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
          : 'text-zinc-400 hover:bg-white/5 hover:text-white'
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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    setMode(initialMode)
  }, [initialMode])

  return (
    <div className='w-full max-w-md rounded-[28px] border border-white/10 bg-[#111114] p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] md:p-8'>
      <div className='mb-6 flex items-center justify-center'>
        <div className='inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1'>
          <TabButton active={mode === 'signin'} onClick={() => setMode('signin')}>
            Sign in
          </TabButton>
          <TabButton active={mode === 'signup'} onClick={() => setMode('signup')}>
            Sign up
          </TabButton>
          <TabButton active={mode === 'magic'} onClick={() => setMode('magic')}>
            Magic link
          </TabButton>
          <TabButton active={mode === 'forgot'} onClick={() => setMode('forgot')}>
            Reset
          </TabButton>
        </div>
      </div>

      <div className='mb-6 text-center'>
        <h1 className='text-2xl font-semibold tracking-tight text-white'>
          {mode === 'signup' ? 'Create account' : mode === 'forgot' ? 'Reset password' : mode === 'magic' ? 'Magic link' : 'Welcome back'}
        </h1>
      </div>

      {error ? (
        <div className='mb-4 rounded-2xl border border-red-900/60 bg-red-950/50 px-4 py-3 text-sm text-red-200'>
          {error}
        </div>
      ) : null}

      {success ? (
        <div className='mb-4 rounded-2xl border border-emerald-900/60 bg-emerald-950/50 px-4 py-3 text-sm text-emerald-200'>
          {success}
        </div>
      ) : null}

      {(mode === 'signin' || mode === 'signup') ? (
        <>
          <form action={signInWithGoogle} className='space-y-4'>
            <button
              type='submit'
              className='flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white px-4 py-3.5 font-medium text-black transition hover:opacity-95'
            >
              <span className='text-base'>G</span>
              <span>Continue with Google</span>
            </button>
          </form>

          <div className='my-5 flex items-center gap-3'>
            <div className='h-px flex-1 bg-white/10' />
            <span className='text-xs uppercase tracking-[0.18em] text-zinc-500'>or</span>
            <div className='h-px flex-1 bg-white/10' />
          </div>
        </>
      ) : null}

      {mode === 'signin' ? (
        <form action={signInWithPassword} className='space-y-4'>
          <div>
            <label className='mb-2 block text-sm text-zinc-300'>Email</label>
            <input
              type='email'
              name='email'
              autoComplete='email'
              placeholder='you@example.com'
              className='w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none placeholder:text-zinc-500 focus:border-white/20'
              required
            />
          </div>

          <div>
            <label className='mb-2 block text-sm text-zinc-300'>Password</label>
            <div className='relative'>
              <input
                type={showPassword ? 'text' : 'password'}
                name='password'
                autoComplete='current-password'
                placeholder='Password'
                className='w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 pr-20 text-white outline-none placeholder:text-zinc-500 focus:border-white/20'
                required
              />
              <button
                type='button'
                onClick={() => setShowPassword((v) => !v)}
                className='absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-zinc-400 transition hover:bg-white/5 hover:text-white'
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className='flex items-center justify-between text-sm'>
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
              Use magic link
            </button>
          </div>

          <button
            type='submit'
            className='w-full rounded-2xl bg-[#d94b5c] px-4 py-3.5 font-medium text-white transition hover:bg-[#e15d6d]'
          >
            Sign in
          </button>
        </form>
      ) : null}

      {mode === 'signup' ? (
        <form action={signUpWithPassword} className='space-y-4'>
          <div>
            <label className='mb-2 block text-sm text-zinc-300'>Email</label>
            <input
              type='email'
              name='email'
              autoComplete='email'
              placeholder='you@example.com'
              className='w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none placeholder:text-zinc-500 focus:border-white/20'
              required
            />
          </div>

          <div>
            <label className='mb-2 block text-sm text-zinc-300'>Password</label>
            <div className='relative'>
              <input
                type={showPassword ? 'text' : 'password'}
                name='password'
                autoComplete='new-password'
                placeholder='At least 8 characters'
                className='w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 pr-20 text-white outline-none placeholder:text-zinc-500 focus:border-white/20'
                required
              />
              <button
                type='button'
                onClick={() => setShowPassword((v) => !v)}
                className='absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-zinc-400 transition hover:bg-white/5 hover:text-white'
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div>
            <label className='mb-2 block text-sm text-zinc-300'>Confirm password</label>
            <div className='relative'>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name='confirm_password'
                autoComplete='new-password'
                placeholder='Repeat password'
                className='w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 pr-20 text-white outline-none placeholder:text-zinc-500 focus:border-white/20'
                required
              />
              <button
                type='button'
                onClick={() => setShowConfirmPassword((v) => !v)}
                className='absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs text-zinc-400 transition hover:bg-white/5 hover:text-white'
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <button
            type='submit'
            className='w-full rounded-2xl bg-[#d94b5c] px-4 py-3.5 font-medium text-white transition hover:bg-[#e15d6d]'
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
              autoComplete='email'
              placeholder='you@example.com'
              className='w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none placeholder:text-zinc-500 focus:border-white/20'
              required
            />
          </div>

          <button
            type='submit'
            className='w-full rounded-2xl bg-[#d94b5c] px-4 py-3.5 font-medium text-white transition hover:bg-[#e15d6d]'
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
              autoComplete='email'
              placeholder='you@example.com'
              className='w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white outline-none placeholder:text-zinc-500 focus:border-white/20'
              required
            />
          </div>

          <button
            type='submit'
            className='w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 font-medium text-white transition hover:bg-white/10'
          >
            Send magic link
          </button>

          <button
            type='button'
            onClick={() => setMode('signin')}
            className='w-full rounded-2xl border border-white/10 px-4 py-3.5 text-sm font-medium text-zinc-300 transition hover:bg-white/5 hover:text-white'
          >
            Back to sign in
          </button>
        </form>
      ) : null}
    </div>
  )
}