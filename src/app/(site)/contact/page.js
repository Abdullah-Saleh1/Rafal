import LeadForm from '@/components/LeadForm'
import { company } from '@/lib/company'

export default function ContactPage() {
  return (
    <main className="rafal-page min-h-screen px-6 py-14 md:px-10 md:py-20">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <section data-aos="fade-right">
          <p className="mb-3 text-sm font-bold text-gray-500">تواصل معنا</p>
          <h1 className="text-4xl font-extrabold leading-tight text-white">نحن هنا لمساعدتك في خطوتك العقارية القادمة.</h1>
          <p className="mt-5 max-w-lg leading-8 text-gray-400">أرسل استفسارك وسيقوم فريق رفال العقارية بالتواصل معك في أقرب وقت.</p>

          <div className="mt-10 space-y-5 text-sm">
            <div className="border-r border-white/20 pr-4"><p className="text-gray-500">الهاتف</p><a href={`tel:${company.phoneHref}`} dir="ltr" className="mt-1 block text-white hover:underline">{company.phoneDisplay}</a></div>
            <div className="border-r border-white/20 pr-4"><p className="text-gray-500">البريد الإلكتروني</p><a href={`mailto:${company.email}`} dir="ltr" className="mt-1 block text-white hover:underline">{company.email}</a></div>
            <div className="border-r border-white/20 pr-4"><p className="text-gray-500">الموقع</p><p className="mt-1 text-white">{company.location}</p></div>
          </div>
        </section>

        <section data-aos="fade-left" className="rafal-surface rounded-3xl p-6 md:p-9">
          <h2 className="mb-1 text-2xl font-extrabold text-white">أرسل رسالة</h2>
          <p className="mb-7 text-sm text-gray-500">سنرد عليك بأسرع وقت ممكن.</p>
          <LeadForm requireMessage />
          <a href={company.whatsappHref} target="_blank" rel="noreferrer" className="mt-3 flex w-full items-center justify-center rounded-full bg-[#25D366] px-5 py-3 font-bold text-[#092918] transition hover:-translate-y-0.5 hover:brightness-110">تواصل مباشر عبر واتساب ↗</a>
        </section>
      </div>
    </main>
  )
}
