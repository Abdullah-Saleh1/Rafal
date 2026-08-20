'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { convertImageToWebp, removePropertyImages } from '@/lib/property-storage'
import { constructionStages } from '@/lib/property-constants'

export default function AdminNewPropertyPage() {
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
    google_maps_url: '', construction_stage: 'ready', construction_progress: '',
    is_published: true,
  })

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      const { data: t } = await supabase.from('property_types').select('*').order('sort_order')
      const { data: c } = await supabase.from('cities').select('*')
      setTypes(t || [])
      setCities(c || [])
    }
    init()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (files.length === 0) {
      setError('يجب رفع صورة واحدة على الأقل للعقار.')
      return
    }

    setLoading(true)

    const uploadedUrls = []
    for (const selectedFile of files) {
      const f = await convertImageToWebp(selectedFile)
      const fileExt = f.name.split('.').pop()
      const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('properties').upload(filePath, f)
      if (uploadError) {
        setError('فشل رفع إحدى الصور: ' + uploadError.message)
        setLoading(false)
        return
      }
      const { data: urlData } = supabase.storage.from('properties').getPublicUrl(filePath)
      uploadedUrls.push(urlData.publicUrl)
    }

    const slug = `property-${Date.now()}`

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
        google_maps_url: form.google_maps_url.trim() || null,
        construction_stage: form.construction_stage,
        construction_progress: form.construction_stage === 'under_construction' && form.construction_progress !== '' ? Number(form.construction_progress) : null,
        cover_image: uploadedUrls[0],
        owner_id: user.id,
        is_published: form.is_published,
      })
      .select()
      .single()

    if (insertError) {
      await removePropertyImages(uploadedUrls)
      setError('فشل حفظ العقار: ' + insertError.message)
      setLoading(false)
      return
    }

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

    router.push('/admin/properties')
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-extrabold text-white mb-6">أضف عقار جديد</h1>

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

        <select
          value={form.construction_stage}
          onChange={(e) => setForm({ ...form, construction_stage: e.target.value, construction_progress: e.target.value === 'under_construction' ? form.construction_progress : '' })}
          className="bg-neutral-900 text-white rounded-lg px-4 py-3 outline-none"
        >
          {constructionStages.map((stage) => <option key={stage.value} value={stage.value}>{stage.label}</option>)}
        </select>

        {form.construction_stage === 'under_construction' && (
          <input
            required
            type="number"
            min="0"
            max="100"
            placeholder="نسبة اكتمال الإنشاء (من 0 إلى 100)"
            value={form.construction_progress}
            onChange={(e) => setForm({ ...form, construction_progress: e.target.value })}
            className="bg-neutral-900 text-white rounded-lg px-4 py-3 outline-none"
          />
        )}

        <input
          type="url"
          placeholder="رابط موقع العقار من Google Maps (اختياري)"
          value={form.google_maps_url}
          onChange={(e) => setForm({ ...form, google_maps_url: e.target.value })}
          className="bg-neutral-900 text-white rounded-lg px-4 py-3 outline-none"
        />

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
          <label className="text-gray-400 text-sm block mb-2">صور العقار (تقدر تختار أكتر من صورة)</label>
          <input
            required
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files))}
            className="text-white text-sm"
          />
          {files.length > 0 && <div className="mt-3 grid grid-cols-3 gap-2">{files.map((file, index) => <img key={`${file.name}-${index}`} src={URL.createObjectURL(file)} alt={`معاينة الصورة ${index + 1}`} className="h-20 w-full rounded-lg object-cover" />)}</div>}
        </div>

        <label className="flex items-center gap-2 text-white text-sm">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
          />
          نشر فورًا (من غير ما يحتاج مراجعة إضافية)
        </label>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-white text-black font-bold rounded-lg py-3 mt-2 hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          {loading ? 'جارِ الحفظ...' : 'حفظ العقار'}
        </button>
      </form>
    </div>
  )
}
