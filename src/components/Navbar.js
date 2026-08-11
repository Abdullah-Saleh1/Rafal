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
      <img src="/images/rafal-logo-white.png" alt="رفال العقارية" className="h-16 w-52 object-cover object-center md:h-20 md:w-64" />
    </Link>
  )
}

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    async function syncUser(sessionUser) {
      setUser(sessionUser || null)
      if (!sessionUser) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', sessionUser.id).single()
      setIsAdmin(profile?.role === 'admin')
      setLoading(false)
    }

    supabase.auth.getUser().then(({ data }) => syncUser(data.user))
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => syncUser(session?.user))
    const updateScrolled = () => setScrolled(window.scrollY > 8)
    updateScrolled()
    window.addEventListener('scroll', updateScrolled, { passive: true })

    return () => {
      listener.subscription.unsubscribe()
      window.removeEventListener('scroll', updateScrolled)
    }
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className={`sticky top-0 z-50 border-b border-white/10 backdrop-blur-xl transition-all duration-300 ${scrolled ? 'bg-black/95 shadow-xl shadow-black/30' : 'bg-black/80'}`}>
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-5 md:px-10">
        <Brand />

        <nav className="hidden items-center gap-1 md:flex" aria-label="التنقل الرئيسي">
          {links.map((link) => <Link key={link.href} href={link.href} className="rounded-full px-4 py-2 text-sm text-gray-300 transition duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:text-white">{link.label}</Link>)}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {!loading && (user ? (
            <>
              {isAdmin && <Link href="/admin" className="rounded-full border border-white/20 px-4 py-2 text-sm font-bold text-white transition hover:bg-white hover:text-black">لوحة الإدارة</Link>}
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

        <button type="button" onClick={() => setMenuOpen((open) => !open)} className="relative flex h-11 w-11 flex-col items-center justify-center gap-1.5 text-white md:hidden" aria-label="فتح القائمة" aria-expanded={menuOpen}>
          <span className={`h-px w-6 bg-current transition duration-300 ${menuOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
          <span className={`h-px w-6 bg-current transition duration-300 ${menuOpen ? 'scale-x-0 opacity-0' : ''}`} />
          <span className={`h-px w-6 bg-current transition duration-300 ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
        </button>
      </div>

      <div className={`grid transition-all duration-300 md:hidden ${menuOpen ? 'grid-rows-[1fr] border-t border-white/10 opacity-100' : 'pointer-events-none grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-5" aria-label="التنقل على الهاتف">
            {links.map((link) => <Link key={link.href} href={link.href} onClick={closeMenu} className="rounded-xl px-4 py-3 text-gray-200 transition hover:bg-white/10">{link.label}</Link>)}
            {!loading && (user ? (
              <>
                {isAdmin && <Link href="/admin" onClick={closeMenu} className="rounded-xl border border-white/15 px-4 py-3 font-bold text-white">لوحة الإدارة</Link>}
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
      </div>
    </header>
  )
}
