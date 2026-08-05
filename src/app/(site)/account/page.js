'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function AccountPage() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/account/login')
        return
      }
      setEmail(user.email)

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
      setLoading(false)
    }
    load()
  }, [router])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return <main className="min-h-screen bg-black flex items-center justify-center text-white">جارِ التحميل...</main>
  }

  return (
    <main className="min-h-screen bg-black px-6 md:px-12 py-16">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-extrabold text-white mb-8">حسابي</h1>

        <div className="bg-neutral-900 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center font-extrabold text-xl">
              {profile?.full_name?.[0] || email[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-white font-bold">{profile?.full_name || 'بدون اسم'}</p>
              <p className="text-gray-400 text-sm">{email}</p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4 flex flex-col gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">رقم الجوال</span>
              <span className="text-white">{profile?.phone || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">نوع الحساب</span>
              <span className="text-white">{profile?.role === 'admin' ? 'أدمن' : 'مستخدم'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/account/properties"
            className="bg-white text-black text-center font-bold rounded-lg py-3 hover:bg-gray-200 transition-colors"
          >
            عقاراتي
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-500/10 text-red-400 rounded-lg py-3 hover:bg-red-500/20 transition-colors"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    </main>
  )
}