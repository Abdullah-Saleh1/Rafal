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
    <main className="min-h-screen bg-black flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-neutral-900 rounded-2xl p-8">
        <h1 className="text-2xl font-extrabold text-white mb-6">إنشاء حساب جديد</h1>

        <div className="flex flex-col gap-3">
          <input
            required
            placeholder="الاسم الكامل"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            className="bg-neutral-800 text-white rounded-lg px-4 py-3 outline-none"
          />
          <input
            required
            type="email"
            placeholder="البريد الإلكتروني"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="bg-neutral-800 text-white rounded-lg px-4 py-3 outline-none"
          />
          <input
            required
            placeholder="رقم الجوال"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="bg-neutral-800 text-white rounded-lg px-4 py-3 outline-none"
          />
          <input
            required
            type="password"
            minLength={6}
            placeholder="كلمة المرور (6 أحرف على الأقل)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="bg-neutral-800 text-white rounded-lg px-4 py-3 outline-none"
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-white text-black font-bold rounded-lg py-3 mt-2 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {loading ? 'جارِ الإنشاء...' : 'إنشاء الحساب'}
          </button>

          <p className="text-gray-400 text-sm text-center mt-2">
            عندك حساب؟{' '}
            <a href="/account/login" className="text-white underline">سجّل دخولك</a>
          </p>
        </div>
      </form>
    </main>
  )
}