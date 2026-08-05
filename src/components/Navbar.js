'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    // نستمع لأي تغيير في حالة الدخول (لو سجّل دخول أو خرج من أي مكان في الموقع)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 bg-black/90 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
        <Link href="/" className="text-white font-extrabold text-xl">
          عوج <span className="text-gray-400 font-normal">للعقارات</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-gray-300 text-sm">
          <Link href="/" className="hover:text-white transition-colors">الرئيسية</Link>
          <Link href="/properties" className="hover:text-white transition-colors">العقارات</Link>
          <Link href="/about" className="hover:text-white transition-colors">من نحن</Link>
          <Link href="/contact" className="hover:text-white transition-colors">تواصل معنا</Link>
        </nav>

        <div className="flex items-center gap-3">
          {!loading && (
            user ? (
              <>
                <Link
                  href="/account"
                  className="text-gray-300 hover:text-white text-sm transition-colors hidden sm:block"
                >
                  حسابي
                </Link>
                <Link
                  href="/account/properties/new"
                  className="bg-white text-black text-sm font-bold px-4 py-2 rounded-full hover:bg-gray-200 transition-colors"
                >
                  + أضف عقارك
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-300 text-sm transition-colors"
                >
                  خروج
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/account/login"
                  className="text-gray-300 hover:text-white text-sm transition-colors"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/account/properties/new"
                  className="bg-white text-black text-sm font-bold px-4 py-2 rounded-full hover:bg-gray-200 transition-colors"
                >
                  + أضف عقارك
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </header>
  )
}