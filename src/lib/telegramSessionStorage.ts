export const TELEGRAM_MINI_APP_SESSION_KEY = 'shiori_telegram_mini_app_session'

export type TelegramMiniAppSession = {
  token: string
  expiresAt: string
  telegramUserId?: number
}

const readRaw = (): TelegramMiniAppSession | null => {
  try {
    const raw = localStorage.getItem(TELEGRAM_MINI_APP_SESSION_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as TelegramMiniAppSession
    if (!parsed?.token || !parsed?.expiresAt) return null

    const expiresMs = Date.parse(parsed.expiresAt)
    if (Number.isFinite(expiresMs) && expiresMs <= Date.now()) {
      localStorage.removeItem(TELEGRAM_MINI_APP_SESSION_KEY)
      return null
    }

    const telegramUserId =
      typeof parsed.telegramUserId === 'number' && Number.isFinite(parsed.telegramUserId)
        ? parsed.telegramUserId
        : undefined

    return {
      token: String(parsed.token),
      expiresAt: parsed.expiresAt,
      ...(telegramUserId != null ? { telegramUserId } : {}),
    }
  } catch {
    return null
  }
}

export const readTelegramMiniAppSession = (): TelegramMiniAppSession | null => readRaw()

export const writeTelegramMiniAppSession = (session: TelegramMiniAppSession): void => {
  localStorage.setItem(TELEGRAM_MINI_APP_SESSION_KEY, JSON.stringify(session))
}

export const clearTelegramMiniAppSession = (): void => {
  try {
    localStorage.removeItem(TELEGRAM_MINI_APP_SESSION_KEY)
  } catch {
    // ignore
  }
}

export const getTelegramMiniAppSessionHeaders = (): Record<string, string> => {
  const token = readTelegramMiniAppSession()?.token?.trim()
  if (!token) return {}
  return { 'x-app-session-token': token }
}

export const getSessionTelegramUserId = (): number | null => {
  const id = readTelegramMiniAppSession()?.telegramUserId
  return typeof id === 'number' && Number.isFinite(id) ? id : null
}
