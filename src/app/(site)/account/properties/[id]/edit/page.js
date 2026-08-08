import Link from 'next/link'

export default function EditPropertyPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-16 text-center">
      <h1 className="text-2xl font-extrabold text-white">تعديل العقار غير متاح من الحساب</h1>
      <p className="mt-3 text-gray-400">لتعديل أو حذف عقارك، تواصل مع إدارة الموقع.</p>
      <Link href="/contact" className="mt-6 inline-block rounded-lg bg-white px-5 py-3 font-bold text-black">
        تواصل معنا
      </Link>
    </main>
  )
}
