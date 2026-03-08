function Pin({
  label,
  color,
  left,
  top,
}: {
  label: string
  color: 'green' | 'yellow' | 'red'
  left: string
  top: string
}) {
  const styles = {
    green: 'bg-emerald-500 shadow-[0_0_22px_rgba(34,197,94,0.55)]',
    yellow: 'bg-amber-400 shadow-[0_0_22px_rgba(251,191,36,0.55)]',
    red: 'bg-red-500 shadow-[0_0_22px_rgba(239,68,68,0.55)]',
  }

  return (
    <div className='absolute' style={{ left, top }}>
      <div className={`flex h-12 w-12 items-center justify-center rounded-full border-4 border-white text-sm font-bold text-white ${styles[color]}`}>
        {label}
      </div>
      <div className={`mx-auto -mt-1 h-4 w-4 rotate-45 ${styles[color].split(' ')[0]}`} />
    </div>
  )
}

export function HomeMapPreview() {
  return (
    <div className='rounded-[28px] border border-zinc-700 bg-[#06080c] p-4 shadow-2xl'>
      <div className='relative h-[240px] overflow-hidden rounded-[22px] border border-zinc-800 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06),transparent_42%),linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[length:auto,32px_32px,32px_32px]'>
        <div className='absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1),rgba(0,0,0,0.45))]' />

        <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-zinc-600'>
          <div className='text-3xl'>🗺️</div>
          <div className='mt-1 text-sm font-medium'>New York City</div>
        </div>

        <Pin label='$4' color='green' left='16%' top='18%' />
        <Pin label='$6' color='yellow' left='47%' top='30%' />
        <Pin label='$5' color='green' left='30%' top='48%' />
        <Pin label='$8' color='yellow' left='66%' top='53%' />
        <Pin label='$28' color='red' left='78%' top='18%' />
        <Pin label='$22' color='red' left='88%' top='36%' />
      </div>

      <div className='mt-3 flex items-center justify-between px-2'>
        <p className='text-sm text-zinc-400'>16 spots · All 5 boroughs</p>

        <div className='flex items-center gap-2'>
          <span className='inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white'>$</span>
          <span className='inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-white'>$$</span>
          <span className='inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white'>$$$</span>
        </div>
      </div>
    </div>
  )
}
