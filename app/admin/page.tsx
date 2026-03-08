import { AppHeader } from '@/components/layout/app-header'

export default function AdminPage() {
  return (
    <main className='min-h-screen bg-zinc-950 text-white'>
      <AppHeader />
      <div className='mx-auto max-w-7xl px-6 py-10'>
        <h1 className='text-4xl font-bold'>Admin</h1>
        <p className='mt-3 text-zinc-400'>Moderation tools and content management will be added here.</p>
      </div>
    </main>
  )
}
