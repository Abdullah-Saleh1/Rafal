'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, pending: 0, published: 0, newLeads: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      const [{ count: total }, { count: pending }, { count: published }, { count: newLeads }] = await Promise.all([
        supabase.from('properties').select('*', { count: 'exact', head: true }),
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('is_published', false),
        supabase.from('properties').select('*', { count: 'exact', head: true }).eq('is_published', true),
        supabase.from('leads').select('*', { count: 'exact', head: true }).eq('status', 'new'),
      ])
      setStats({ total: total || 0, pending: pending || 0, published: published || 0, newLeads: newLeads || 0 })
      setLoading(false)
    }
    loadStats()
  }, [])

  const cards = [
    { label: 'إجمالي العقارات', hint: 'كل العقارات المسجلة', value: stats.total, href: '/admin/properties' },
    { label: 'بانتظار المراجعة', hint: 'تحتاج قرار النشر', value: stats.pending, href: '/admin/properties?filter=pending', accent: 'amber' },
    { label: 'عقارات منشورة', hint: 'ظاهرة للزوار', value: stats.published, href: '/admin/properties?filter=published', accent: 'green' },
    { label: 'رسائل جديدة', hint: 'تحتاج تواصلًا', value: stats.newLeads, href: '/admin/leads', accent: 'blue' },
  ]

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div><p className="mb-2 text-sm text-gray-500">رفال العقارية</p><h1 className="text-3xl font-extrabold text-white md:text-4xl">نظرة عامة</h1></div>
        <Link href="/admin/properties/new" className="rounded-full bg-white px-5 py-3 text-sm font-bold text-black hover:bg-gray-200">+ إضافة عقار جديد</Link>
      </div>

      {loading ? <p className="text-gray-400">جارِ تحميل الإحصاءات...</p> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <Link key={card.label} href={card.href} className="group rounded-2xl border border-white/10 bg-neutral-900 p-6 transition hover:-translate-y-1 hover:border-white/30">
              <p className="text-sm text-gray-400">{card.label}</p>
              <p className="my-3 text-4xl font-extrabold text-white">{card.value}</p>
              <p className="text-xs text-gray-500">{card.hint}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link href="/admin/properties?filter=pending" className="rounded-2xl border border-white/10 bg-neutral-900 p-6 hover:border-white/30"><p className="font-bold text-white">مراجعة العقارات</p><p className="mt-2 text-sm leading-6 text-gray-400">راجع الطلبات الجديدة ثم انشر العقارات المناسبة للزوار.</p></Link>
        <Link href="/admin/leads" className="rounded-2xl border border-white/10 bg-neutral-900 p-6 hover:border-white/30"><p className="font-bold text-white">متابعة العملاء</p><p className="mt-2 text-sm leading-6 text-gray-400">تواصل مع أصحاب الرسائل وحدّث حالة كل طلب بعد المتابعة.</p></Link>
      </div>
    </div>
  )
}
