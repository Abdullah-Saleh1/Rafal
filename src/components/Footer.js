import Link from 'next/link'
import { company } from '@/lib/company'

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-[#E8E9E9]/10 bg-[#0A291B]">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1.3fr_0.7fr_1fr] md:px-10" data-aos="fade-up">
        <div data-aos="fade-right">
          <img src="/images/rafal-logo-white.png" alt={company.name} className="mb-5 h-32 w-full max-w-md object-cover object-center sm:h-36" />
          <p className="max-w-sm text-sm leading-7 text-gray-400">حلول عقارية موثوقة تساعدك على اكتشاف الفرص المناسبة بثقة ووضوح.</p>
        </div>

        <div data-aos="fade-up">
          <h2 className="mb-4 text-sm font-bold text-white">روابط سريعة</h2>
          <div className="flex flex-col gap-3 text-sm text-gray-400">
            <Link href="/" className="transition hover:text-white">الرئيسية</Link>
            <Link href="/properties" className="transition hover:text-white">العقارات</Link>
            <Link href="/contact" className="transition hover:text-white">تواصل معنا</Link>
          </div>
        </div>

        <div data-aos="fade-left">
          <h2 className="mb-4 text-sm font-bold text-white">تواصل معنا</h2>
          <div className="flex flex-col gap-3 text-sm text-gray-400">
            <a href={`tel:${company.phoneHref}`} dir="ltr" className="w-fit transition hover:text-white">{company.phoneDisplay}</a>
            <a href={`mailto:${company.email}`} dir="ltr" className="w-fit transition hover:text-white">{company.email}</a>
            <p className="leading-6">{company.location}</p>
          </div>
        </div>
      </div>
      <div className="border-t border-[#E8E9E9]/10 px-6 py-5 text-center text-xs text-[#E8E9E9]/45">© {new Date().getFullYear()} {company.name}. جميع الحقوق محفوظة.</div>
    </footer>
  )
}
