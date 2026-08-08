'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { removePropertyImages } from '@/lib/property-storage'

export default function NewPropertyPage() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [types, setTypes] = useState([])
  const [cities, setCities] = useState([])
  const [files, setFiles] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    title: '', description: '', type_id: '', status: 'for_sale',
    price: '', area_sqm: '', bedrooms: '', bathrooms: '', city_id: '',
  })

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/account/login')
        return
      }
      setUser(user)

      const { data: t } = await supabase.from('property_types').select('*').order('sort_order')
      const { data: c } = await supabase.from('cities').select('*')
      setTypes(t || [])
      setCities(c || [])
    }
    init()
  }, [router])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (files.length === 0) {
      setError('لازم ترفع صورة واحدة على الأقل للعقار')
      return
    }

    setLoading(true)

    // 1) نرفع كل الصور على Storage، صورة صورة
    const uploadedUrls = []
    for (const f of files) {
      const fileExt = f.name.split('.').pop()
      const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('properties')
        .upload(filePath, f)

      if (uploadError) {
        setError('فشل رفع إحدى الصور: ' + uploadError.message)
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage.from('properties').getPublicUrl(filePath)
      uploadedUrls.push(urlData.publicUrl)
    }

    // 2) نعمل slug فريد بسيط
    const slug = `property-${Date.now()}`

    // 3) نضيف العقار (أول صورة تبقى الصورة الرئيسية cover_image)
    const { data: newProperty, error: insertError } = await supabase
      .from('properties')
      .insert({
        slug,
        title: form.title,
        description: form.description,
        type_id: form.type_id || null,
        status: form.status,
        price: form.price ? Number(form.price) : null,
        area_sqm: form.area_sqm ? Number(form.area_sqm) : null,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
        city_id: form.city_id || null,
        cover_image: uploadedUrls[0],
        owner_id: user.id,
        is_published: false,
      })
      .select()
      .single()

    if (insertError) {
      await removePropertyImages(uploadedUrls)
      setError('فشل حفظ العقار: ' + insertError.message)
      setLoading(false)
      return
    }

    // 4) نضيف باقي الصور (لو فيه أكتر من واحدة) في جدول property_images
    if (uploadedUrls.length > 0) {
      const imageRows = uploadedUrls.map((url, index) => ({
        property_id: newProperty.id,
        image_url: url,
        sort_order: index,
      }))
      const { error: imagesError } = await supabase.from('property_images').insert(imageRows)
      if (imagesError) {
        await supabase.from('properties').delete().eq('id', newProperty.id)
        await removePropertyImages(uploadedUrls)
        setError('فشل ربط الصور بالعقار: ' + imagesError.message)
        setLoading(false)
        return
      }
    }

    router.push('/account/properties')
  }

  return (
    <main className="min-h-screen bg-black px-6 md:px-12 py-10">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-extrabold text-white mb-2">أضف عقارك</h1>
        <p className="text-gray-400 text-sm mb-8">
          عقارك هيفضل "بانتظار المراجعة" لحد ما فريقنا يوافق عليه وينشره.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            required
            placeholder="عنوان العقار"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="bg-neutral-900 text-white rounded-lg px-4 py-3 outline-none"
          />

          <textarea
            required
            placeholder="وصف العقار"
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="bg-neutral-900 text-white rounded-lg px-4 py-3 outline-none"
          />

          <div className="grid grid-cols-2 gap-4">
            <select
              required
              value={form.type_id}
              onChange={(e) => setForm({ ...form, type_id: e.target.value })}
              className="bg-neutral-900 text-white rounded-lg px-4 py-3 outline-none"
            >
              <option value="">نوع العقار</option>
              {types.map((t) => <option key={t.id} value={t.id}>{t.name_ar}</option>)}
            </select>

            <select
              required
              value={form.city_id}
              onChange={(e) => setForm({ ...form, city_id: e.target.value })}
              className="bg-neutral-900 text-white rounded-lg px-4 py-3 outline-none"
            >
              <option value="">المدينة</option>
              {cities.map((c) => <option key={c.id} value={c.id}>{c.name_ar}</option>)}
            </select>
          </div>

          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="bg-neutral-900 text-white rounded-lg px-4 py-3 outline-none"
          >
            <option value="for_sale">للبيع</option>
            <option value="for_rent">للإيجار</option>
            <option value="for_investment">استثمار</option>
          </select>

          <div className="grid grid-cols-2 gap-4">
            <input
              required
              type="number"
              placeholder="السعر (ريال)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="bg-neutral-900 text-white rounded-lg px-4 py-3 outline-none"
            />
            <input
              required
              type="number"
              placeholder="المساحة (م²)"
              value={form.area_sqm}
              onChange={(e) => setForm({ ...form, area_sqm: e.target.value })}
              className="bg-neutral-900 text-white rounded-lg px-4 py-3 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="عدد الغرف (اختياري)"
              value={form.bedrooms}
              onChange={(e) => setForm({ ...form, bedrooms: e.target.value })}
              className="bg-neutral-900 text-white rounded-lg px-4 py-3 outline-none"
            />
            <input
              type="number"
              placeholder="دورات المياه (اختياري)"
              value={form.bathrooms}
              onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}
              className="bg-neutral-900 text-white rounded-lg px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="text-gray-400 text-sm block mb-2">
              صور العقار (تقدر تختار أكتر من صورة مرة واحدة)
            </label>
            <input
              required
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files))}
              className="text-white text-sm"
            />
            {files.length > 0 && (
              <p className="text-gray-500 text-xs mt-1">تم اختيار {files.length} صورة</p>
            )}
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-white text-black font-bold rounded-lg py-3 mt-2 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {loading ? 'جارِ الإرسال...' : 'إرسال العقار للمراجعة'}
          </button>
        </form>
      </div>
    </main>
  )
}
