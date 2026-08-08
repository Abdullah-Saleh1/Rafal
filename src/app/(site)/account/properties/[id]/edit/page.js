'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { removePropertyImages } from '@/lib/property-storage'

export default function EditPropertyPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id

  const [user, setUser] = useState(null)
  const [types, setTypes] = useState([])
  const [cities, setCities] = useState([])
  const [images, setImages] = useState([])
  const [coverImage, setCoverImage] = useState(null)
  const [newFiles, setNewFiles] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

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

      const { data: property, error: fetchError } = await supabase
        .from('properties')
        .select('*, property_images(*)')
        .eq('id', propertyId)
        .single()

      if (fetchError || !property) {
        setError('العقار ده مش موجود')
        setPageLoading(false)
        return
      }

      // حماية إضافية: نتأكد إن ده عقار المستخدم نفسه (والـ RLS بيحميها كمان من ناحية السيرفر)
      if (property.owner_id !== user.id) {
        router.push('/account/properties')
        return
      }

      setForm({
        title: property.title || '',
        description: property.description || '',
        type_id: property.type_id || '',
        status: property.status || 'for_sale',
        price: property.price ?? '',
        area_sqm: property.area_sqm ?? '',
        bedrooms: property.bedrooms ?? '',
        bathrooms: property.bathrooms ?? '',
        city_id: property.city_id || '',
      })
      const savedImages = property.property_images || []
      setCoverImage(property.cover_image || null)
      setImages(savedImages.length > 0 ? savedImages : property.cover_image ? [{
        id: `cover-${property.id}`,
        image_url: property.cover_image,
        isCoverOnly: true,
      }] : [])
      setPageLoading(false)
    }
    init()
  }, [propertyId, router])

  async function handleDeleteImage(imageId) {
    const image = images.find((item) => item.id === imageId)
    if (!image) return

    const remainingImages = images.filter((item) => item.id !== imageId)
    const nextCoverImage = image.image_url === coverImage
      ? remainingImages[0]?.image_url || null
      : coverImage

    try {
      await removePropertyImages([image.image_url])
    } catch (error) {
      setError('فشل حذف الصورة من Storage: ' + error.message)
      return
    }

    if (nextCoverImage !== coverImage) {
      const { error: coverError } = await supabase
        .from('properties')
        .update({ cover_image: nextCoverImage })
        .eq('id', propertyId)
      if (coverError) {
        setError('تم حذف الصورة من Storage، لكن فشل تحديث الصورة الرئيسية: ' + coverError.message)
        return
      }
      setCoverImage(nextCoverImage)
    }

    if (!image.isCoverOnly) {
      const { error } = await supabase.from('property_images').delete().eq('id', imageId)
      if (error) {
        setError('تم حذف الصورة من Storage، لكن فشل حذف سجل الصورة: ' + error.message)
        return
      }
    }

    setImages((prev) => prev.filter((img) => img.id !== imageId))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // 1) نحدّث بيانات العقار
    const { error: updateError } = await supabase
      .from('properties')
      .update({
        title: form.title,
        description: form.description,
        type_id: form.type_id || null,
        status: form.status,
        price: form.price ? Number(form.price) : null,
        area_sqm: form.area_sqm ? Number(form.area_sqm) : null,
        bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
        bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
        city_id: form.city_id || null,
      })
      .eq('id', propertyId)

    if (updateError) {
      setError('فشل التحديث: ' + updateError.message)
      setLoading(false)
      return
    }

    // 2) لو المستخدم ضاف صور جديدة، نرفعها ونربطها بالعقار
    if (newFiles.length > 0) {
      const imageRows = []
      for (const f of newFiles) {
        const fileExt = f.name.split('.').pop()
        const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`

        const { error: uploadError } = await supabase.storage.from('properties').upload(filePath, f)
        if (uploadError) continue

        const { data: urlData } = supabase.storage.from('properties').getPublicUrl(filePath)
        imageRows.push({ property_id: propertyId, image_url: urlData.publicUrl, sort_order: images.length + imageRows.length })
      }
      if (imageRows.length > 0) {
        const { error: imagesError } = await supabase.from('property_images').insert(imageRows)
        if (imagesError) {
          await removePropertyImages(imageRows.map((image) => image.image_url))
          setError('فشل ربط الصور الجديدة بالعقار: ' + imagesError.message)
          setLoading(false)
          return
        }
      }

      // لو العقار مكنش عنده صورة رئيسية (نادر لكن للاحتياط)، نحطله أول صورة جديدة
      if (images.length === 0 && imageRows.length > 0) {
        await supabase.from('properties').update({ cover_image: imageRows[0].image_url }).eq('id', propertyId)
      }
    }

    router.push('/account/properties')
  }

  if (pageLoading) {
    return <main className="min-h-screen bg-black flex items-center justify-center text-white">جارِ التحميل...</main>
  }

  return (
    <main className="min-h-screen bg-black px-6 md:px-12 py-10">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-extrabold text-white mb-2">تعديل العقار</h1>
        <p className="text-gray-400 text-sm mb-8">
          أي تعديل هيحتاج مراجعة الأدمن قبل ما يفضل ظاهر للزوار.
        </p>

        {images.length > 0 && (
          <div className="mb-6">
            <label className="text-gray-400 text-sm block mb-2">الصور الحالية</label>
            <div className="grid grid-cols-3 gap-3">
              {images.map((img) => (
                <div key={img.id} className="relative">
                  <img src={img.image_url} alt="" className="w-full h-24 object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img.id)}
                    className="absolute top-1 left-1 bg-black/70 text-red-400 text-xs px-2 py-1 rounded-full"
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

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
            <label className="text-gray-400 text-sm block mb-2">أضف صور جديدة (اختياري)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setNewFiles(Array.from(e.target.files))}
              className="text-white text-sm"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-white text-black font-bold rounded-lg py-3 mt-2 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {loading ? 'جارِ الحفظ...' : 'حفظ التعديلات'}
          </button>
        </form>
      </div>
    </main>
  )
}
