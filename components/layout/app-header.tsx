import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MobileSideMenu } from '@/components/layout/mobile-side-menu'

export async function AppHeader() {
  let userEmail: string | undefined
  let isSignedIn = false

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user?.email) {
      userEmail = user.email
      isSignedIn = true
    }
  } catch {
    userEmail = undefined
    isSignedIn = false
  }

  return (
    <header className='sticky top-0 z-[1200] border-b border-zinc-800 bg-zinc-950/95 backdrop-blur'>
      <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
        <Link href='/' className='flex items-center gap-2 text-white'>
          <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-lg shadow-[0_8px_24px_rgba(239,68,68,0.35)]'>
            🍕
          </span>
          <span className='text-lg font-semibold tracking-tight'>PizzaHunt</span>
        </Link>

        <nav className='hidden items-center gap-6 md:flex'>
          <Link href='/' className='text-sm text-zinc-300 transition hover:text-white'>
            Home
          </Link>
          <Link href='/explorar' className='text-sm text-zinc-300 transition hover:text-white'>
            Map
          </Link>
          <Link href='/guides' className='text-sm text-zinc-300 transition hover:text-white'>
            Guides
          </Link>
          <Link href='/add-place' className='text-sm text-zinc-300 transition hover:text-white'>
            Suggest a Spot
          </Link>
          <Link href='/admin' className='text-sm text-zinc-300 transition hover:text-white'>
            Admin Panel
          </Link>
          <Link
            href={isSignedIn ? '/account' : '/login'}
            className='rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white transition hover:bg-zinc-900'
          >
            {isSignedIn ? 'Account' : 'Sign in'}
          </Link>
        </nav>

        <div className='md:hidden'>
          <MobileSideMenu userEmail={userEmail} isSignedIn={isSignedIn} />
        </div>
      </div>
    </header>
  )
}
