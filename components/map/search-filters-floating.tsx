type SearchFiltersFloatingProps = {
  q?: string
  borough?: string
  price?: string
}

export function SearchFiltersFloating({
  q,
  borough,
  price,
}: SearchFiltersFloatingProps) {
  return (
    <form className='grid gap-3 rounded-3xl border border-zinc-800 bg-zinc-950/95 p-4 shadow-2xl backdrop-blur lg:grid-cols-[1.4fr_0.9fr_0.7fr_auto_auto]'>
      <input
        type='text'
        name='q'
        defaultValue={q || ''}
        placeholder='Search pizza places...'
        className='rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none placeholder:text-zinc-500'
      />

      <select
        name='borough'
        defaultValue={borough || ''}
        className='rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none'
      >
        <option value=''>All boroughs</option>
        <option value='Manhattan'>Manhattan</option>
        <option value='Brooklyn'>Brooklyn</option>
        <option value='Queens'>Queens</option>
        <option value='Bronx'>Bronx</option>
        <option value='Staten Island'>Staten Island</option>
      </select>

      <select
        name='price'
        defaultValue={price || ''}
        className='rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white outline-none'
      >
        <option value=''>Any price</option>
        <option value='$'>$</option>
        <option value='$$'>$$</option>
        <option value='$$$'>$$$</option>
      </select>

      <button
        type='submit'
        className='rounded-2xl bg-white px-4 py-3 font-medium text-black transition hover:opacity-90'
      >
        Search
      </button>

      <a
        href='/explorar'
        className='rounded-2xl border border-zinc-700 px-4 py-3 text-center text-white transition hover:bg-zinc-800'
      >
        Reset
      </a>
    </form>
  )
}
