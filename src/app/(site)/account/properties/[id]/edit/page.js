import Link from 'next/link'

export default function EditPropertyPage() {
  return <main className="rafal-page min-h-screen px-6 py-20 text-center"><h1 className="text-3xl font-extrabold text-[#E8E9E9]">تعديل العقار غير متاح</h1><p className="mt-3 text-[#E8E9E9]/65">لضمان سلامة المراجعة، التعديل والحذف يتمان عن طريق إدارة رفال فقط.</p><Link href="/contact" className="rafal-button mt-7 inline-block px-6 py-3">تواصل معنا</Link></main>
}
