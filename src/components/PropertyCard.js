import Link from 'next/link'
import Image from 'next/image'

const statusLabels = {
  for_sale: 'للبيع',
  for_rent: 'للإيجار',
  for_investment: 'استثمار',
  rented: 'تم الإيجار',
}

export default function PropertyCard({ property }) {
  return (
    <Link
      href={`/properties/${property.slug}`}
      className="group block overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 transition duration-300 hover:-translate-y-1 hover:border-white/30 hover:shadow-2xl hover:shadow-black/40"
    >
      <div className="relative h-48">
        <Image
          src={property.cover_image}
          alt={property.title}
          fill
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute top-3 right-3 bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full">
          {statusLabels[property.status] || property.status}
        </span>
      </div>
      <div className="p-5">
        <h3 className="mb-2 text-base font-bold text-white">{property.title}</h3>
        <p className="text-gray-400 text-sm">
          {property.cities?.name_ar} · {property.property_types?.name_ar}
        </p>
        <p className="mt-4 text-base font-extrabold text-white">
          {property.price?.toLocaleString('ar-SA')} ريال
        </p>
      </div>
    </Link>
  )
}
