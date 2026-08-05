import LeadForm from '@/components/LeadForm'

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black px-6 md:px-12 py-16">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-extrabold text-white mb-3">تواصل معنا</h1>
        <p className="text-gray-400 mb-8">
          عندك استفسار عن عقار أو محتاج استشارة؟ ابعتلنا وهنتواصل معاك في أقرب وقت.
        </p>
        <div className="bg-neutral-900 rounded-2xl p-6">
          <LeadForm />
        </div>
      </div>
    </main>
  )
}