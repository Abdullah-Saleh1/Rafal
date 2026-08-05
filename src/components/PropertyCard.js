import Link from 'next/link'

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
      className="block rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 transition-colors bg-neutral-900"
    >
      <div className="relative">
        <img
          src={property.cover_image}
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        <span className="absolute top-3 right-3 bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full">
          {statusLabels[property.status] || property.status}
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-white font-bold mb-2">{property.title}</h3>
        <p className="text-gray-400 text-sm">
          {property.cities?.name_ar} · {property.property_types?.name_ar}
        </p>
        <p className="text-white font-extrabold mt-3">
          {property.price?.toLocaleString('ar-SA')} ريال
        </p>
      </div>
    </Link>
  )
}