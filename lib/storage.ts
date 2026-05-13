import { createClient as createBrowserSupabase } from '@/lib/supabase/client'
import { moderateImage } from '@/lib/moderation/image-check'

const LISTINGS_BUCKET = 'listings'
const AVATARS_BUCKET = 'avatars'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
const MAX_FILE_BYTES = 5 * 1024 * 1024 // 5 MB

export interface UploadResult {
  path: string
  publicUrl: string
}

function assertImage(file: File): void {
  if (!ALLOWED_TYPES.includes(file.type as typeof ALLOWED_TYPES[number])) {
    throw new Error('نوع الملف غير مدعوم. JPG, PNG, WebP فقط')
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error('حجم الملف يجب أن يكون أقل من 5 ميجابايت')
  }
}

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80)
}

/**
 * Compresses an image client-side via canvas. Returns a Blob with the same
 * extension hint. Best-effort; falls back to the original on any error.
 */
async function compressImage(file: File, maxDim = 1600, quality = 0.82): Promise<Blob> {
  if (typeof window === 'undefined' || typeof document === 'undefined') return file

  return new Promise<Blob>((resolve) => {
    const img = new Image()
    img.onload = () => {
      const ratio = Math.min(1, maxDim / Math.max(img.width, img.height))
      const w = Math.round(img.width * ratio)
      const h = Math.round(img.height * ratio)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(file)
        return
      }
      ctx.drawImage(img, 0, 0, w, h)
      const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
      canvas.toBlob(
        (blob) => resolve(blob ?? file),
        outType,
        quality,
      )
    }
    img.onerror = () => resolve(file)
    img.src = URL.createObjectURL(file)
  })
}

async function uploadToBucket(
  bucket: string,
  ownerId: string,
  file: File,
): Promise<UploadResult> {
  assertImage(file)
  const moderation = await moderateImage(file)
  if (!moderation.safe) {
    throw new Error(moderation.reason || 'فشل التحقق من الصورة')
  }
  const supabase = createBrowserSupabase()
  const blob = await compressImage(file)
  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase()
  const path = `${ownerId}/${Date.now()}_${safeName(file.name)}.${ext}`

  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type,
  })
  if (error) throw new Error(error.message)

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { path, publicUrl: data.publicUrl }
}

export async function uploadListingImage(
  ownerId: string,
  file: File,
): Promise<UploadResult> {
  return uploadToBucket(LISTINGS_BUCKET, ownerId, file)
}

export async function uploadAvatar(
  ownerId: string,
  file: File,
): Promise<UploadResult> {
  return uploadToBucket(AVATARS_BUCKET, ownerId, file)
}

export async function deleteListingImage(path: string): Promise<void> {
  const supabase = createBrowserSupabase()
  await supabase.storage.from(LISTINGS_BUCKET).remove([path])
}

export function listingPublicUrl(path: string): string {
  if (!path) return ''
  if (path.startsWith('http')) return path
  // Best-effort manual URL composition for SSR contexts
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return `${base}/storage/v1/object/public/${LISTINGS_BUCKET}/${path}`
}
