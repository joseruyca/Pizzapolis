import Link from 'next/link'
import {
  LayoutDashboard,
  BarChart3,
  MapPin,
  BookOpen,
  Route,
  ShieldCheck,
  Users,
  Flag,
  TicketPercent,
  Megaphone,
  Inbox,
  Settings,
  ChevronRight,
} from 'lucide-react'
import { AppHeader } from '@/components/layout/app-header'
import { getCurrentUserWithRole } from '@/lib/auth/is-admin'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/places', label: 'Places', icon: MapPin },
      { href: '/admin/guides', label: 'Guides', icon: BookOpen },
      { href: '/admin/routes', label: 'Routes', icon: Route },
      { href: '/admin/offers', label: 'Offers', icon: TicketPercent },
      { href: '/admin/banners', label: 'Banners', icon: Megaphone },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/admin/moderation', label: 'Moderation', icon: ShieldCheck },
      { href: '/admin/submissions', label: 'Submissions', icon: Inbox },
      { href: '/admin/reports', label: 'Reports', icon: Flag },
      { href: '/admin/users', label: 'Users', icon: Users },
    ],
  },
  {
    label: 'System',
    items: [{ href: '/admin/settings', label: 'Settings', icon: Settings }],
  },
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

      <div className='min-h-screen bg-[linear-gradient(180deg,rgba(60,0,0,0.16),rgba(0,0,0,0.96)_24%)]'>
        <div className='mx-auto max-w-7xl px-4 py-8 lg:px-6'>
          <div className='grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]'>
            <aside className='h-fit xl:sticky xl:top-24'>
              <div className='rounded-[28px] border border-zinc-800 bg-[#0e0e10]/90 p-5 shadow-xl backdrop-blur'>
                <div className='border-b border-zinc-800 pb-5'>
                  <p className='text-xs uppercase tracking-[0.22em] text-red-400'>Admin</p>
                  <h2 className='mt-3 text-2xl font-bold'>Control Center</h2>
                  <p className='mt-2 text-sm text-zinc-400'>
                    Role: <span className='text-white'>{session.role}</span>
                  </p>
                </div>

                <div className='mt-5 space-y-5'>
                  {navGroups.map((group) => (
                    <div key={group.label}>
                      <p className='mb-2 px-2 text-[11px] uppercase tracking-[0.18em] text-zinc-500'>
                        {group.label}
                      </p>

                      <div className='space-y-1'>
                        {group.items.map((item) => {
                          const Icon = item.icon

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className='flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-3 text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-white'
                            >
                              <span className='flex items-center gap-3'>
                                <Icon className='h-4 w-4 text-zinc-500' />
                                <span>{item.label}</span>
                              </span>
                              <ChevronRight className='h-4 w-4 text-zinc-700' />
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <section className='min-w-0'>
              <div className='mb-6 rounded-[28px] border border-zinc-800 bg-[#0e0e10]/90 p-6 shadow-xl backdrop-blur'>
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
      </div>
    </main>
  )
}
