'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

const statusLabels = {
  for_sale: 'للبيع',
  for_rent: 'للإيجار',
  for_investment: 'استثمار',
  rented: 'تم الإيجار',
}

export default function AdminPropertyViewPage() {
  const params = useParams()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('properties')
        .select('*, property_types(name_ar), cities(name_ar), districts(name_ar), property_images(*), profiles(full_name, phone, role)')
        .eq('id', params.id)
        .single()
      setProperty(data)
      setLoading(false)
    }
    load()
  }, [params.id])

  if (loading) return <p className="text-gray-400">جارِ التحميل...</p>
  if (!property) return <p className="text-red-400">العقار ده مش موجود</p>

  const allImages = [
    property.cover_image,
    ...property.property_images.map((img) => img.image_url).filter((u) => u !== property.cover_image),
  ]

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-white">{property.title}</h1>
        <div className="flex gap-2">
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full self-center ${
              property.is_published ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
            }`}
          >
            {property.is_published ? 'منشور' : 'بانتظار المراجعة'}
          </span>
          <Link
            href={`/admin/properties/${property.id}/edit`}
            className="bg-white text-black text-sm font-bold px-5 py-2 rounded-full hover:bg-gray-200"
          >
            تعديل
          </Link>
        </div>
      </div>

      {/* معرض الصور */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {allImages.map((url, i) => (
          <img key={i} src={url} alt="" className="w-full h-40 object-cover rounded-xl" />
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-neutral-900 rounded-xl p-5">
        <div>
          <p className="text-gray-500 text-xs mb-1">السعر</p>
          <p className="text-white font-bold">{property.price?.toLocaleString('ar-SA')} ريال</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs mb-1">المساحة</p>
          <p className="text-white font-bold">{property.area_sqm} م²</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs mb-1">غرف النوم</p>
          <p className="text-white font-bold">{property.bedrooms ?? '—'}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs mb-1">دورات المياه</p>
          <p className="text-white font-bold">{property.bathrooms ?? '—'}</p>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-gray-500 text-xs mb-1">الموقع والنوع</p>
        <p className="text-white">
          {property.cities?.name_ar} · {property.districts?.name_ar} · {property.property_types?.name_ar} · {statusLabels[property.status]}
        </p>
      </div>

      <div className="mb-6">
        <p className="text-gray-500 text-xs mb-2">الوصف</p>
        <p className="text-gray-300 leading-8">{property.description}</p>
      </div>

      <div className="mb-6 bg-neutral-900 rounded-xl p-5">
        <p className="text-gray-500 text-xs mb-2">بيانات صاحب الإعلان</p>
        {property.profiles?.role === 'admin' ? (
          <p className="text-blue-400 font-bold">تمت الإضافة من قبل إدارة الموقع</p>
        ) : (
          <>
            <p className="text-white font-bold mb-1">{property.profiles?.full_name || 'بدون اسم'}</p>
            <p className="text-gray-300" dir="ltr">{property.profiles?.phone || 'رقم غير مسجّل'}</p>
            {property.profiles?.phone && (
              <a
                href={`tel:${property.profiles.phone}`}
                className="inline-block mt-3 text-sm bg-green-500/10 text-green-400 px-4 py-2 rounded-lg hover:bg-green-500/20"
              >
                اتصال بصاحب العقار
              </a>
            )}
          </>
        )}
      </div>
    </div>
  )
}