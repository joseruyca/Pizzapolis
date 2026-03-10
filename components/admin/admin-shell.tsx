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
  Activity,
  Search,
  ClipboardList,
} from 'lucide-react'
import { AppHeader } from '@/components/layout/app-header'
import { getCurrentUserWithRole } from '@/lib/auth/is-admin'

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, hint: 'Health, queues and quick actions' },
      { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, hint: 'Traffic, engagement and trends' },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/places', label: 'Places', icon: MapPin, hint: 'Core location data' },
      { href: '/admin/guides', label: 'Guides', icon: BookOpen, hint: 'Editorial content' },
      { href: '/admin/routes', label: 'Routes', icon: Route, hint: 'Curated route builder' },
      { href: '/admin/offers', label: 'Offers', icon: TicketPercent, hint: 'Deals and promos' },
      { href: '/admin/banners', label: 'Banners', icon: Megaphone, hint: 'Homepage messages' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/admin/moderation', label: 'Moderation', icon: ShieldCheck, hint: 'Photos and comments queue' },
      { href: '/admin/submissions', label: 'Submissions', icon: Inbox, hint: 'Community suggestions' },
      { href: '/admin/reports', label: 'Reports', icon: Flag, hint: 'Flagged content workflow' },
      { href: '/admin/users', label: 'Users', icon: Users, hint: 'Roles and account control' },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/admin/audit-log', label: 'Audit log', icon: ClipboardList, hint: 'Trace every admin action' },
      { href: '/admin/settings', label: 'Settings', icon: Settings, hint: 'Platform controls' },
    ],
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
    <main className='min-h-screen bg-[#09090b] text-white'>
      <AppHeader />

      <div className='min-h-screen bg-[linear-gradient(180deg,rgba(217,75,92,0.08),rgba(0,0,0,0.96)_24%)]'>
        <div className='mx-auto max-w-7xl px-4 py-6 lg:px-6 lg:py-8'>
          <div className='mb-6 rounded-[28px] border border-[#2a3040] bg-[#101115]/95 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur sm:p-6'>
            <div className='flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between'>
              <div className='min-w-0'>
                <p className='text-xs uppercase tracking-[0.22em] text-[#d94b5c]'>Admin section</p>
                <h1 className='mt-2 text-3xl font-bold tracking-tight sm:text-4xl'>{title}</h1>
                {description ? (
                  <p className='mt-3 max-w-3xl text-sm leading-7 text-[#a4adbf] sm:text-base'>
                    {description}
                  </p>
                ) : null}
              </div>

              <div className='grid gap-3 sm:grid-cols-3 xl:w-[460px]'>
                <div className='rounded-2xl border border-[#2a3040] bg-[#151821] px-4 py-3'>
                  <p className='text-[10px] uppercase tracking-[0.18em] text-[#7b8497]'>Role</p>
                  <p className='mt-1.5 text-sm font-semibold text-white'>{session.role}</p>
                </div>
                <div className='rounded-2xl border border-[#2a3040] bg-[#151821] px-4 py-3'>
                  <p className='text-[10px] uppercase tracking-[0.18em] text-[#7b8497]'>Access</p>
                  <p className='mt-1.5 text-sm font-semibold text-white'>
                    {session.isAdmin ? 'Full admin' : session.isStaff ? 'Staff access' : 'Restricted'}
                  </p>
                </div>
                <div className='rounded-2xl border border-[#2a3040] bg-[#151821] px-4 py-3'>
                  <p className='text-[10px] uppercase tracking-[0.18em] text-[#7b8497]'>Mode</p>
                  <p className='mt-1.5 inline-flex items-center gap-2 text-sm font-semibold text-white'>
                    <Activity className='h-4 w-4 text-[#73b68c]' />
                    <span>Operational</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className='grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]'>
            <aside className='h-fit xl:sticky xl:top-24'>
              <div className='rounded-[28px] border border-[#2a3040] bg-[#101115]/95 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur'>
                <div className='border-b border-[#2a3040] pb-5'>
                  <p className='text-xs uppercase tracking-[0.22em] text-[#d94b5c]'>Control center</p>
                  <h2 className='mt-3 text-2xl font-bold'>Admin panel</h2>
                  <p className='mt-2 text-sm leading-6 text-[#a4adbf]'>
                    Built to manage content, moderation, community and operations from one place.
                  </p>

                  <form action='/admin/search' method='get' className='mt-4'>
                    <div className='relative'>
                      <Search className='pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b8497]' />
                      <input
                        name='q'
                        placeholder='Search places, users, routes...'
                        className='w-full rounded-2xl border border-[#2a3040] bg-[#151821] py-3 pl-11 pr-4 text-sm text-white outline-none'
                      />
                    </div>
                  </form>
                </div>

                <div className='mt-5 space-y-5'>
                  {navGroups.map((group) => (
                    <div key={group.label}>
                      <p className='mb-2 px-2 text-[11px] uppercase tracking-[0.18em] text-[#7b8497]'>
                        {group.label}
                      </p>

                      <div className='space-y-2'>
                        {group.items.map((item) => {
                          const Icon = item.icon

                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className='flex items-center justify-between rounded-2xl border border-[#2a3040] bg-[#151821] px-4 py-3 transition hover:border-[#3b4358] hover:bg-[#1a1f2b]'
                            >
                              <span className='min-w-0'>
                                <span className='flex items-center gap-3 text-sm font-medium text-white'>
                                  <Icon className='h-4 w-4 shrink-0 text-[#7b8497]' />
                                  <span>{item.label}</span>
                                </span>
                                <span className='mt-1 block pl-7 text-xs text-[#7b8497]'>
                                  {item.hint}
                                </span>
                              </span>
                              <ChevronRight className='h-4 w-4 shrink-0 text-[#596176]' />
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <section className='min-w-0'>{children}</section>
          </div>
        </div>
      </div>
    </main>
  )
}
