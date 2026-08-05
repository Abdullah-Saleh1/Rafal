import { supabase } from '@/lib/supabase'
import PropertyCard from '@/components/PropertyCard'
import PropertyFilters from '@/components/PropertyFilters'

export default async function PropertiesPage({ searchParams }) {
  const params = await searchParams
  const { status, type, city } = params

  // نجيب قوائم الأنواع والمدن عشان نعرضها في الفلتر
  const { data: types } = await supabase.from('property_types').select('*').order('sort_order')
  const { data: cities } = await supabase.from('cities').select('*')

  // نبني الاستعلام الأساسي
  let query = supabase
    .from('properties')
    .select('*, property_types(name_ar, slug), cities(name_ar, slug)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  // نضيف الفلاتر بس لو موجودة في الرابط
  if (status) query = query.eq('status', status)
  if (type) query = query.eq('property_types.slug', type)
  if (city) query = query.eq('cities.slug', city)

  const { data: properties } = await query

  // فلترة إضافية للتأكد (لأن فلترة الجداول المرتبطة أحيانًا محتاجة خطوة زيادة)
  const filtered = properties?.filter((p) => {
    if (type && p.property_types?.slug !== type) return false
    if (city && p.cities?.slug !== city) return false
    return true
  })

  return (
    <main className="min-h-screen bg-black px-6 md:px-12 py-10">
      <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-6">
        كل العقارات
      </h1>

      <PropertyFilters types={types || []} cities={cities || []} />

      {filtered?.length === 0 && (
        <p className="text-gray-400">مفيش عقارات مطابقة لبحثك حاليًا.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered?.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
    </main>
  )
}