'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const statusLabels = {
  for_sale: 'للبيع',
  for_rent: 'للإيجار',
  for_investment: 'استثمار',
  rented: 'تم الإيجار',
}

export default function AdminPropertiesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialFilter = searchParams.get('filter') || 'all'

  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState(initialFilter)

  async function loadProperties() {
    setLoading(true)
    const { data } = await supabase
      .from('properties')
      .select('*, property_types(name_ar), cities(name_ar)')
      .order('created_at', { ascending: false })
    setProperties(data || [])
    setLoading(false)
  }

  useEffect(() => {
    loadProperties()
  }, [])

  async function handleApprove(id) {
    await supabase.from('properties').update({ is_published: true }).eq('id', id)
    setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, is_published: true } : p)))
  }

  async function handleUnpublish(id) {
    await supabase.from('properties').update({ is_published: false }).eq('id', id)
    setProperties((prev) => prev.map((p) => (p.id === id ? { ...p, is_published: false } : p)))
  }

  async function handleDelete(id) {
    if (!confirm('متأكد إنك عايز تحذف العقار ده نهائيًا؟')) return
    await supabase.from('properties').delete().eq('id', id)
    setProperties((prev) => prev.filter((p) => p.id !== id))
  }

  const filtered = properties.filter((p) => {
    if (tab === 'pending') return !p.is_published
    if (tab === 'published') return p.is_published
    return true
  })

  const tabs = [
    { key: 'all', label: 'الكل' },
    { key: 'pending', label: 'بانتظار المراجعة' },
    { key: 'published', label: 'منشور' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-white">إدارة العقارات</h1>
        <Link
          href="/admin/properties/new"
          className="bg-white text-black text-sm font-bold px-5 py-3 rounded-full hover:bg-gray-200 transition-colors"
        >
          + أضف عقار جديد
        </Link>
      </div>

      <div className="flex gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); router.replace(`/admin/properties?filter=${t.key}`) }}
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
        <p className="text-gray-400">مفيش عقارات في القسم ده.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((p) => (
            <div key={p.id} className="bg-neutral-900 rounded-2xl p-4 flex items-center gap-4">
              <img src={p.cover_image} alt={p.title} className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-white font-bold">{p.title}</h3>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      p.is_published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {p.is_published ? 'منشور' : 'بانتظار المراجعة'}
                  </span>
                </div>
                <p className="text-gray-400 text-sm">
                  {p.cities?.name_ar} · {p.property_types?.name_ar} · {statusLabels[p.status]}
                </p>
                <p className="text-white font-bold mt-1">{p.price?.toLocaleString('ar-SA')} ريال</p>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/admin/properties/${p.id}`}
                  className="text-sm bg-neutral-800 text-white px-4 py-2 rounded-lg hover:bg-neutral-700"
                >
                  عرض
                </Link>
                <Link
                  href={`/admin/properties/${p.id}/edit`}
                  className="text-sm bg-neutral-800 text-white px-4 py-2 rounded-lg hover:bg-neutral-700"
                >
                  تعديل
                </Link>
                {!p.is_published ? (
                  <button
                    onClick={() => handleApprove(p.id)}
                    className="text-sm bg-green-500/10 text-green-400 px-4 py-2 rounded-lg hover:bg-green-500/20"
                  >
                    موافقة ونشر
                  </button>
                ) : (
                  <button
                    onClick={() => handleUnpublish(p.id)}
                    className="text-sm bg-yellow-500/10 text-yellow-400 px-4 py-2 rounded-lg hover:bg-yellow-500/20"
                  >
                    إخفاء
                  </button>
                )}
                <button
                  onClick={() => handleDelete(p.id)}
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