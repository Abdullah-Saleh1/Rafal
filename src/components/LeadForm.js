'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LeadForm({ propertyId, requireMessage = false }) {
  const [form, setForm] = useState({ name: '', phone: '', message: '' })
  const [status, setStatus] = useState('idle')
  async function handleSubmit(event) {
    event.preventDefault(); setStatus('sending')
    const { error } = await supabase.from('leads').insert({ ...form, property_id: propertyId || null, source: propertyId ? 'property_page' : 'contact_page' })
    if (error) setStatus('error'); else { setStatus('success'); setForm({ name: '', phone: '', message: '' }) }
  }
  if (status === 'success') return <p className="rounded-xl bg-[#E8E9E9]/10 p-4 text-sm font-bold text-[#E8E9E9]">تم إرسال طلبك بنجاح، وسيتواصل معك فريق رفال قريبًا.</p>
  return <form onSubmit={handleSubmit} className="flex flex-col gap-3"><input required placeholder="الاسم الكامل" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="rafal-input"/><input required inputMode="tel" placeholder="رقم الجوال" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="rafal-input"/><textarea required={requireMessage} placeholder={requireMessage ? 'اكتب رسالتك' : 'كيف يمكننا مساعدتك؟ (اختياري)'} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} className="rafal-input min-h-24 resize-y" rows={3}/><button type="submit" disabled={status === 'sending'} className="rafal-button mt-1 px-5 py-3 disabled:opacity-60">{status === 'sending' ? 'جارِ الإرسال...' : 'إرسال الطلب'}</button>{status === 'error' && <p className="text-sm text-red-300">تعذر إرسال الطلب، حاول مرة أخرى.</p>}</form>
}
