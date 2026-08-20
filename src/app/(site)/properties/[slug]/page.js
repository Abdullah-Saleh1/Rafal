import { supabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import LeadForm from '@/components/LeadForm'
import PropertyGallery from '@/components/PropertyGallery'
import { constructionStageLabels } from '@/lib/property-constants'

const labels = { for_sale: 'للبيع', for_rent: 'للإيجار', for_investment: 'استثمار', rented: 'تم الإيجار' }
const whatsappNumber = '966509515153'

export default async function PropertyDetail({ params }) {
  const { slug } = await params
  const { data: property } = await supabase.from('properties').select('*, property_types(name_ar), cities(name_ar), property_images(*)').eq('slug', slug).single()
  if (!property) notFound()

  const images = [property.cover_image, ...(property.property_images || []).map((image) => image.image_url)].filter(Boolean).filter((url, index, array) => array.indexOf(url) === index)
  const whatsappText = encodeURIComponent(`مرحبًا، أنا مهتم بالعقار: ${property.title}`)

  return (
    <main className="rafal-page min-h-screen px-5 py-8 md:px-10 md:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-wrap items-center gap-3 text-sm text-[#E8E9E9]/60" data-aos="fade-right"><span>{property.cities?.name_ar}</span><span>•</span><span>{property.property_types?.name_ar}</span><span>•</span><span>{labels[property.status] || property.status}</span></div>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="min-w-0">
            <div data-aos="fade-up"><PropertyGallery images={images} title={property.title} /></div>
            <div className="mt-9" data-aos="fade-up"><div className="flex flex-wrap gap-2"><span className="rounded-full border border-[#E8E9E9]/25 bg-[#15402D] px-3 py-1 text-xs font-bold text-[#E8E9E9]">{labels[property.status] || property.status}</span><span className="rounded-full border border-[#E8E9E9]/25 bg-[#15402D] px-3 py-1 text-xs font-bold text-[#E8E9E9]">{constructionStageLabels[property.construction_stage] || 'جاهز'}{property.construction_stage === 'under_construction' && property.construction_progress !== null ? ` · ${property.construction_progress}%` : ''}</span></div><h1 className="mt-4 text-3xl font-extrabold leading-tight text-[#E8E9E9] md:text-5xl">{property.title}</h1></div>
            <div className="rafal-surface mt-7 grid grid-cols-3 rounded-2xl p-5" data-aos="fade-up">
              <div><p className="text-xs text-[#E8E9E9]/55">المساحة</p><p className="mt-1 font-bold text-[#E8E9E9]">{property.area_sqm || '—'} م²</p></div>
              <div className="border-x border-[#E8E9E9]/10 px-4"><p className="text-xs text-[#E8E9E9]/55">غرف النوم</p><p className="mt-1 font-bold text-[#E8E9E9]">{property.bedrooms ?? '—'}</p></div>
              <div className="pr-4"><p className="text-xs text-[#E8E9E9]/55">دورات المياه</p><p className="mt-1 font-bold text-[#E8E9E9]">{property.bathrooms ?? '—'}</p></div>
            </div>
            <article className="mt-8 rounded-2xl border border-[#E8E9E9]/10 bg-[#0A291B]/60 p-6" data-aos="fade-up"><h2 className="text-xl font-extrabold text-[#E8E9E9]">تفاصيل العقار</h2><p className="mt-4 whitespace-pre-line leading-8 text-[#E8E9E9]/75">{property.description}</p></article>
            {property.google_maps_url && <a href={property.google_maps_url} target="_blank" rel="noreferrer" className="mt-5 flex items-center justify-center rounded-2xl border border-[#E8E9E9]/20 bg-[#15402D] px-5 py-4 font-bold text-[#E8E9E9] transition hover:bg-[#E8E9E9] hover:text-[#0A291B]" data-aos="fade-up">عرض موقع العقار على Google Maps ↗</a>}
          </section>

          <aside className="h-fit lg:sticky lg:top-28" data-aos="fade-left"><div className="rafal-surface rounded-3xl p-6"><p className="text-sm text-[#E8E9E9]/55">السعر</p><p className="my-2 text-3xl font-extrabold text-[#E8E9E9]">{property.price?.toLocaleString('ar-SA')} ريال</p><p className="mb-6 text-sm text-[#E8E9E9]/55">مهتم بالعقار؟ تواصل معنا مباشرة.</p><a href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`} target="_blank" rel="noreferrer" className="mb-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 font-bold text-[#092918] transition hover:-translate-y-0.5 hover:brightness-110">تواصل عبر واتساب <span aria-hidden="true">↗</span></a><div className="my-6 h-px bg-[#E8E9E9]/10"/><h2 className="mb-4 text-lg font-extrabold text-[#E8E9E9]">أرسل استفسارك</h2><LeadForm propertyId={property.id} /></div></aside>
        </div>
      </div>
    </main>
  )
}
