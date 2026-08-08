'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const statusLabels = {
  for_sale: 'للبيع',
  for_rent: 'للإيجار',
  for_investment: 'استثمار',
  rented: 'تم الإيجار',
}

export default function MyPropertiesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [properties, setProperties] = useState([])

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/account/login')
        return
      }

      const { data } = await supabase
        .from('properties')
        .select('*, property_types(name_ar), cities(name_ar)')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      setProperties(data || [])
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) {
    return <main className="min-h-screen bg-black flex items-center justify-center text-white">جارِ التحميل...</main>
  }

  return (
    <main className="min-h-screen bg-black px-6 md:px-12 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">عقاراتي</h1>
        <Link
          href="/account/properties/new"
          className="bg-white text-black text-sm font-bold px-5 py-3 rounded-full hover:bg-gray-200 transition-colors"
        >
          + أضف عقار جديد
        </Link>
      </div>

      <p className="text-gray-400 mb-6">لتعديل أو حذف عقار، تواصل مع إدارة الموقع.</p>

      {properties.length === 0 && (
        <p className="text-gray-400">لم تضف أي عقار حتى الآن.</p>
      )}

      <div className="flex flex-col gap-4">
        {properties.map((property) => (
          <div key={property.id} className="bg-neutral-900 rounded-2xl p-5 flex items-center gap-5">
            <img src={property.cover_image} alt={property.title} className="w-24 h-24 object-cover rounded-xl flex-shrink-0" />

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-white font-bold">{property.title}</h3>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  property.is_published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {property.is_published ? 'منشور' : 'بانتظار المراجعة'}
                </span>
              </div>
              <p className="text-gray-400 text-sm">
                {property.cities?.name_ar} · {property.property_types?.name_ar} · {statusLabels[property.status]}
              </p>
              <p className="text-white font-bold mt-1">{property.price?.toLocaleString('ar-SA')} ريال</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
