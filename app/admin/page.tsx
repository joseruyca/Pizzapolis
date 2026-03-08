import Link from 'next/link'
import { AppHeader } from '@/components/layout/app-header'

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

export default function AdminPage() {
  return (
    <main className='min-h-screen bg-black text-white'>
      <AppHeader />

      <div className='min-h-screen bg-[linear-gradient(180deg,rgba(60,0,0,0.28),rgba(0,0,0,0.96)_28%)]'>
        <div className='mx-auto max-w-6xl px-6 py-10'>
          <p className='text-sm uppercase tracking-[0.22em] text-red-400'>
            Admin
          </p>

          <h1 className='mt-4 text-5xl font-bold tracking-tight'>
            Content Management
          </h1>

          <p className='mt-5 max-w-2xl text-xl leading-8 text-zinc-300'>
            Manage guides, featured content and future moderation tools.
          </p>

          <div className='mt-12 grid gap-6 lg:grid-cols-2'>
            <AdminCard
              title='Guides'
              text='Create, publish and manage editorial pizza guides.'
              href='/admin/guides'
            />

            <AdminCard
              title='Coming soon'
              text='Restaurant of the week, moderation, submissions and more.'
              href='/admin'
            />
          </div>
        </div>
      </div>
    </main>
  )
}
