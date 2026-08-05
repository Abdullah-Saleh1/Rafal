'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function PropertyFilters({ types, cities }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function updateFilter(key, value) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/properties?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      <select
        defaultValue={searchParams.get('status') || ''}
        onChange={(e) => updateFilter('status', e.target.value)}
        className="bg-neutral-900 text-white border border-white/10 rounded-lg px-4 py-2"
      >
        <option value="">كل الحالات</option>
        <option value="for_sale">للبيع</option>
        <option value="for_rent">للإيجار</option>
        <option value="for_investment">استثمار</option>
      </select>

      <select
        defaultValue={searchParams.get('type') || ''}
        onChange={(e) => updateFilter('type', e.target.value)}
        className="bg-neutral-900 text-white border border-white/10 rounded-lg px-4 py-2"
      >
        <option value="">كل الأنواع</option>
        {types.map((t) => (
          <option key={t.id} value={t.slug}>{t.name_ar}</option>
        ))}
      </select>

      <select
        defaultValue={searchParams.get('city') || ''}
        onChange={(e) => updateFilter('city', e.target.value)}
        className="bg-neutral-900 text-white border border-white/10 rounded-lg px-4 py-2"
      >
        <option value="">كل المدن</option>
        {cities.map((c) => (
          <option key={c.id} value={c.slug}>{c.name_ar}</option>
        ))}
      </select>

      {(searchParams.get('status') || searchParams.get('type') || searchParams.get('city')) && (
        <button
          onClick={() => router.push('/properties')}
          className="text-gray-400 text-sm underline px-2"
        >
          مسح الفلاتر
        </button>
      )}
    </div>
  )
}