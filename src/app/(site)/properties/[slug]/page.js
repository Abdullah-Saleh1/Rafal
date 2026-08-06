import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import LeadForm from '@/components/LeadForm'

const statusLabels = {
  for_sale: 'للبيع',
  for_rent: 'للإيجار',
  for_investment: 'استثمار',
  rented: 'تم الإيجار',
}

export default async function PropertyDetail({ params }) {
  const { slug } = await params

  const { data: property } = await supabase
    .from('properties')
    .select('*, property_types(name_ar), cities(name_ar), property_images(*)')
    .eq('slug', slug)
    .single()

  if (!property) {
    notFound()
  }

  // نجمع كل الصور: الصورة الرئيسية + باقي الصور، من غير تكرار
  const galleryImages = [
    property.cover_image,
    ...(property.property_images || [])
      .map((img) => img.image_url)
      .filter((url) => url !== property.cover_image),
  ]

  return (
    <main className="min-h-screen bg-black px-6 md:px-12 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* عمود المحتوى الرئيسي */}
        <div className="lg:col-span-2 min-w-0">
          {/* الصورة الرئيسية */}
          <img
            src={galleryImages[0]}
            alt={property.title}
            className="w-full h-80 object-cover rounded-2xl mb-3"
          />

          {/* باقي الصور كمعرض مصغر */}
          {galleryImages.length > 1 && (
            <div className="grid grid-cols-4 gap-3 mb-6">
              {galleryImages.slice(1).map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  className="w-full h-20 object-cover rounded-lg"
                />
              ))}
            </div>
          )}

          <span className="inline-block bg-white text-black text-xs font-bold px-3 py-1 rounded-full mb-4">
            {statusLabels[property.status] || property.status}
          </span>
          <h1 className="text-3xl font-extrabold text-white mb-2 break-words">
            {property.title}
          </h1>
          <p className="text-gray-400 mb-6 break-words">
            {property.cities?.name_ar} · {property.property_types?.name_ar}
          </p>

          <div className="grid grid-cols-3 gap-4 mb-6 bg-neutral-900 rounded-xl p-4">
            <div>
              <p className="text-gray-500 text-sm">المساحة</p>
              <p className="text-white font-bold">{property.area_sqm} م²</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">غرف النوم</p>
              <p className="text-white font-bold">{property.bedrooms ?? '—'}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">دورات المياه</p>
              <p className="text-white font-bold">{property.bathrooms ?? '—'}</p>
            </div>
          </div>

          <p className="text-gray-300 leading-8 break-words whitespace-pre-line">
            {property.description}
          </p>
        </div>

        {/* عمود جانبي: السعر + فورم التواصل */}
        <div className="bg-neutral-900 rounded-2xl p-6 h-fit sticky top-6 min-w-0">
          <p className="text-gray-400 text-sm mb-1">السعر</p>
          <p className="text-3xl font-extrabold text-white mb-6">
            {property.price?.toLocaleString('ar-SA')} ريال
          </p>
          <LeadForm propertyId={property.id} />
        </div>
      </div>
    </main>
  )
}
