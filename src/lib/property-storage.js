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
