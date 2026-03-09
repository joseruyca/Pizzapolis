import Link from 'next/link'
import {
  User,
  Home,
  Map,
  BookOpen,
  PlusCircle,
  Shield,
  Pizza,
} from 'lucide-react'
import { getCurrentUserWithRole } from '@/lib/auth/is-admin'
import { MobileSideMenu } from '@/components/layout/mobile-side-menu'

export async function AppHeader() {
  let userEmail: string | undefined
  let isSignedIn = false
  let isAdmin = false

  try {
    const session = await getCurrentUserWithRole()

    if (session.user?.email) {
      userEmail = session.user.email
      isSignedIn = true
      isAdmin = session.isAdmin
    }
  } catch {
    userEmail = undefined
    isSignedIn = false
    isAdmin = false
  }

  return (
    <header className='sticky top-0 z-[1200] border-b border-zinc-800 bg-zinc-950/95 backdrop-blur'>
      <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
        <Link href='/' className='flex items-center gap-3 text-white'>
          <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 shadow-[0_8px_24px_rgba(239,68,68,0.35)]'>
            <Pizza className='h-5 w-5 text-white' />
          </span>
          <span className='text-lg font-semibold tracking-tight'>PizzaHunt</span>
        </Link>

        <nav className='hidden items-center gap-5 md:flex'>
          <Link href='/' className='inline-flex items-center gap-2 text-sm text-zinc-300 transition hover:text-white'>
            <Home className='h-4 w-4' />
            <span>Home</span>
          </Link>

          <Link href='/explorar' className='inline-flex items-center gap-2 text-sm text-zinc-300 transition hover:text-white'>
            <Map className='h-4 w-4' />
            <span>Map</span>
          </Link>

          <Link href='/guides' className='inline-flex items-center gap-2 text-sm text-zinc-300 transition hover:text-white'>
            <BookOpen className='h-4 w-4' />
            <span>Guides</span>
          </Link>

          <Link href='/add-place' className='inline-flex items-center gap-2 text-sm text-zinc-300 transition hover:text-white'>
            <PlusCircle className='h-4 w-4' />
            <span>Suggest a Spot</span>
          </Link>

          {isAdmin ? (
            <Link href='/admin' className='inline-flex items-center gap-2 text-sm text-zinc-300 transition hover:text-white'>
              <Shield className='h-4 w-4' />
              <span>Admin Panel</span>
            </Link>
          ) : null}

          {isSignedIn ? (
            <Link
              href='/account'
              className='inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 text-white transition hover:bg-zinc-900'
              aria-label='Profile'
              title='Profile'
            >
              <User className='h-4 w-4' />
            </Link>
          ) : null}

          <Link
            href={isSignedIn ? '/account' : '/login'}
            className='rounded-xl border border-zinc-700 px-4 py-2 text-sm text-white transition hover:bg-zinc-900'
          >
            {isSignedIn ? 'Account' : 'Sign in'}
          </Link>
        </nav>

        <div className='flex items-center gap-2 md:hidden'>
          {isSignedIn ? (
            <Link
              href='/account'
              className='inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 text-white transition hover:bg-zinc-900'
              aria-label='Profile'
              title='Profile'
            >
              <User className='h-4 w-4' />
            </Link>
          ) : null}

          <MobileSideMenu
            userEmail={userEmail}
            isSignedIn={isSignedIn}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    </header>
  )
}
