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
    { label: 'إجمالي العقارات', value: stats.total, href: '/admin/properties' },
    { label: 'بانتظار المراجعة', value: stats.pending, href: '/admin/properties?filter=pending', highlight: true },
    { label: 'منشور حاليًا', value: stats.published, href: '/admin/properties?filter=published' },
    { label: 'رسائل جديدة', value: stats.newLeads, href: '/admin/leads' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-white mb-8">نظرة عامة</h1>

      {loading ? (
        <p className="text-gray-400">جارِ التحميل...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {cards.map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className={`rounded-2xl p-6 border transition-colors ${
                c.highlight
                  ? 'bg-yellow-500/10 border-yellow-500/30 hover:border-yellow-500/60'
                  : 'bg-neutral-900 border-white/10 hover:border-white/30'
              }`}
            >
              <p className="text-3xl font-extrabold text-white mb-2">{c.value}</p>
              <p className="text-gray-400 text-sm">{c.label}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}