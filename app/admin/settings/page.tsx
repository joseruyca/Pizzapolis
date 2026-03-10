import { Settings, Home, Star, Type, ToggleLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/is-admin'
import { AdminShell } from '@/components/admin/admin-shell'
import { updateHomeSettings } from './actions'
import { updateRestaurantOfTheWeek } from './featured-actions'

function SummaryCard({
  label,
  value,
  hint,
  tone = 'default',
}: {
  label: string
  value: React.ReactNode
  hint?: string
  tone?: 'default' | 'gold' | 'teal'
}) {
  const tones = {
    default: 'bg-[#101115] border-[#2a3040]',
    gold: 'bg-[#17140f] border-[#4a3a20]',
    teal: 'bg-[#101918] border-[#254746]',
  }

  return (
    <div className={`rounded-[24px] border p-4 ${tones[tone]}`}>
      <p className='text-[10px] uppercase tracking-[0.18em] text-[#7b8497]'>{label}</p>
      <p className='mt-2 text-3xl font-bold text-white'>{value}</p>
      {hint ? <p className='mt-2 text-xs text-[#a4adbf]'>{hint}</p> : null}
    </div>
  )
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className='flex items-start gap-3'>
      <div className='rounded-2xl border border-[#2a3040] bg-[#151821] p-3 text-[#a4adbf]'>
        {icon}
      </div>
      <div>
        <h2 className='text-2xl font-semibold text-white'>{title}</h2>
        <p className='mt-1 text-sm leading-6 text-[#7b8497]'>{description}</p>
      </div>
    </div>
  )
}

export default async function AdminSettingsPage() {
  await requireAdmin()
  const supabase = await createClient()

  const [homeRes, featuredRes, placesRes] = await Promise.all([
    supabase.from('site_settings').select('key, value').eq('key', 'home').maybeSingle(),
    supabase.from('featured_slots').select('*').eq('key', 'restaurant_of_the_week').maybeSingle(),
    supabase.from('places').select('id, name').order('name', { ascending: true }).limit(150),
  ])

  const home = (homeRes.data?.value as {
    featuredTitle?: string
    featuredSubtitle?: string
    featuredDescription?: string
  } | null) ?? {}

  const featured = featuredRes.data
  const places = placesRes.data ?? []

  return (
    <AdminShell
      title='Settings'
      description='Manage homepage copy, featured content and core presentation settings from one global control area.'
    >
      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <SummaryCard
          label='Home copy'
          value={home.featuredTitle ? 'Set' : 'Empty'}
          hint='Main homepage featured copy'
        />
        <SummaryCard
          label='Featured place'
          value={featured?.place_id ? 'Assigned' : 'None'}
          hint='Restaurant of the week'
          tone='gold'
        />
        <SummaryCard
          label='Featured active'
          value={featured?.is_active ? 'Yes' : 'No'}
          hint='Publicly visible featured slot'
          tone='teal'
        />
        <SummaryCard
          label='Selectable places'
          value={places.length}
          hint='Available for featured slot'
        />
      </div>

      <div className='mt-6 grid gap-6 xl:grid-cols-2'>
        <section className='rounded-[28px] border border-[#2a3040] bg-[#101115]/95 p-6 shadow-xl'>
          <SectionHeader
            icon={<Home className='h-5 w-5' />}
            title='Home copy'
            description='Edit the main homepage featured text block that frames the editorial section.'
          />

          <form action={updateHomeSettings} className='mt-6 space-y-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-[#dbe3f5]'>Featured title</label>
              <input
                name='featuredTitle'
                defaultValue={home.featuredTitle ?? ''}
                placeholder='Featured title'
                className='w-full rounded-2xl border border-[#2a3040] bg-[#151821] px-4 py-3 text-white'
              />
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium text-[#dbe3f5]'>Featured subtitle</label>
              <input
                name='featuredSubtitle'
                defaultValue={home.featuredSubtitle ?? ''}
                placeholder='Featured subtitle'
                className='w-full rounded-2xl border border-[#2a3040] bg-[#151821] px-4 py-3 text-white'
              />
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium text-[#dbe3f5]'>Featured description</label>
              <textarea
                name='featuredDescription'
                rows={5}
                defaultValue={home.featuredDescription ?? ''}
                placeholder='Featured description'
                className='w-full rounded-2xl border border-[#2a3040] bg-[#151821] px-4 py-3 text-white'
              />
            </div>

            <button
              type='submit'
              className='inline-flex items-center gap-2 rounded-2xl bg-[#f4ede2] px-5 py-3 font-semibold text-[#181510] transition hover:opacity-90'
            >
              <Type className='h-4 w-4' />
              Save home settings
            </button>
          </form>
        </section>

        <section className='rounded-[28px] border border-[#2a3040] bg-[#101115]/95 p-6 shadow-xl'>
          <SectionHeader
            icon={<Star className='h-5 w-5' />}
            title='Restaurant of the Week'
            description='Control the featured place module, messaging and visibility state.'
          />

          <form action={updateRestaurantOfTheWeek} className='mt-6 space-y-4'>
            <div className='space-y-2'>
              <label className='text-sm font-medium text-[#dbe3f5]'>Select place</label>
              <select
                name='place_id'
                defaultValue={featured?.place_id ?? ''}
                className='w-full rounded-2xl border border-[#2a3040] bg-[#151821] px-4 py-3 text-white'
              >
                <option value=''>No place selected</option>
                {places.map((place) => (
                  <option key={place.id} value={place.id}>
                    {place.name}
                  </option>
                ))}
              </select>
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium text-[#dbe3f5]'>Section title</label>
              <input
                name='title'
                defaultValue={featured?.title ?? ''}
                placeholder='Section title'
                className='w-full rounded-2xl border border-[#2a3040] bg-[#151821] px-4 py-3 text-white'
              />
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium text-[#dbe3f5]'>Section subtitle</label>
              <input
                name='subtitle'
                defaultValue={featured?.subtitle ?? ''}
                placeholder='Section subtitle'
                className='w-full rounded-2xl border border-[#2a3040] bg-[#151821] px-4 py-3 text-white'
              />
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium text-[#dbe3f5]'>Description</label>
              <textarea
                name='description'
                rows={5}
                defaultValue={featured?.description ?? ''}
                placeholder='Short description'
                className='w-full rounded-2xl border border-[#2a3040] bg-[#151821] px-4 py-3 text-white'
              />
            </div>

            <div className='space-y-2'>
              <label className='text-sm font-medium text-[#dbe3f5]'>Visibility</label>
              <div className='relative'>
                <ToggleLeft className='pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7b8497]' />
                <select
                  name='is_active'
                  defaultValue={featured?.is_active ? 'true' : 'false'}
                  className='w-full rounded-2xl border border-[#2a3040] bg-[#151821] py-3 pl-11 pr-4 text-white'
                >
                  <option value='true'>Active</option>
                  <option value='false'>Inactive</option>
                </select>
              </div>
            </div>

            <button
              type='submit'
              className='inline-flex items-center gap-2 rounded-2xl bg-[#f4ede2] px-5 py-3 font-semibold text-[#181510] transition hover:opacity-90'
            >
              <Settings className='h-4 w-4' />
              Save featured restaurant
            </button>
          </form>
        </section>
      </div>
    </AdminShell>
  )
}
