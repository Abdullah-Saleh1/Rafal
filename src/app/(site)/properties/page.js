import { unstable_cache } from 'next/cache'
import { supabase } from '@/lib/supabase'
import PropertyCard from '@/components/PropertyCard'
import PropertyFilters from '@/components/PropertyFilters'

const getPropertyTypes = unstable_cache(
  async () => {
    const { data, error } = await supabase
      .from('property_types')
      .select('id, name_ar')
      .order('sort_order')

    if (error) throw error
    return data || []
  },
  ['property-types'],
  { revalidate: 3600 },
)

const getCities = unstable_cache(
  async () => {
    const { data, error } = await supabase
      .from('cities')
      .select('id, name_ar')

    if (error) throw error
    return data || []
  },
  ['cities'],
  { revalidate: 3600 },
)

async function getProperties(status, typeId, cityId) {
  let query = supabase
    .from('properties')
    .select('id, slug, title, status, price, cover_image, property_types(name_ar), cities(name_ar)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)
  if (typeId) query = query.eq('type_id', typeId)
  if (cityId) query = query.eq('city_id', cityId)

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export const revalidate = 300

export default async function PropertiesPage({ searchParams }) {
  const params = await searchParams
  const status = typeof params.status === 'string' ? params.status : undefined
  const type = typeof params.type === 'string' ? params.type : undefined
  const city = typeof params.city === 'string' ? params.city : undefined

  const [types, cities, properties] = await Promise.all([
    getPropertyTypes(),
    getCities(),
    getProperties(status, type, city),
  ])

  return (
    <main className="min-h-screen bg-black px-6 md:px-12 py-10">
      <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-6">كل العقارات</h1>

      <PropertyFilters types={types} cities={cities} />

      {properties.length === 0 && (
        <p className="text-gray-400">لا توجد عقارات مطابقة لبحثك حاليًا.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </main>
  )
}
