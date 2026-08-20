import { supabase } from '@/lib/supabase'

const BUCKET = 'properties'
const PUBLIC_URL_PREFIX = `/storage/v1/object/public/${BUCKET}/`

export function storagePathFromPublicUrl(url) {
  if (!url) return null

  try {
    const path = new URL(url).pathname
    const pathStart = path.indexOf(PUBLIC_URL_PREFIX)

    return pathStart === -1
      ? null
      : decodeURIComponent(path.slice(pathStart + PUBLIC_URL_PREFIX.length))
  } catch {
    return null
  }
}

export async function removePropertyImages(imageUrls) {
  const paths = [...new Set(imageUrls.map(storagePathFromPublicUrl).filter(Boolean))]
  if (paths.length === 0) return

  const { error } = await supabase.storage.from(BUCKET).remove(paths)
  if (error) throw error
}

// يعمل في المتصفح قبل الرفع لتقليل حجم الصور الجديدة دون أي خدمة إضافية.
export async function convertImageToWebp(file) {
  if (!file?.type?.startsWith('image/') || file.type === 'image/webp') return file
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  const maxSide = 2200
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.84))
  if (!blob) return file
  return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.webp`, { type: 'image/webp' })
}
