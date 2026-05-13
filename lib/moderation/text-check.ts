import 'server-only'

const BANNED_WORDS: string[] = [
  // Add common spam/profanity terms here. Keep list short — overly aggressive filters cause false positives.
  // This is intentionally minimal; real text moderation should use a provider (Perspective API, AWS Comprehend).
]

const URL_PATTERN = /https?:\/\/|www\./i
const EMAIL_PATTERN = /[\w.+-]+@[\w-]+\.[\w.-]+/i
const PHONE_PATTERN = /(\+?\d[\d\s\-()]{6,})/

export interface TextModerationResult {
  safe: boolean
  reason?: string
  provider: string
}

/**
 * Lightweight text moderation. Blocks contact-info exfiltration attempts and
 * obvious spam. Pluggable for a real provider (Perspective API / Comprehend).
 */
export function moderateText(input: string, opts?: { allowContactInfo?: boolean }): TextModerationResult {
  const provider = process.env.MODERATION_PROVIDER || 'rules'
  const text = input.trim()

  if (text.length === 0) {
    return { safe: false, reason: 'النص فارغ', provider }
  }

  // Block URLs in listing titles/descriptions (forces buyers to message)
  if (!opts?.allowContactInfo) {
    if (URL_PATTERN.test(text)) {
      return { safe: false, reason: 'لا يُسمح بالروابط', provider }
    }
    if (EMAIL_PATTERN.test(text)) {
      return { safe: false, reason: 'لا يُسمح بمشاركة البريد الإلكتروني', provider }
    }
    if (PHONE_PATTERN.test(text)) {
      return { safe: false, reason: 'لا يُسمح بمشاركة أرقام الهاتف', provider }
    }
  }

  // Banned word check
  const lower = text.toLowerCase()
  for (const word of BANNED_WORDS) {
    if (lower.includes(word.toLowerCase())) {
      return { safe: false, reason: 'النص يحتوي على كلمات غير مسموحة', provider }
    }
  }

  return { safe: true, provider }
}
