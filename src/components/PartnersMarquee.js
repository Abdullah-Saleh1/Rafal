import Image from 'next/image'

const partnerGroups = [
  [
    { name: 'وزارة البلديات والإسكان', image: '/images/partners/real_estate_logos/Ministry of Municipalities & Housing_1.png' },
    { name: 'وزارة الإسكان', image: '/images/partners/real_estate_logos/Saudi_Ministry_of_Housing_Logo.png' },
    { name: 'سكني', image: '/images/partners/real_estate_logos/skni.png' },
    { name: 'وافي', image: '/images/partners/real_estate_logos/wafi.png' },
  ],
  [
    { name: 'أرامكو السعودية', image: '/images/partners/financial_partners_logos/aramco.png' },
    { name: 'SNB', image: '/images/partners/financial_partners_logos/snb.png' },
    { name: 'مصرف الراجحي', image: '/images/partners/financial_partners_logos/alrajhi.png' },
    { name: 'مصرف الإنماء', image: '/images/partners/financial_partners_logos/alinma.png' },
    { name: 'البنك السعودي الفرنسي', image: '/images/partners/financial_partners_logos/banque-saudi-fransi.png' },
  ],
  [
    { name: 'دهانات الجزيرة', image: '/images/partners/construction_partners_logos/01_Jazeera_Paints.png' },
    { name: 'GROHE', image: '/images/partners/construction_partners_logos/05_GROHE.png' },
    { name: 'DHM', image: '/images/partners/construction_partners_logos/06_DHM.png' },
    { name: 'جوتن', image: '/images/partners/construction_partners_logos/07_JOTUN.png' },
    { name: 'Saudi Readymix', image: '/images/partners/construction_partners_logos/09_Saudi_Readymix.png' },
    { name: 'Saudi Ceramics', image: '/images/partners/construction_partners_logos/12_Saudi_Ceramics.png' },
  ],
]

function Logo({ partner }) {
  return <div className="partners-marquee-item" title={partner.name}><Image src={partner.image} alt={partner.name} width={220} height={100} className="h-16 w-40 object-contain transition duration-300"/></div>
}

export default function PartnersMarquee({ rows = 1 }) {
  const visibleGroups = rows === 3 ? partnerGroups : [partnerGroups.flat()]
  return <div className="space-y-3">{visibleGroups.map((group, row) => { const items = [...group, ...group]; return <div key={row} className="partners-marquee overflow-hidden"><div className={`partners-marquee-track ${row % 2 ? 'partners-marquee-track-reverse' : ''}`}>{items.map((partner, index) => <Logo key={`${partner.name}-${index}`} partner={partner}/>)}</div></div> })}</div>
}
