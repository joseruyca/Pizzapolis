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
    <main className='min-h-screen bg-[linear-gradient(180deg,#09090B_0%,#111114_100%)] px-6 py-8 md:py-12'>
      <div className='mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center justify-center'>
        <div className='w-full'>
          <div className='mb-8 flex flex-wrap items-center justify-between gap-4'>
            <Link href='/' className='inline-flex items-center gap-3 text-white'>
              <span className='flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d94b5c] text-lg shadow-[0_14px_30px_rgba(217,75,92,0.28)]'>
                🍕
              </span>
              <div>
                <p className='text-lg font-semibold tracking-tight'>Pizzapolis</p>
              </div>
            </Link>

            <Link
              href='/explorar'
              className='rounded-xl border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/5'
            >
              Back
            </Link>
          </div>

          <div className='flex justify-center'>
            {user ? (
              <div className='w-full max-w-md rounded-[28px] border border-white/10 bg-[#111114] p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)] md:p-8'>
                <h1 className='text-2xl font-semibold tracking-tight'>You’re signed in</h1>

                <div className='mt-5 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4'>
                  <p className='text-xs uppercase tracking-[0.18em] text-zinc-500'>Email</p>
                  <p className='mt-2 break-all text-sm font-medium text-white'>{user.email}</p>
                </div>

                <div className='mt-5 grid gap-3'>
                  <Link
                    href='/account'
                    className='rounded-2xl bg-white px-4 py-3.5 text-center text-sm font-medium text-black transition hover:opacity-95'
                  >
                    Go to account
                  </Link>

                  <Link
                    href='/explorar'
                    className='rounded-2xl border border-white/10 px-4 py-3.5 text-center text-sm font-medium text-white transition hover:bg-white/5'
                  >
                    Explore map
                  </Link>

                  <SignOutButton fullWidth />
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
        </div>
      </div>
    </main>
  )
}