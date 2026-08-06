import { supabase } from '@/lib/supabase'
import PropertyCard from '@/components/PropertyCard'
import PropertyFilters from '@/components/PropertyFilters'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PropertiesPage({ searchParams }) {
  const params = await searchParams
  const { status, type, city } = params

  // نجيب قوائم الأنواع والمدن عشان نعرضها في الفلتر
  const { data: types } = await supabase.from('property_types').select('*').order('sort_order')
  const { data: cities } = await supabase.from('cities').select('*')

  // نبني الاستعلام الأساسي
  let query = supabase
    .from('properties')
    .select('*, property_types(name_ar), cities(name_ar)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  // نضيف الفلاتر بس لو موجودة في الرابط
  if (status) query = query.eq('status', status)
  if (type) query = query.eq('type_id', type)
  if (city) query = query.eq('city_id', city)

  const { data: properties } = await query

  // فلترة إضافية للتأكد (لأن فلترة الجداول المرتبطة أحيانًا محتاجة خطوة زيادة)
  return (
    <main className="min-h-screen bg-black px-6 md:px-12 py-10">
      <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-6">
        كل العقارات
      </h1>

      <PropertyFilters types={types || []} cities={cities || []} />

      {properties?.length === 0 && (
        <p className="text-gray-400">مفيش عقارات مطابقة لبحثك حاليًا.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {properties?.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
    </main>
  )
}
