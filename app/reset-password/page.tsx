import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { updatePassword } from '@/lib/actions/auth'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <main className='min-h-screen bg-zinc-950 px-6 py-10'>
      <div className='mx-auto max-w-md rounded-[28px] border border-zinc-800 bg-zinc-900 p-6 text-white shadow-2xl'>
        <h1 className='text-3xl font-bold'>Reset password</h1>
        <p className='mt-2 text-sm leading-6 text-zinc-400'>
          Set a new password for your account.
        </p>

        {params.error ? (
          <div className='mt-4 rounded-xl border border-red-900 bg-red-950 px-4 py-3 text-sm text-red-200'>
            {params.error}
          </div>
        ) : null}

        {!user ? (
          <div className='mt-6 rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400'>
            Open this page from the password reset link sent to your email.
          </div>
        ) : (
          <form action={updatePassword} className='mt-6 space-y-4'>
            <div>
              <label className='mb-2 block text-sm text-zinc-300'>New password</label>
              <input
                type='password'
                name='password'
                placeholder='At least 8 characters'
                className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none'
                required
              />
            </div>

            <div>
              <label className='mb-2 block text-sm text-zinc-300'>Confirm password</label>
              <input
                type='password'
                name='confirm_password'
                placeholder='Repeat password'
                className='w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none'
                required
              />
            </div>

            <button
              type='submit'
              className='w-full rounded-2xl bg-[#d94b5c] px-4 py-3 font-semibold text-white transition hover:bg-[#e15d6d]'
            >
              Update password
            </button>
          </form>
        )}

        <div className='mt-6'>
          <Link
            href='/login'
            className='text-sm text-zinc-400 transition hover:text-white'
          >
            Back to login
          </Link>
        </div>
      </div>
    </main>
  )
}