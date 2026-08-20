import { supabase } from '@/lib/supabase'
import PropertyCard from '@/components/PropertyCard'
import PropertyFilters from '@/components/PropertyFilters'

export const dynamic = 'force-dynamic'

export default async function PropertiesPage({ searchParams }) {
  const params = await searchParams
  const status = typeof params.status === 'string' ? params.status : undefined
  const type = typeof params.type === 'string' ? params.type : undefined
  const city = typeof params.city === 'string' ? params.city : undefined
  const constructionStage = typeof params.construction_stage === 'string' ? params.construction_stage : undefined
  const [typesResponse, citiesResponse] = await Promise.all([supabase.from('property_types').select('id, name_ar').order('sort_order'), supabase.from('cities').select('id, name_ar')])
  let query = supabase.from('properties').select('id, slug, title, status, price, cover_image, construction_stage, construction_progress, property_types(name_ar), cities(name_ar)').eq('is_published', true).order('created_at', { ascending: false })
  if (status) query = query.eq('status', status); if (type) query = query.eq('type_id', type); if (city) query = query.eq('city_id', city); if (constructionStage) query = query.eq('construction_stage', constructionStage)
  const { data: properties } = await query
  return <main className="rafal-page min-h-screen px-6 py-16 md:px-10"><div className="mx-auto max-w-7xl"><div className="text-center" data-aos="fade-up"><p className="text-sm text-[#E8E9E9]/55">اكتشف ما يناسبك</p><h1 className="mt-2 text-4xl font-extrabold text-[#E8E9E9] md:text-5xl">كل العقارات</h1></div><div className="rafal-surface my-8 rounded-3xl p-5" data-aos="fade-up"><PropertyFilters types={typesResponse.data || []} cities={citiesResponse.data || []}/></div>{properties?.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" data-aos="fade-up">{properties.map((property) => <PropertyCard key={property.id} property={property}/>)}</div> : <div className="rafal-surface rounded-2xl p-12 text-center text-[#E8E9E9]/65">لا توجد عقارات مطابقة لبحثك حاليًا.</div>}</div></main>
}
