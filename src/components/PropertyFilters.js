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
    <div className="mb-1 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <select
        defaultValue={searchParams.get('status') || ''}
        onChange={(e) => updateFilter('status', e.target.value)}
        className="rafal-input min-w-0 cursor-pointer py-3"
      >
        <option value="">كل الحالات</option>
        <option value="for_sale">للبيع</option>
        <option value="for_rent">للإيجار</option>
        <option value="for_investment">استثمار</option>
      </select>

      <select
        defaultValue={searchParams.get('construction_stage') || ''}
        onChange={(e) => updateFilter('construction_stage', e.target.value)}
        className="rafal-input min-w-0 cursor-pointer py-3"
      >
        <option value="">كل مراحل الإنشاء</option>
        <option value="under_construction">قيد الإنشاء</option>
        <option value="ready">جاهز</option>
        <option value="sold">مباع</option>
      </select>

      <select
        defaultValue={searchParams.get('type') || ''}
        onChange={(e) => updateFilter('type', e.target.value)}
        className="rafal-input min-w-0 cursor-pointer py-3"
      >
        <option value="">كل الأنواع</option>
        {types.map((t) => (
          <option key={t.id} value={t.id}>{t.name_ar}</option>
        ))}
      </select>

      <select
        defaultValue={searchParams.get('city') || ''}
        onChange={(e) => updateFilter('city', e.target.value)}
        className="rafal-input min-w-0 cursor-pointer py-3"
      >
        <option value="">كل المدن</option>
        {cities.map((c) => (
          <option key={c.id} value={c.id}>{c.name_ar}</option>
        ))}
      </select>

      {(searchParams.get('status') || searchParams.get('type') || searchParams.get('city') || searchParams.get('construction_stage')) && (
        <button
          onClick={() => router.push('/properties')}
          className="rounded-full border border-[#E8E9E9]/15 px-4 py-3 text-sm text-[#E8E9E9]/70 transition hover:bg-[#E8E9E9] hover:text-[#0A291B]"
        >
          مسح الفلاتر
        </button>
      )}
    </div>
  )
}
