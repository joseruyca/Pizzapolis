import Link from 'next/link'
import { AppHeader } from '@/components/layout/app-header'
import { createClient } from '@/lib/supabase/server'
import { SignOutButton } from '@/components/auth/sign-out-button'

export default async function AccountPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main className='min-h-screen bg-black text-white'>
      <AppHeader />

      <div className='min-h-screen bg-[linear-gradient(180deg,rgba(60,0,0,0.28),rgba(0,0,0,0.96)_32%)]'>
        <div className='mx-auto max-w-4xl px-6 py-10'>
          <div className='rounded-[30px] border border-zinc-800 bg-black/80 p-8 shadow-2xl'>
            <p className='text-sm uppercase tracking-[0.22em] text-red-400'>
              Account
            </p>

            <h1 className='mt-4 text-4xl font-bold'>Your profile</h1>

            {!user ? (
              <div className='mt-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-6'>
                <p className='text-zinc-400'>You are not signed in.</p>
                <Link
                  href='/login'
                  className='mt-4 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-medium text-black transition hover:opacity-90'
                >
                  Sign in
                </Link>
              </div>
            ) : (
              <div className='mt-8 space-y-6'>
                <div className='rounded-3xl border border-zinc-800 bg-zinc-950 p-6'>
                  <p className='text-sm uppercase tracking-[0.18em] text-zinc-500'>
                    Email
                  </p>
                  <p className='mt-3 text-lg text-white'>{user.email}</p>
                </div>

                <div className='grid gap-4 md:grid-cols-3'>
                  <div className='rounded-3xl border border-zinc-800 bg-zinc-950 p-6'>
                    <p className='text-sm uppercase tracking-[0.18em] text-zinc-500'>
                      Reviews
                    </p>
                    <p className='mt-3 text-3xl font-bold text-white'>—</p>
                  </div>

                  <div className='rounded-3xl border border-zinc-800 bg-zinc-950 p-6'>
                    <p className='text-sm uppercase tracking-[0.18em] text-zinc-500'>
                      Comments
                    </p>
                    <p className='mt-3 text-3xl font-bold text-white'>—</p>
                  </div>

                  <div className='rounded-3xl border border-zinc-800 bg-zinc-950 p-6'>
                    <p className='text-sm uppercase tracking-[0.18em] text-zinc-500'>
                      Photos
                    </p>
                    <p className='mt-3 text-3xl font-bold text-white'>—</p>
                  </div>
                </div>

                <div className='flex flex-wrap gap-3'>
                  <Link
                    href='/explorar'
                    className='rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white transition hover:bg-zinc-900'
                  >
                    Back to map
                  </Link>
                  <SignOutButton />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
