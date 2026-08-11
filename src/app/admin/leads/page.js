'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const statusLabels = { new: 'جديدة', contacted: 'تم التواصل', closed: 'مقفلة' }
const statusColors = {
  new: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  contacted: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
  closed: 'bg-white/5 text-gray-400 border-white/10',
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('leads').select('*, properties(title, slug)').order('created_at', { ascending: false })
      setLeads(data || [])
      setLoading(false)
    }
    load()
  }, [])

  async function updateStatus(id, status) {
    const { error } = await supabase.from('leads').update({ status }).eq('id', id)
    if (!error) setLeads((previous) => previous.map((lead) => lead.id === id ? { ...lead, status } : lead))
  }

  async function handleDelete(id) {
    if (!confirm('هل تريد حذف هذه الرسالة نهائيًا؟')) return
    const { error } = await supabase.from('leads').delete().eq('id', id)
    if (!error) setLeads((previous) => previous.filter((lead) => lead.id !== id))
  }

  const filtered = tab === 'all' ? leads : leads.filter((lead) => lead.status === tab)
  const tabs = [{ key: 'all', label: 'الكل' }, { key: 'new', label: 'جديدة' }, { key: 'contacted', label: 'تم التواصل' }, { key: 'closed', label: 'مقفلة' }]

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8"><p className="mb-2 text-sm text-gray-500">إدارة الاستفسارات</p><h1 className="text-3xl font-extrabold text-white md:text-4xl">الرسائل والعملاء المحتملون</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400">تابع كل استفسار من لحظة وصوله حتى الانتهاء من الخدمة.</p></div>

      <div className="mb-7 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((item) => <button key={item.key} onClick={() => setTab(item.key)} className={`whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-bold transition ${tab === item.key ? 'bg-white text-black' : 'border border-white/10 bg-neutral-900 text-gray-400 hover:text-white'}`}>{item.label}</button>)}
      </div>

      {loading ? <p className="text-gray-400">جارِ تحميل الرسائل...</p> : filtered.length === 0 ? <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-gray-400">لا توجد رسائل في هذا القسم.</div> : (
        <div className="space-y-4">
          {filtered.map((lead) => (
            <article key={lead.id} className="rounded-2xl border border-white/10 bg-neutral-900 p-5 md:p-6">
              <div className="flex flex-col justify-between gap-4 md:flex-row">
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-3"><h2 className="text-lg font-bold text-white">{lead.name}</h2><span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusColors[lead.status]}`}>{statusLabels[lead.status]}</span></div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400"><a href={`tel:${lead.phone}`} dir="ltr" className="hover:text-white">{lead.phone}</a>{lead.email && <a href={`mailto:${lead.email}`} dir="ltr" className="hover:text-white">{lead.email}</a>}</div>
                  {lead.properties && <p className="mt-3 text-sm text-gray-500">بخصوص عقار: <span className="text-gray-300">{lead.properties.title}</span></p>}
                </div>
                <time className="text-xs text-gray-600">{new Date(lead.created_at).toLocaleDateString('ar-SA')}</time>
              </div>

              {lead.message && <p className="mt-5 rounded-xl bg-black/20 p-4 text-sm leading-7 text-gray-300">{lead.message}</p>}

              <div className="mt-5 flex flex-wrap gap-2">
                <a href={`tel:${lead.phone}`} className="rounded-lg bg-green-500/10 px-4 py-2 text-sm font-bold text-green-300 hover:bg-green-500/20">اتصال</a>
                {lead.status !== 'contacted' && <button onClick={() => updateStatus(lead.id, 'contacted')} className="rounded-lg bg-blue-500/10 px-4 py-2 text-sm font-bold text-blue-300 hover:bg-blue-500/20">تم التواصل</button>}
                {lead.status !== 'closed' && <button onClick={() => updateStatus(lead.id, 'closed')} className="rounded-lg bg-white/5 px-4 py-2 text-sm font-bold text-gray-300 hover:bg-white/10">إقفال الطلب</button>}
                <button onClick={() => handleDelete(lead.id)} className="mr-auto rounded-lg px-4 py-2 text-sm font-bold text-red-400 hover:bg-red-500/10">حذف</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
