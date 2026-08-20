'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const labels = { new: 'جديد', in_progress: 'قيد المتابعة', completed: 'مكتمل', closed: 'مغلق' }

export default function AdminAfterSalesPage() {
  const [requests, setRequests] = useState([]); const [loading, setLoading] = useState(true)
  async function load() { setLoading(true); const { data } = await supabase.from('after_sales_requests').select('*, properties(title)').order('created_at', { ascending: false }); setRequests(data || []); setLoading(false) }
  useEffect(() => { load() }, [])
  async function update(id, status) { const { error } = await supabase.from('after_sales_requests').update({ status }).eq('id', id); if (!error) setRequests((current) => current.map((request) => request.id === id ? { ...request, status } : request)) }
  return <div><div className="mb-7"><p className="text-sm text-[#E8E9E9]/55">متابعة العملاء</p><h1 className="mt-2 text-3xl font-extrabold">خدمات ما بعد البيع</h1></div>{loading ? <p className="text-[#E8E9E9]/60">جارِ التحميل...</p> : requests.length ? <div className="grid gap-4">{requests.map((request) => <article key={request.id} className="rounded-2xl border border-[#E8E9E9]/10 bg-[#15402D]/45 p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-extrabold">{request.full_name}</h2><p dir="ltr" className="mt-1 text-sm text-[#E8E9E9]/65">{request.phone}</p></div><select className="rafal-input w-auto" value={request.status} onChange={(e) => update(request.id, e.target.value)}>{Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></div><div className="mt-4 grid gap-2 text-sm text-[#E8E9E9]/70 md:grid-cols-3"><p>الخدمة: <b className="text-[#E8E9E9]">{request.service_type}</b></p><p>العقار: <b className="text-[#E8E9E9]">{request.properties?.title || '—'}</b></p><p>الوحدة: <b className="text-[#E8E9E9]">{request.unit_number || '—'}</b></p></div><div className="mt-4 flex flex-col gap-4 sm:flex-row"><p className="flex-1 rounded-xl bg-[#0A291B]/45 p-4 leading-7 text-[#E8E9E9]/80">{request.details}</p>{request.image_url && <a href={request.image_url} target="_blank" rel="noreferrer"><img src={request.image_url} alt="مرفق الطلب" className="h-32 w-32 rounded-xl object-cover transition hover:opacity-80"/></a>}</div></article>)}</div> : <div className="rounded-2xl border border-[#E8E9E9]/10 p-10 text-center text-[#E8E9E9]/60">لا توجد طلبات حتى الآن.</div>}</div>
}
