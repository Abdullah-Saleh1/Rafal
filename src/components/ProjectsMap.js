'use client'

import { useMemo, useState } from 'react'

function mapQuery(url, fallback) {
  if (!url) return fallback
  const decoded = decodeURIComponent(url)
  const coordinate = decoded.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/) || decoded.match(/[?&](?:q|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/)
  return coordinate ? `${coordinate[1]},${coordinate[2]}` : fallback
}

export default function ProjectsMap({ properties }) {
  const [active, setActive] = useState(0)
  const selected = properties[active]
  const query = useMemo(() => mapQuery(selected?.google_maps_url, `${selected?.title || ''} ${selected?.cities?.name_ar || 'الخبر'}`), [selected])
  return <section className="border-y border-[#E8E9E9]/10 bg-[#15402D]/25 px-6 py-20 md:px-10"><div className="mx-auto max-w-7xl"><div className="text-center" data-aos="fade-up"><p className="text-sm text-[#E8E9E9]/55">اكتشف مواقعنا</p><h2 className="mt-2 text-4xl font-extrabold text-[#E8E9E9]">مشاريعنا على الخريطة</h2><p className="mx-auto mt-4 max-w-xl text-[#E8E9E9]/65">اختر عقارًا لعرض موقعه مباشرة على الخريطة.</p></div><div className="mt-10 flex flex-wrap justify-center gap-3" data-aos="fade-up">{properties.map((property, index) => <button type="button" key={property.id} onClick={() => setActive(index)} className={`rounded-full border px-5 py-3 text-sm font-bold transition ${active === index ? 'border-[#E8E9E9] bg-[#E8E9E9] text-[#0A291B]' : 'border-[#E8E9E9]/15 bg-[#0A291B]/45 text-[#E8E9E9]/75 hover:border-[#E8E9E9]/45 hover:text-[#E8E9E9]'}`}>{property.title}</button>)}</div><div className="mt-6 overflow-hidden rounded-[2rem] border border-[#E8E9E9]/15 bg-[#0A291B] shadow-2xl shadow-black/30" data-aos="fade-up"><iframe title={`موقع ${selected?.title || 'العقار'}`} src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&z=14&output=embed`} className="h-[460px] w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade"/><div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E8E9E9]/10 px-6 py-4"><div><p className="font-extrabold text-[#E8E9E9]">{selected?.title}</p><p className="mt-1 text-sm text-[#E8E9E9]/55">{selected?.cities?.name_ar || 'الموقع على الخريطة'}</p></div>{selected?.google_maps_url && <a href={selected.google_maps_url} target="_blank" rel="noreferrer" className="rounded-full border border-[#E8E9E9]/25 px-4 py-2 text-sm font-bold text-[#E8E9E9] transition hover:bg-[#E8E9E9] hover:text-[#0A291B]">فتح في Google Maps ↗</a>}</div></div></div></section>
}
