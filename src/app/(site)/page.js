import { supabase } from '@/lib/supabase'
import PropertyCard from '@/components/PropertyCard'

export default async function Home() {
  const { data: properties } = await supabase
    .from('properties')
    .select('*, property_types(name_ar), cities(name_ar)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-black px-6 md:px-12 py-10">
      <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-8">
        أحدث العقارات
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {properties?.map((p) => (
          <PropertyCard key={p.id} property={p} />
        ))}
      </div>
    </main>
  )
}