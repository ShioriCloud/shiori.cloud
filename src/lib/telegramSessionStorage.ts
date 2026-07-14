export const TELEGRAM_MINI_APP_SESSION_KEY = 'shiori_telegram_mini_app_session'

export type TelegramMiniAppSession = {
  token: string
  expiresAt: string
}

export const readTelegramMiniAppSession = (): TelegramMiniAppSession | null => {
  try {
    const raw = sessionStorage.getItem(TELEGRAM_MINI_APP_SESSION_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw) as TelegramMiniAppSession
    if (!parsed?.token || !parsed?.expiresAt) return null

    const expiresMs = Date.parse(parsed.expiresAt)
    if (Number.isFinite(expiresMs) && expiresMs <= Date.now()) {
      sessionStorage.removeItem(TELEGRAM_MINI_APP_SESSION_KEY)
      return null
    }

    return {
      token: String(parsed.token),
      expiresAt: parsed.expiresAt,
    }
  } catch {
    return null
  }
}

export const writeTelegramMiniAppSession = (session: TelegramMiniAppSession): void => {
  sessionStorage.setItem(TELEGRAM_MINI_APP_SESSION_KEY, JSON.stringify(session))
}

export const clearTelegramMiniAppSession = (): void => {
  try {
    sessionStorage.removeItem(TELEGRAM_MINI_APP_SESSION_KEY)
  } catch {
    // ignore
  }
}

export const getTelegramMiniAppSessionHeaders = (): Record<string, string> => {
  const token = readTelegramMiniAppSession()?.token?.trim()
  if (!token) return {}
  return { 'x-app-session-token': token }
}
