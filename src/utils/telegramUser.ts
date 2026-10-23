import type { TelegramUserPayload } from '@/types/telegramUser'

type UnsafeTelegramUser = {
  id?: number
  first_name?: string
  last_name?: string
  username?: string
  language_code?: string
  photo_url?: string
  is_premium?: boolean
}

const normalizeUsername = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim().replace(/^@+/, '')
  return trimmed.length > 0 ? trimmed : undefined
}

const parseUserFromInitData = (initData?: string): UnsafeTelegramUser | null => {
  if (!initData?.trim()) return null

  try {
    const raw = new URLSearchParams(initData).get('user')
    if (!raw) return null
    const parsed = JSON.parse(raw) as UnsafeTelegramUser
    return typeof parsed?.id === 'number' ? parsed : null
  } catch {
    return null
  }
}

/** Telegram user with fallback from the signed initData query string. */
export const buildTelegramUserPayload = (
  unsafeUser: UnsafeTelegramUser | null | undefined,
  initData?: string
): TelegramUserPayload | null => {
  const fromUnsafe =
    unsafeUser && typeof unsafeUser.id === 'number' ? unsafeUser : null
  const user = fromUnsafe ?? parseUserFromInitData(initData)
  if (!user || typeof user.id !== 'number') return null

  const username =
    normalizeUsername(user.username) ??
    normalizeUsername(parseUserFromInitData(initData)?.username)

  return {
    id: user.id,
    first_name: user.first_name ?? '',
    last_name: user.last_name,
    username,
    language_code: user.language_code,
    photo_url: user.photo_url,
    is_premium: user.is_premium,
  }
}
