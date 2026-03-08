import { signInWithMagicLink } from '@/lib/actions/auth'

export function LoginForm({
  error,
  success,
}: {
  error?: string
  success?: string
}) {
  return (
    <div className='mx-auto max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-white'>
      <h1 className='text-2xl font-bold'>Sign in</h1>
      <p className='mt-2 text-sm text-zinc-400'>
        Enter with a magic link sent to your email.
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

      <form action={signInWithMagicLink} className='mt-6 space-y-4'>
        <div>
          <label className='mb-2 block text-sm text-zinc-300'>Email</label>
          <input
            type='email'
            name='email'
            placeholder='you@example.com'
            className='w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-500'
            required
          />
        </div>

        <button
          type='submit'
          className='w-full rounded-xl bg-white px-4 py-3 font-medium text-black transition hover:opacity-90'
        >
          Send magic link
        </button>
      </form>
    </div>
  )
}
