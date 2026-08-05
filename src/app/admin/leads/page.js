'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const statusLabels = { new: 'جديدة', contacted: 'تم التواصل', closed: 'مقفولة' }
const statusColors = {
  new: 'bg-yellow-500/20 text-yellow-400',
  contacted: 'bg-blue-500/20 text-blue-400',
  closed: 'bg-gray-500/20 text-gray-400',
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('leads')
        .select('*, properties(title, slug)')
        .order('created_at', { ascending: false })
      setLeads(data || [])
      setLoading(false)
    }
    load()
  }, [])

  async function updateStatus(id, status) {
    await supabase.from('leads').update({ status }).eq('id', id)
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
  }

  async function handleDelete(id) {
    if (!confirm('متأكد إنك عايز تحذف الرسالة دي؟')) return
    await supabase.from('leads').delete().eq('id', id)
    setLeads((prev) => prev.filter((l) => l.id !== id))
  }

  const filtered = tab === 'all' ? leads : leads.filter((l) => l.status === tab)

  const tabs = [
    { key: 'all', label: 'الكل' },
    { key: 'new', label: 'جديدة' },
    { key: 'contacted', label: 'تم التواصل' },
    { key: 'closed', label: 'مقفولة' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-white mb-6">الرسائل والعملاء المحتملين</h1>

      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`text-sm px-4 py-2 rounded-full font-bold transition-colors ${
              tab === t.key ? 'bg-white text-black' : 'bg-neutral-900 text-gray-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400">جارِ التحميل...</p>
      ) : filtered.length === 0 ? (
        <p className="text-gray-400">مفيش رسائل في القسم ده.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((l) => (
            <div key={l.id} className="bg-neutral-900 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-bold">{l.name}</h3>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusColors[l.status]}`}>
                      {statusLabels[l.status]}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm" dir="ltr">{l.phone} {l.email && `· ${l.email}`}</p>
                  {l.properties && (
                    <p className="text-gray-500 text-xs mt-1">بخصوص عقار: {l.properties.title}</p>
                  )}
                </div>
                <p className="text-gray-600 text-xs">
                  {new Date(l.created_at).toLocaleDateString('ar-SA')}
                </p>
              </div>

              {l.message && <p className="text-gray-300 text-sm mb-4">{l.message}</p>}

              <div className="flex gap-2">
                <a
                  href={`tel:${l.phone}`}
                  className="text-sm bg-green-500/10 text-green-400 px-4 py-2 rounded-lg hover:bg-green-500/20"
                >
                  اتصال
                </a>
                {l.status !== 'contacted' && (
                  <button
                    onClick={() => updateStatus(l.id, 'contacted')}
                    className="text-sm bg-blue-500/10 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500/20"
                  >
                    تم التواصل
                  </button>
                )}
                {l.status !== 'closed' && (
                  <button
                    onClick={() => updateStatus(l.id, 'closed')}
                    className="text-sm bg-neutral-800 text-gray-300 px-4 py-2 rounded-lg hover:bg-neutral-700"
                  >
                    إقفال
                  </button>
                )}
                <button
                  onClick={() => handleDelete(l.id)}
                  className="text-sm bg-red-500/10 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/20"
                >
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}