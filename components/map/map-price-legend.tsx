export function MapPriceLegend() {
  return (
    <div className='rounded-2xl border border-zinc-800 bg-zinc-950/95 p-4 shadow-xl backdrop-blur'>
      <p className='text-xs uppercase tracking-[0.2em] text-zinc-500'>Price guide</p>

      <div className='mt-3 space-y-2 text-sm text-zinc-300'>
        <div className='flex items-center gap-3'>
          <span className='inline-flex h-3 w-3 rounded-full bg-emerald-500' />
          <span>$ Budget-friendly</span>
        </div>
        <div className='flex items-center gap-3'>
          <span className='inline-flex h-3 w-3 rounded-full bg-amber-500' />
          <span>$$ Mid-range</span>
        </div>
        <div className='flex items-center gap-3'>
          <span className='inline-flex h-3 w-3 rounded-full bg-rose-500' />
          <span>$$$ Premium</span>
        </div>
      </div>
    </div>
  )
}
