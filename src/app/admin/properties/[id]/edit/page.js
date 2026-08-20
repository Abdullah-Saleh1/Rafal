'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { convertImageToWebp, removePropertyImages } from '@/lib/property-storage'
import { constructionStages } from '@/lib/property-constants'

export default function AdminEditPropertyPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id

  const [types, setTypes] = useState([])
  const [cities, setCities] = useState([])
  const [images, setImages] = useState([])
  const [coverImage, setCoverImage] = useState(null)
  const [removedImages, setRemovedImages] = useState([])
  const [newFiles, setNewFiles] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)

  const [form, setForm] = useState({
    title: '', description: '', type_id: '', status: 'for_sale',
    price: '', area_sqm: '', bedrooms: '', bathrooms: '', city_id: '',
    google_maps_url: '', construction_stage: 'ready', construction_progress: '',
    is_published: false,
  })

  useEffect(() => {
    async function init() {
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
        google_maps_url: property.google_maps_url || '',
        construction_stage: property.construction_stage || 'ready',
        construction_progress: property.construction_progress ?? '',
        is_published: property.is_published,
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
  }, [propertyId])

  async function handleDeleteImage(imageId) {
    const image = images.find((item) => item.id === imageId)
    if (!image) return

    const remainingImages = images.filter((item) => item.id !== imageId)
    const nextCoverImage = image.image_url === coverImage
      ? remainingImages[0]?.image_url || null
      : coverImage

    setImages(remainingImages)
    setCoverImage(nextCoverImage)
    setRemovedImages((prev) => [...prev, image])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

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
        google_maps_url: form.google_maps_url.trim() || null,
        construction_stage: form.construction_stage,
        construction_progress: form.construction_stage === 'under_construction' && form.construction_progress !== '' ? Number(form.construction_progress) : null,
        is_published: form.is_published,
        cover_image: coverImage,
      })
      .eq('id', propertyId)

    if (updateError) {
      setError('فشل التحديث: ' + updateError.message)
      setLoading(false)
      return
    }

    if (removedImages.length > 0) {
      try {
        await removePropertyImages(removedImages.map((image) => image.image_url))
      } catch (error) {
        setError('تم حفظ بيانات العقار، لكن فشل حذف الصور من Storage: ' + error.message)
        setLoading(false)
        return
      }

      const imageIds = removedImages.filter((image) => !image.isCoverOnly).map((image) => image.id)
      if (imageIds.length > 0) {
        const { error: deleteError } = await supabase.from('property_images').delete().in('id', imageIds)
        if (deleteError) {
          setError('تم حذف الصور من Storage، لكن فشل حذف سجلاتها: ' + deleteError.message)
          setLoading(false)
          return
        }
      }
    }

    if (newFiles.length > 0) {
      const imageRows = []
      for (const selectedFile of newFiles) {
        const f = await convertImageToWebp(selectedFile)
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
      if (!coverImage && imageRows.length > 0) {
        await supabase.from('properties').update({ cover_image: imageRows[0].image_url }).eq('id', propertyId)
      }
    }

    router.push('/admin/properties')
  }

  if (pageLoading) return <p className="text-gray-400">جارِ التحميل...</p>
  if (error && !form.title) return <p className="text-red-400">{error}</p>

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-extrabold text-white mb-6">تعديل العقار (أدمن)</h1>

      {images.length > 0 && (
        <div className="mb-6">
          <label className="text-gray-400 text-sm block mb-2">الصور الحالية</label>
          <div className="grid grid-cols-4 gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative">
                <img src={img.image_url} alt="" className="w-full h-20 object-cover rounded-lg" />
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
          <option value="rented">تم الإيجار</option>
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
          <label className="text-gray-400 text-sm block mb-2">أضف صور جديدة (اختياري)</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setNewFiles(Array.from(e.target.files))}
            className="text-white text-sm"
          />
          {newFiles.length > 0 && <div className="mt-3 grid grid-cols-3 gap-2">{newFiles.map((file, index) => <img key={`${file.name}-${index}`} src={URL.createObjectURL(file)} alt={`معاينة الصورة الجديدة ${index + 1}`} className="h-20 w-full rounded-lg object-cover" />)}</div>}
        </div>

        <label className="flex items-center gap-2 text-white text-sm">
          <input
            type="checkbox"
            checked={form.is_published}
            onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
          />
          منشور (ظاهر للزوار)
        </label>

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
  )
}
