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
 * Removes JPEG APP1/APP2 segments (EXIF/XMP/GPS) from raw JPEG binary.
 * Used as a fallback when canvas is unavailable.
 *
 * SECURITY: JPEG EXIF can contain GPS coordinates revealing the user's location.
 */
async function stripJpegExifFallback(file: File): Promise<Blob> {
  const buf = await file.arrayBuffer()
  const view = new DataView(buf)
  const bytes = new Uint8Array(buf)

  // JPEG must start with FFD8
  if (view.getUint16(0) !== 0xffd8) return file

  const out: Uint8Array[] = [new Uint8Array([0xff, 0xd8])]
  let offset = 2

  while (offset + 3 < bytes.length) {
    if (bytes[offset] !== 0xff) break
    const marker = view.getUint16(offset)

    // End of image — copy and stop
    if (marker === 0xffd9) {
      out.push(new Uint8Array([0xff, 0xd9]))
      break
    }

    const segLen = view.getUint16(offset + 2)

    // APP1 (0xFFE1 = EXIF / XMP) and APP2 (0xFFE2 = ICC profile / EXIF ext) — DROP these
    if (marker === 0xffe1 || marker === 0xffe2) {
      offset += 2 + segLen
      continue
    }

    // All other markers: keep
    out.push(bytes.slice(offset, offset + 2 + segLen))
    offset += 2 + segLen
  }

  return new Blob(out, { type: 'image/jpeg' })
}

/**
 * Strips EXIF metadata and compresses the image.
 *
 * SECURITY: The canvas re-encode path drops ALL metadata (EXIF, GPS, XMP, ICC).
 * This prevents GPS coordinates embedded in phone camera photos from leaking
 * the user's home address or location.
 *
 * Primary path  : canvas drawImage → toBlob (always strips EXIF)
 * Fallback path : manual JPEG APP1/APP2 marker removal (JPEG only)
 * Last resort   : return original (PNG/WebP without canvas — EXIF rare)
 */
async function processImage(file: File, maxDim = 1600, quality = 0.82): Promise<Blob> {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    try {
      const stripped = await new Promise<Blob | null>((resolve) => {
        const img = new Image()
        const objectUrl = URL.createObjectURL(file)

        img.onload = () => {
          URL.revokeObjectURL(objectUrl)
          const ratio = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight))
          const w = Math.round(img.naturalWidth * ratio)
          const h = Math.round(img.naturalHeight * ratio)
          const canvas = document.createElement('canvas')
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            resolve(null)
            return
          }
          ctx.drawImage(img, 0, 0, w, h)
          const outType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
          // canvas.toBlob creates a brand-new image with NO EXIF metadata
          canvas.toBlob((blob) => resolve(blob), outType, quality)
        }

        img.onerror = () => {
          URL.revokeObjectURL(objectUrl)
          resolve(null)
        }

        img.src = objectUrl
      })

      if (stripped) return stripped
    } catch {
      // canvas failed — fall through to manual strip
    }
  }

  // Fallback: manually remove EXIF from JPEG binary
  if (file.type === 'image/jpeg') {
    return stripJpegExifFallback(file)
  }

  // PNG / WebP without canvas: return as-is (EXIF in PNG is uncommon)
  return file
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

  // processImage strips EXIF (GPS) AND compresses — order matters: moderate raw, then strip
  const blob = await processImage(file)

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
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return `${base}/storage/v1/object/public/${LISTINGS_BUCKET}/${path}`
}
