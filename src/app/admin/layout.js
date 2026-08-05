'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

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
        router.push('/admin/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        router.push('/admin/login')
        return
      }

      setChecking(false)
    }
    checkAdmin()
  }, [isLoginPage, router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  if (isLoginPage) {
    return <div className="bg-black">{children}</div>
  }

  if (checking) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">جارِ التحقق...</div>
  }

  return (
    <div className="min-h-screen bg-black flex">
      <aside className="w-60 bg-neutral-950 border-l border-white/10 p-6 flex flex-col">
        <p className="text-white font-extrabold mb-8">لوحة تحكم الأدمن</p>
        <nav className="flex flex-col gap-2 flex-1">
          <Link href="/admin" className="text-gray-300 hover:text-white hover:bg-white/5 rounded-lg px-4 py-2 text-sm">
            الرئيسية
          </Link>
          <Link href="/admin/properties" className="text-gray-300 hover:text-white hover:bg-white/5 rounded-lg px-4 py-2 text-sm">
            العقارات
          </Link>
          <Link href="/admin/leads" className="text-gray-300 hover:text-white hover:bg-white/5 rounded-lg px-4 py-2 text-sm">
            الرسائل والعملاء
          </Link>
        </nav>
        <button
          onClick={handleLogout}
          className="text-red-400 text-sm text-right hover:text-red-300"
        >
          تسجيل الخروج
        </button>
      </aside>

      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}