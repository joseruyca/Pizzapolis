import { signOut } from '@/lib/actions/auth'

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type='submit'
        className='rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white transition hover:bg-zinc-900'
      >
        Sign out
      </button>
    </form>
  )
}
