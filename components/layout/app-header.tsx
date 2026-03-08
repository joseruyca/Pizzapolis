import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { MobileSideMenu } from '@/components/layout/mobile-side-menu'

export async function AppHeader() {
  let userEmail: string | undefined
  let isSignedIn = false
  let isAdmin = false

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user?.email) {
      userEmail = user.email
      isSignedIn = true

      const { data: adminRow } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle()

      isAdmin = !!adminRow
    }
  } catch {
    userEmail = undefined
    isSignedIn = false
    isAdmin = false
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
          <Link href='/routes' className='text-sm text-zinc-300 transition hover:text-white'>
            Routes
          </Link>
          <Link href='/add-place' className='text-sm text-zinc-300 transition hover:text-white'>
            Suggest a Spot
          </Link>

          {isAdmin ? (
            <Link href='/admin' className='text-sm text-zinc-300 transition hover:text-white'>
              Admin Panel
            </Link>
          ) : null}

          <Link
            href={isSignedIn ? '/account' : '/login'}
            className='rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white transition hover:bg-zinc-900'
          >
            {isSignedIn ? 'Account' : 'Sign in'}
          </Link>
        </nav>

        <div className='md:hidden'>
          <MobileSideMenu userEmail={userEmail} isSignedIn={isSignedIn} isAdmin={isAdmin} />
        </div>
      </div>
    </header>
  )
}
