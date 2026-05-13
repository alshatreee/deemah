export interface ModerationResult {
  safe: boolean
  reason?: string
  provider: string
}

/**
 * Pluggable image moderation. Currently a no-op pass-through, but the call site
 * is in place so swapping in AWS Rekognition / Cloudflare Workers AI / sightengine
 * is a single-file change.
 *
 * To enable a real provider, set MODERATION_PROVIDER env var and add the
 * implementation in this file.
 */
export async function moderateImage(file: File): Promise<ModerationResult> {
  const provider = process.env.MODERATION_PROVIDER || 'none'

  // Basic file-level sanity checks always run
  if (file.size === 0) {
    return { safe: false, reason: 'ملف فارغ', provider }
  }
  if (file.size > 5 * 1024 * 1024) {
    return { safe: false, reason: 'الحجم يتجاوز 5 ميجابايت', provider }
  }
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    return { safe: false, reason: 'نوع الملف غير مدعوم', provider }
  }

  // TODO: wire actual moderation provider when ready.
  // Example for AWS Rekognition:
  // if (provider === 'aws-rekognition') {
  //   const buf = Buffer.from(await file.arrayBuffer())
  //   const rek = new RekognitionClient({ region: process.env.AWS_REGION })
  //   const out = await rek.send(new DetectModerationLabelsCommand({ Image: { Bytes: buf } }))
  //   const blocking = (out.ModerationLabels || []).filter(l => (l.Confidence || 0) > 80)
  //   if (blocking.length > 0) return { safe: false, reason: 'محتوى غير مناسب', provider }
  // }

  return { safe: true, provider }
}
