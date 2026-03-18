import { signOut } from '@/lib/actions/auth'

export function SignOutButton({
  fullWidth = false,
}: {
  fullWidth?: boolean
}) {
  return (
    <form action={signOut} className={fullWidth ? 'w-full' : ''}>
      <button
        type='submit'
        className={`rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white transition hover:bg-zinc-900 ${
          fullWidth ? 'w-full text-left' : ''
        }`}
      >
        Sign out
      </button>
    </form>
  )
}