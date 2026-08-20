'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (loginError) {
      setError('الإيميل أو كلمة المرور غلط')
      setLoading(false)
      return
    }

    router.push('/account/properties')
  }

  return (
    <main className="rafal-page min-h-screen flex items-center justify-center px-6 py-12">
      <form onSubmit={handleSubmit} className="rafal-surface w-full max-w-sm rounded-3xl p-8 shadow-2xl shadow-black/20">
        <p className="mb-2 text-xs font-bold tracking-[.2em] text-[#E8E9E9]/50">RAFAL REAL ESTATE</p><h1 className="text-3xl font-extrabold text-[#E8E9E9] mb-2">تسجيل الدخول</h1><p className="mb-7 text-sm text-[#E8E9E9]/60">أهلًا بك مجددًا في رفال العقارية</p>

        <div className="flex flex-col gap-3">
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
            type="password"
            placeholder="كلمة المرور"
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
            {loading ? 'جارِ الدخول...' : 'دخول'}
          </button>

          <p className="text-[#E8E9E9]/60 text-sm text-center mt-2">
            مفيش عندك حساب؟{' '}
            <a href="/account/signup" className="text-[#E8E9E9] underline">سجّل واحد جديد</a>
          </p>
        </div>
      </form>
    </main>
  )
}
