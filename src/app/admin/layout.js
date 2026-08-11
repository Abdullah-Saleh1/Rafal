'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const navigation = [
  { href: '/admin', label: 'نظرة عامة' },
  { href: '/admin/properties', label: 'إدارة العقارات' },
  { href: '/admin/leads', label: 'الرسائل والعملاء' },
]

export default function AdminLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false)
      return
    }

    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/admin/login')
        return
      }

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      if (profile?.role !== 'admin') {
        router.replace('/admin/login')
        return
      }
      setChecking(false)
    }
    checkAdmin()
  }, [isLoginPage, router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.replace('/admin/login')
  }

  if (isLoginPage) return <div className="min-h-screen bg-black">{children}</div>

  if (checking) {
    return <div className="grid min-h-screen place-items-center bg-black text-sm text-gray-400">جارِ التحقق من صلاحيات الإدارة...</div>
  }

  return (
    <div className="min-h-screen bg-black md:flex">
      <aside className="border-b border-white/10 bg-neutral-950 md:flex md:w-72 md:flex-col md:border-b-0 md:border-l">
        <div className="flex items-center justify-between px-5 py-4 md:block md:px-7 md:py-7">
          <img src="/images/rafal-logo-white.png" alt="رفال العقارية" className="h-14 w-44 object-cover object-center md:h-20 md:w-full" />
          <p className="hidden text-xs font-bold tracking-[0.18em] text-gray-500 md:block">لوحة الإدارة</p>
          <p className="text-sm font-bold text-white md:hidden">لوحة الإدارة</p>
        </div>

        <nav className="flex gap-2 overflow-x-auto px-4 pb-4 md:flex-col md:px-5 md:pb-0" aria-label="تنقل الإدارة">
          {navigation.map((item) => {
            const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} className={`whitespace-nowrap rounded-xl px-4 py-3 text-sm font-bold transition ${
                active ? 'bg-white text-black' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden mt-auto border-t border-white/10 p-5 md:block">
          <Link href="/" className="mb-3 block rounded-xl px-4 py-3 text-sm text-gray-400 hover:bg-white/5 hover:text-white">عرض الموقع</Link>
          <button onClick={handleLogout} className="w-full rounded-xl px-4 py-3 text-right text-sm font-bold text-red-400 hover:bg-red-500/10">تسجيل الخروج</button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-5 md:p-10">{children}</main>
    </div>
  )
}
