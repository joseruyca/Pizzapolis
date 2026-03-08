'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

type MobileSideMenuProps = {
  userEmail?: string
  isSignedIn?: boolean
  isAdmin?: boolean
}

function MenuLink({
  href,
  label,
  icon,
  active = false,
}: {
  href: string
  label: string
  icon: string
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center justify-between rounded-2xl px-4 py-4 transition ${
        active
          ? 'bg-zinc-800 text-white'
          : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
      }`}
    >
      <span className='flex items-center gap-3 text-base'>
        <span className='text-lg'>{icon}</span>
        <span>{label}</span>
      </span>
      <span className='text-zinc-600'>›</span>
    </Link>
  )
}

export function MobileSideMenu({
  userEmail,
  isSignedIn,
  isAdmin,
}: MobileSideMenuProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const overlay = open ? (
    <div className='fixed inset-0 z-[99999] md:hidden'>
      <button
        type='button'
        onClick={() => setOpen(false)}
        className='absolute inset-0 bg-black/80 backdrop-blur-sm'
        aria-label='Close menu backdrop'
      />

      <div className='absolute right-0 top-0 flex h-full w-[82%] max-w-[360px] flex-col border-l border-zinc-800 bg-[#070707] shadow-[0_0_60px_rgba(0,0,0,0.75)]'>
        <div className='flex items-center justify-between border-b border-zinc-800 px-5 py-5'>
          <div className='flex items-center gap-3 text-white'>
            <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-lg shadow-[0_8px_24px_rgba(239,68,68,0.35)]'>
              🍕
            </span>
            <span className='text-lg font-semibold tracking-tight'>PizzaHunt</span>
          </div>

          <button
            type='button'
            onClick={() => setOpen(false)}
            className='inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-800 text-xl text-white transition hover:bg-zinc-900'
            aria-label='Close menu'
          >
            ✕
          </button>
        </div>

        <div className='flex-1 overflow-y-auto px-4 py-5'>
          <div className='space-y-1'>
            <MenuLink href='/' label='Home' icon='⌂' active />
            <MenuLink href='/explorar' label='Map' icon='⊙' />
            <MenuLink href='/guides' label='Guides' icon='☷' />
            <MenuLink href='/add-place' label='Suggest a Spot' icon='➤' />
            {isAdmin ? <MenuLink href='/admin' label='Admin Panel' icon='⬒' /> : null}
          </div>

          <div className='my-6 border-t border-zinc-800' />

          <div className='space-y-1'>
            {isSignedIn ? (
              <>
                <div className='rounded-2xl px-4 py-4 text-zinc-300'>
                  <div className='flex items-start gap-3'>
                    <span className='mt-0.5 text-lg'>◌</span>
                    <div>
                      <p className='text-sm text-zinc-500'>Signed in as</p>
                      <p className='mt-1 break-all text-sm font-medium text-white'>
                        {userEmail || 'User'}
                      </p>
                    </div>
                  </div>
                </div>

                <MenuLink href='/account' label='Account' icon='◔' />
                <MenuLink href='/login' label='Sign Out' icon='↪' />
              </>
            ) : (
              <>
                <MenuLink href='/account' label='Account' icon='◔' />
                <MenuLink href='/login' label='Sign In' icon='↪' />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : null

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen(true)}
        className='inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 text-white transition hover:bg-zinc-900 md:hidden'
        aria-label='Open menu'
      >
        ☰
      </button>

      {mounted ? createPortal(overlay, document.body) : null}
    </>
  )
}
