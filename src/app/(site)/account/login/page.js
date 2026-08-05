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
    <main className="min-h-screen bg-black flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-neutral-900 rounded-2xl p-8">
        <h1 className="text-2xl font-extrabold text-white mb-6">تسجيل الدخول</h1>

        <div className="flex flex-col gap-3">
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
            type="password"
            placeholder="كلمة المرور"
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
            {loading ? 'جارِ الدخول...' : 'دخول'}
          </button>

          <p className="text-gray-400 text-sm text-center mt-2">
            مفيش عندك حساب؟{' '}
            <a href="/account/signup" className="text-white underline">سجّل واحد جديد</a>
          </p>
        </div>
      </form>
    </main>
  )
}