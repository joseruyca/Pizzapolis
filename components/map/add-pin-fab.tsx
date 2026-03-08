import Link from 'next/link'

export function AddPinFab() {
  return (
    <Link
      href='/add-place'
      className='inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-2xl text-white shadow-2xl transition hover:bg-red-500'
      aria-label='Add place'
      title='Add place'
    >
      +
    </Link>
  )
}
