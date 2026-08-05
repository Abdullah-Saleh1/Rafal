'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LeadForm({ propertyId }) {
  const [form, setForm] = useState({ name: '', phone: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | sending | success | error

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')

    const { error } = await supabase.from('leads').insert({
      name: form.name,
      phone: form.phone,
      message: form.message,
      property_id: propertyId,
      source: 'property_page',
    })

    if (error) {
      console.error(error)
      setStatus('error')
    } else {
      setStatus('success')
      setForm({ name: '', phone: '', message: '' })
    }
  }

  if (status === 'success') {
    return (
      <p className="text-green-400 font-bold">
        تم إرسال طلبك بنجاح! هيتم التواصل معاك قريبًا.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        required
        placeholder="الاسم"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="bg-neutral-800 text-white rounded-lg px-4 py-3 outline-none"
      />
      <input
        required
        placeholder="رقم الجوال"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        className="bg-neutral-800 text-white rounded-lg px-4 py-3 outline-none"
      />
      <textarea
        placeholder="رسالتك (اختياري)"
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        className="bg-neutral-800 text-white rounded-lg px-4 py-3 outline-none"
        rows={3}
      />
      <button
        type="submit"
        disabled={status === 'sending'}
        className="bg-white text-black font-bold rounded-lg py-3 hover:bg-gray-200 transition-colors disabled:opacity-50"
      >
        {status === 'sending' ? 'جارِ الإرسال...' : 'أنا مهتم — تواصلوا معي'}
      </button>
      {status === 'error' && (
        <p className="text-red-400 text-sm">حصل خطأ، حاول تاني.</p>
      )}
    </form>
  )
}