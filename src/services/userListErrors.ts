const GENERIC = 'مشکلی پیش آمد. دوباره امتحان کنید.'
const SESSION_EXPIRED = 'نشست شما منقضی شده — مینی‌اپ را ببندید و دوباره باز کنید.'
const TELEGRAM_AUTH = 'ورود تلگرام تأیید نشد. مینی‌اپ را ببندید و دوباره باز کنید.'
const TELEGRAM_MISSING = 'ورود تلگرام پیدا نشد. مینی‌اپ را از تلگرام باز کنید.'
const SERVER_UNAVAILABLE = 'سرویس فعلاً در دسترس نیست. کمی بعد دوباره امتحان کنید.'
const UNAUTH = 'ورود ناموفق بود. مینی‌اپ را ببندید و دوباره باز کنید.'
const FORBIDDEN = 'دسترسی رد شد. مینی‌اپ را ببندید و دوباره باز کنید.'
const TIMEOUT = 'اتصال قطع شد. دوباره امتحان کنید.'
const SERVER = 'سرور موقتاً در دسترس نیست. دوباره امتحان کنید.'
const NOT_FOUND = 'مورد درخواستی پیدا نشد.'
const RATE_LIMIT = 'تعداد درخواست‌ها زیاد است. کمی بعد دوباره امتحان کنید.'

const TECHNICAL_RE =
  /bot_token|hash_mismatch|vite_|telegram_bot_token|\.env\b|initdata|row-level|permission denied|api \s*\d|statuscode|stack trace|postgres|sqlstate|unauthorizedexception|internal server|telegrambot|botfather|restart|econnrefused|enotfound/i

const PERSIAN_RE = /[\u0600-\u06FF]/

const stripApiPrefix = (raw: string): string =>
  raw.replace(/^API \d+:\s*/i, '').replace(/^"|"$/g, '').trim()

const extractPayload = (raw: string): string => {
  const stripped = stripApiPrefix(raw)
  if (!stripped) return raw

  try {
    const parsed: unknown = JSON.parse(stripped)
    if (typeof parsed === 'string') return parsed
    if (parsed && typeof parsed === 'object') {
      const record = parsed as { message?: unknown; error?: unknown }
      if (typeof record.message === 'string') return record.message
      if (Array.isArray(record.message)) {
        return record.message.filter((item): item is string => typeof item === 'string').join(' ')
      }
      if (typeof record.error === 'string') return record.error
    }
  } catch {
    // body is plain text
  }

  return stripped
}

const looksTechnical = (value: string): boolean => TECHNICAL_RE.test(value)

const looksSafeUserCopy = (value: string): boolean => {
  const trimmed = value.trim()
  if (!trimmed || trimmed.length > 160) return false
  if (looksTechnical(trimmed)) return false
  return PERSIAN_RE.test(trimmed)
}

/** Map API / auth failures to short Persian copy. Never leak server config. */
export const formatUserFacingApiError = (error: unknown): string => {
  const raw = error instanceof Error ? error.message : String(error ?? '')
  const haystack = `${raw} ${extractPayload(raw)}`.toLowerCase()

  if (haystack.includes('bot_token_missing')) return SERVER_UNAVAILABLE
  if (haystack.includes('hash_mismatch')) return TELEGRAM_AUTH
  if (haystack.includes('invalid_session') || haystack.includes('auth_date_expired')) {
    return SESSION_EXPIRED
  }
  if (haystack.includes('initdata یافت نشد') || haystack.includes('telegram initdata')) {
    return haystack.includes('یافت نشد') ? TELEGRAM_MISSING : TELEGRAM_AUTH
  }
  if (haystack.includes('invalid telegram init')) return TELEGRAM_AUTH
  if (
    haystack.includes('timeout') ||
    haystack.includes('aborterror') ||
    haystack.includes('failed to fetch') ||
    haystack.includes('networkerror')
  ) {
    return TIMEOUT
  }
  if (
    haystack.includes('vite_shiori_api') ||
    haystack.includes('shiori-api را قرار دهید') ||
    haystack.includes('تنظیم نشده')
  ) {
    return SERVER_UNAVAILABLE
  }
  if (haystack.includes('row-level') || haystack.includes('permission denied')) return FORBIDDEN
  if (haystack.includes('وارد حساب')) {
    const payload = extractPayload(raw)
    if (looksSafeUserCopy(payload)) return payload.trim()
  }

  const payload = extractPayload(raw)
  if (looksSafeUserCopy(payload)) return payload.trim()

  const statusMatch = raw.match(/API (\d+)/i)
  const status = statusMatch ? Number(statusMatch[1]) : NaN
  if (status === 401 || haystack.includes('authentication required')) return UNAUTH
  if (status === 403) return FORBIDDEN
  if (status === 404) return NOT_FOUND
  if (status === 429) return RATE_LIMIT
  if (status >= 500) return SERVER
  if (status >= 400) return GENERIC

  if (looksSafeUserCopy(raw)) return raw.trim()
  return GENERIC
}

export const formatUserListSaveError = formatUserFacingApiError
