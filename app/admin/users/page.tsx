import { AppHeader } from '@/components/layout/app-header'

export default function AdminSectionPage() {
  return (
    <main className='min-h-screen bg-black text-white'>
      <AppHeader />
      <div className='min-h-screen bg-[linear-gradient(180deg,rgba(60,0,0,0.28),rgba(0,0,0,0.96)_28%)]'>
        <div className='mx-auto max-w-5xl px-6 py-10'>
          <p className='text-sm uppercase tracking-[0.22em] text-red-400'>Admin</p>
          <h1 className='mt-4 text-4xl font-bold tracking-tight'>Coming soon</h1>
          <p className='mt-4 max-w-2xl text-lg text-zinc-400'>
            This admin section is prepared and will be built next.
          </p>
        </div>
      </div>
    </main>
  )
}
