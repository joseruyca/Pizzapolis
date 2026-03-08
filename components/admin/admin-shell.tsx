import Link from 'next/link'
import { AppHeader } from '@/components/layout/app-header'
import { getCurrentUserWithRole } from '@/lib/auth/is-admin'

const nav = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/places', label: 'Places' },
  { href: '/admin/guides', label: 'Guides' },
  { href: '/admin/moderation', label: 'Moderation' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/offers', label: 'Offers' },
  { href: '/admin/settings', label: 'Settings' },
]

export async function AdminShell({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  const session = await getCurrentUserWithRole()

  return (
    <main className='min-h-screen bg-black text-white'>
      <AppHeader />

      <div className='min-h-screen bg-[linear-gradient(180deg,rgba(60,0,0,0.20),rgba(0,0,0,0.96)_24%)]'>
        <div className='mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[260px_1fr] lg:px-6'>
          <aside className='rounded-[28px] border border-zinc-800 bg-black/70 p-4 shadow-xl h-fit'>
            <p className='text-xs uppercase tracking-[0.22em] text-red-400'>Admin</p>
            <h2 className='mt-3 text-2xl font-bold'>Control Center</h2>
            <p className='mt-2 text-sm text-zinc-400'>
              Role: <span className='text-white'>{session.role}</span>
            </p>

            <nav className='mt-6 space-y-2'>
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className='block rounded-2xl border border-zinc-800 px-4 py-3 text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white'
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          <section className='min-w-0'>
            <div className='mb-6 rounded-[28px] border border-zinc-800 bg-black/70 p-6 shadow-xl'>
              <p className='text-sm uppercase tracking-[0.22em] text-red-400'>Admin section</p>
              <h1 className='mt-3 text-4xl font-bold tracking-tight'>{title}</h1>
              {description ? (
                <p className='mt-3 max-w-3xl text-lg text-zinc-400'>{description}</p>
              ) : null}
            </div>

            {children}
          </section>
        </div>
      </div>
    </main>
  )
}
