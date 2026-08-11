'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const links = [
  { href: '/', label: 'الرئيسية' },
  { href: '/properties', label: 'العقارات' },
  { href: '/contact', label: 'تواصل معنا' },
]

function Brand() {
  return (
    <Link href="/" className="block shrink-0" aria-label="رفال العقارية - الرئيسية">
      <img
        src="/images/rafal-logo-white.png"
        alt="رفال العقارية"
        className="h-16 w-52 object-cover object-center md:h-20 md:w-64"
      />
    </Link>
  )
}

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-xl">
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-5 md:px-10">
        <Brand />

        <nav className="hidden items-center gap-1 md:flex" aria-label="التنقل الرئيسي">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-full px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!loading && (user ? (
            <>
              <Link href="/account" className="text-sm text-gray-300 transition hover:text-white">حسابي</Link>
              <Link href="/account/properties/new" className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition hover:bg-gray-200">أضف عقارك</Link>
              <button onClick={handleLogout} className="text-sm text-red-400 transition hover:text-red-300">خروج</button>
            </>
          ) : (
            <>
              <Link href="/account/login" className="text-sm text-gray-300 transition hover:text-white">تسجيل الدخول</Link>
              <Link href="/account/properties/new" className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition hover:bg-gray-200">أضف عقارك</Link>
            </>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white md:hidden"
          aria-label="فتح القائمة"
          aria-expanded={menuOpen}
        >
          <span className="text-xl leading-none">{menuOpen ? '×' : '☰'}</span>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 bg-neutral-950 px-5 py-5 md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1" aria-label="التنقل على الهاتف">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={closeMenu} className="rounded-xl px-4 py-3 text-gray-200 hover:bg-white/10">
                {link.label}
              </Link>
            ))}
            {!loading && (user ? (
              <>
                <Link href="/account" onClick={closeMenu} className="rounded-xl px-4 py-3 text-gray-200 hover:bg-white/10">حسابي</Link>
                <Link href="/account/properties/new" onClick={closeMenu} className="rounded-xl bg-white px-4 py-3 font-bold text-black">أضف عقارك</Link>
                <button onClick={handleLogout} className="rounded-xl px-4 py-3 text-right text-red-400">خروج</button>
              </>
            ) : (
              <>
                <Link href="/account/login" onClick={closeMenu} className="rounded-xl px-4 py-3 text-gray-200 hover:bg-white/10">تسجيل الدخول</Link>
                <Link href="/account/properties/new" onClick={closeMenu} className="rounded-xl bg-white px-4 py-3 font-bold text-black">أضف عقارك</Link>
              </>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
