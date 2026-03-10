import { ClipboardList, ShieldCheck, User, Wrench } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/is-admin'
import { AdminShell } from '@/components/admin/admin-shell'

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string
  value: React.ReactNode
  hint?: string
}) {
  return (
    <div className='rounded-[24px] border border-[#2a3040] bg-[#101115] p-4'>
      <p className='text-[10px] uppercase tracking-[0.18em] text-[#7b8497]'>{label}</p>
      <p className='mt-2 text-3xl font-bold text-white'>{value}</p>
      {hint ? <p className='mt-2 text-xs text-[#a4adbf]'>{hint}</p> : null}
    </div>
  )
}

function typeTone(entityType: string | null) {
  if (entityType?.includes('place')) return 'border-[#4a3a20] bg-[#2f2615] text-[#ffe2a6]'
  if (entityType?.includes('route')) return 'border-[#254746] bg-[#183130] text-[#d5f1ee]'
  if (entityType?.includes('user')) return 'border-[#4f2830] bg-[#311922] text-[#ffd9df]'
  return 'border-[#34384a] bg-[#151821] text-[#dbe3f5]'
}

export default async function AdminAuditLogPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: logs, error } = await supabase
    .from('admin_audit_logs')
    .select('id, actor_user_id, actor_role, action, entity_type, entity_id, meta, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  const safeLogs = logs ?? []
  const admins = safeLogs.filter((log) => log.actor_role === 'admin').length
  const editors = safeLogs.filter((log) => log.actor_role === 'editor').length
  const moderators = safeLogs.filter((log) => log.actor_role === 'moderator').length

  return (
    <AdminShell
      title='Audit log'
      description='Full traceability for admin and staff actions across the platform.'
    >
      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <SummaryCard label='Loaded entries' value={safeLogs.length} hint='Most recent audit events' />
        <SummaryCard label='Admin actions' value={admins} hint='Entries by admins' />
        <SummaryCard label='Editor actions' value={editors} hint='Entries by editors' />
        <SummaryCard label='Moderator actions' value={moderators} hint='Entries by moderators' />
      </div>

      <div className='mt-6 rounded-[28px] border border-[#2a3040] bg-[#101115]/95 p-6 shadow-xl'>
        <div className='flex items-center gap-3'>
          <div className='rounded-2xl border border-[#2a3040] bg-[#151821] p-3 text-[#a4adbf]'>
            <ClipboardList className='h-5 w-5' />
          </div>
          <div>
            <h2 className='text-2xl font-semibold text-white'>Recent audit events</h2>
            <p className='mt-1 text-sm text-[#7b8497]'>
              Who changed what, when, and on which entity.
            </p>
          </div>
        </div>

        {error ? (
          <div className='mt-5 rounded-2xl border border-red-900 bg-red-950 p-4 text-red-200'>
            Error loading audit log: {error.message}
          </div>
        ) : null}

        {safeLogs.length === 0 ? (
          <div className='mt-5 rounded-2xl border border-[#2a3040] bg-[#151821] p-4 text-[#a4adbf]'>
            No audit entries yet.
          </div>
        ) : null}

        <div className='mt-5 space-y-4'>
          {safeLogs.map((log) => {
            const meta = (log.meta ?? {}) as Record<string, unknown>
            const actorEmail =
              typeof meta.actor_email === 'string' ? meta.actor_email : null

            return (
              <div
                key={log.id}
                className='rounded-[24px] border border-[#2a3040] bg-[#151821] p-5'
              >
                <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                  <div className='min-w-0 flex-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <span className='inline-flex items-center gap-2 rounded-full border border-[#34384a] bg-[#101115] px-3 py-1 text-[11px] text-[#dbe3f5]'>
                        <Wrench className='h-3.5 w-3.5' />
                        {log.action}
                      </span>

                      <span className={`rounded-full border px-3 py-1 text-[11px] ${typeTone(log.entity_type)}`}>
                        {log.entity_type}
                      </span>

                      <span className='inline-flex items-center gap-2 rounded-full border border-[#34384a] bg-[#101115] px-3 py-1 text-[11px] text-[#dbe3f5]'>
                        <ShieldCheck className='h-3.5 w-3.5' />
                        {log.actor_role}
                      </span>
                    </div>

                    <div className='mt-3 space-y-2 text-sm text-[#a4adbf]'>
                      <p className='inline-flex items-center gap-2'>
                        <User className='h-4 w-4 text-[#7b8497]' />
                        <span>{actorEmail || log.actor_user_id || 'Unknown actor'}</span>
                      </p>

                      <p>
                        Entity ID:{' '}
                        <span className='break-all text-[#dbe3f5]'>
                          {log.entity_id || '—'}
                        </span>
                      </p>
                    </div>

                    {Object.keys(meta).length > 0 ? (
                      <div className='mt-4 rounded-2xl border border-[#2a3040] bg-[#101115] p-4'>
                        <p className='text-[10px] uppercase tracking-[0.18em] text-[#7b8497]'>
                          Meta
                        </p>
                        <pre className='mt-2 overflow-x-auto whitespace-pre-wrap break-words text-xs leading-6 text-[#dbe3f5]'>
{JSON.stringify(meta, null, 2)}
                        </pre>
                      </div>
                    ) : null}
                  </div>

                  <div className='shrink-0 rounded-2xl border border-[#2a3040] bg-[#101115] px-4 py-3 text-right'>
                    <p className='text-[10px] uppercase tracking-[0.16em] text-[#7b8497]'>Created</p>
                    <p className='mt-1 text-sm font-medium text-white'>
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AdminShell>
  )
}
