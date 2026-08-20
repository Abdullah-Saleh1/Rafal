'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({ full_name: '', email: '', phone: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: signupError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name, phone: form.phone } },
    })

    if (signupError) {
      setError(signupError.message)
      setLoading(false)
      return
    }

    router.push('/account/properties')
  }

  return (
    <main className="rafal-page min-h-screen flex items-center justify-center px-6 py-12">
      <form onSubmit={handleSubmit} className="rafal-surface w-full max-w-sm rounded-3xl p-8 shadow-2xl shadow-black/20">
        <p className="mb-2 text-xs font-bold tracking-[.2em] text-[#E8E9E9]/50">RAFAL REAL ESTATE</p><h1 className="text-3xl font-extrabold text-[#E8E9E9] mb-2">إنشاء حساب جديد</h1><p className="mb-7 text-sm text-[#E8E9E9]/60">أنشئ حسابك وأرسل عقارك للمراجعة.</p>

        <div className="flex flex-col gap-3">
          <input
            required
            placeholder="الاسم الكامل"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="rafal-input rounded-xl px-4 py-3 outline-none"
          />
          <input
            required
            type="email"
            placeholder="البريد الإلكتروني"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="rafal-input rounded-xl px-4 py-3 outline-none"
          />
          <input
            required
            placeholder="رقم الجوال"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="rafal-input rounded-xl px-4 py-3 outline-none"
          />
          <input
            required
            type="password"
            minLength={6}
            placeholder="كلمة المرور (6 أحرف على الأقل)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="rafal-input rounded-xl px-4 py-3 outline-none"
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="rafal-button rounded-xl py-3 mt-2 disabled:opacity-50"
          >
            {loading ? 'جارِ الإنشاء...' : 'إنشاء الحساب'}
          </button>

          <p className="text-[#E8E9E9]/60 text-sm text-center mt-2">
            عندك حساب؟{' '}
            <a href="/account/login" className="text-[#E8E9E9] underline">سجّل دخولك</a>
          </p>
        </div>
      </form>
    </main>
  )
}
