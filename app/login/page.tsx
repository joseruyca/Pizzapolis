import Link from 'next/link'
import { LoginForm } from '@/components/auth/login-form'
import { createClient } from '@/lib/supabase/server'
import { SignOutButton } from '@/components/auth/sign-out-button'

const validModes = new Set(['signin', 'signup', 'forgot', 'magic'])

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string; e?: string; m?: string; mode?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const initialMode = validModes.has(params.mode || '')
    ? (params.mode as 'signin' | 'signup' | 'forgot' | 'magic')
    : 'signin'

  return (
    <main className='min-h-screen bg-zinc-950 px-6 py-10'>
      <div className='mx-auto max-w-5xl'>
        <div className='mb-8 flex flex-wrap items-center justify-between gap-4'>
          <div>
            <p className='text-sm uppercase tracking-[0.2em] text-zinc-500'>
              Pizza Hunt NYC
            </p>
            <h1 className='mt-2 text-4xl font-bold text-white'>Access your account</h1>
          </div>

          <Link
            href='/explorar'
            className='rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white transition hover:bg-zinc-900'
          >
            Back to explore
          </Link>
        </div>

        {user ? (
          <div className='mx-auto max-w-md rounded-[28px] border border-zinc-800 bg-zinc-900 p-6 text-white shadow-2xl'>
            <h2 className='text-2xl font-bold'>You are signed in</h2>
            <p className='mt-3 text-sm text-zinc-400'>{user.email}</p>

            <div className='mt-6 flex flex-wrap gap-3'>
              <Link
                href='/account'
                className='rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:opacity-90'
              >
                Go to account
              </Link>
              <Link
                href='/explorar'
                className='rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white transition hover:bg-zinc-900'
              >
                Go to map
              </Link>
              <SignOutButton />
            </div>
          </div>
        ) : (
          <LoginForm
            error={params.error || params.e}
            success={params.success || params.m}
            initialMode={initialMode}
          />
        )}
      </div>
    </main>
  )
}