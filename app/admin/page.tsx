import Link from 'next/link'
import { AppHeader } from '@/components/layout/app-header'
import { getCurrentUserWithRole } from '@/lib/auth/is-admin'

function AdminCard({
  title,
  text,
  href,
}: {
  title: string
  text: string
  href: string
}) {
  return (
    <Link
      href={href}
      className='block rounded-[28px] border border-zinc-800 bg-black/70 p-6 transition hover:border-zinc-700 hover:bg-zinc-900/60'
    >
      <h2 className='text-2xl font-semibold text-white'>{title}</h2>
      <p className='mt-3 leading-7 text-zinc-400'>{text}</p>
      <div className='mt-6 inline-flex items-center gap-2 text-sm font-medium text-white'>
        <span>Open</span>
        <span>→</span>
      </div>
    </Link>
  )
}

export default async function AdminPage() {
  const session = await getCurrentUserWithRole()

  return (
    <main className='min-h-screen bg-black text-white'>
      <AppHeader />

      <div className='min-h-screen bg-[linear-gradient(180deg,rgba(60,0,0,0.28),rgba(0,0,0,0.96)_28%)]'>
        <div className='mx-auto max-w-6xl px-6 py-10'>
          <p className='text-sm uppercase tracking-[0.22em] text-red-400'>
            Admin
          </p>

          <h1 className='mt-4 text-5xl font-bold tracking-tight'>
            Control Center
          </h1>

          <p className='mt-5 max-w-2xl text-xl leading-8 text-zinc-300'>
            Role: <span className='font-semibold text-white'>{session.role}</span>
          </p>

          <div className='mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3'>
            <AdminCard
              title='Dashboard'
              text='Overview, recent activity and platform health.'
              href='/admin/dashboard'
            />
            <AdminCard
              title='Places'
              text='Edit pizza spots, prices, featured status and visibility.'
              href='/admin/places'
            />
            <AdminCard
              title='Guides'
              text='Create, publish and manage editorial pizza guides.'
              href='/admin/guides'
            />
            <AdminCard
              title='Moderation'
              text='Review comments, photos and community content.'
              href='/admin/moderation'
            />
            <AdminCard
              title='Users'
              text='Manage users, roles and account actions.'
              href='/admin/users'
            />
            <AdminCard
              title='Reports'
              text='Handle flagged content and future report queues.'
              href='/admin/reports'
            />
            <AdminCard
              title='Offers'
              text='Create pizzeria deals, sponsored content and promotions.'
              href='/admin/offers'
            />
            <AdminCard
              title='Settings'
              text='Control global site content and future configuration.'
              href='/admin/settings'
            />
          </div>
        </div>
      </div>
    </main>
  )
}
