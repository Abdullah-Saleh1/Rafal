import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import PropertyCard from '@/components/PropertyCard'

export const revalidate = 300

export default async function Home() {
  const { data: properties } = await supabase
    .from('properties')
    .select('id, slug, title, status, price, cover_image, property_types(name_ar), cities(name_ar)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(4)

  return (
    <main className="bg-black">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.12),transparent_32%),radial-gradient(circle_at_85%_75%,rgba(255,255,255,0.08),transparent_28%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <p className="mb-5 text-xs font-bold tracking-[0.22em] text-gray-400">RAFAL REAL ESTATE</p>
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight text-white md:text-6xl">رفال العقارية</h1>
          <p className="mt-6 max-w-xl text-base leading-8 text-gray-400 md:text-lg">نساعدك في اكتشاف العقارات المناسبة للشراء والإيجار والاستثمار في المملكة العربية السعودية.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/properties" className="rounded-full bg-white px-6 py-3 font-bold text-black transition hover:bg-gray-200">استكشف العقارات</Link>
            <Link href="/contact" className="rounded-full border border-white/20 px-6 py-3 font-bold text-white transition hover:bg-white/10">تواصل معنا</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-sm text-gray-500">اختياراتنا الأحدث</p>
            <h2 className="text-3xl font-extrabold text-white">أحدث العقارات</h2>
          </div>
          <Link href="/properties" className="text-sm font-bold text-white underline decoration-gray-600 underline-offset-8 transition hover:decoration-white">عرض كل العقارات</Link>
        </div>

        {properties?.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {properties.map((property) => <PropertyCard key={property.id} property={property} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-gray-400">لا توجد عقارات منشورة حاليًا.</div>
        )}
      </section>
    </main>
  )
}
