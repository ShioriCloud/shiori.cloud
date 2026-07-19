import { shioriApiBaseUrl, shioriFetch } from './shioriApi'
import { getTelegramInitData } from './telegramRequestHeaders'
import { isTelegramMiniApp } from './platform'
import {
  readTelegramMiniAppSession,
  writeTelegramMiniAppSession,
} from './telegramSessionStorage'

export const hasAppUserAuth = (): boolean =>
  Boolean(getTelegramInitData() || readTelegramMiniAppSession()?.token?.trim())

type DevSessionResponse = {
  ok: boolean
  session_token?: string
  expires_at?: string
  telegram_user_id?: number
}

let bootstrapPromise: Promise<boolean> | null = null

const mintDevSession = async (): Promise<boolean> => {
  if (!shioriApiBaseUrl) return false
  try {
    const result = await shioriFetch<DevSessionResponse>('/telegram-users/dev-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    if (result.session_token && result.expires_at) {
      writeTelegramMiniAppSession({
        token: result.session_token,
        expiresAt: result.expires_at,
        ...(typeof result.telegram_user_id === 'number'
          ? { telegramUserId: result.telegram_user_id }
          : {}),
      })
      return typeof result.telegram_user_id === 'number'
    }
  } catch (error) {
    console.warn('dev session bootstrap failed:', error)
  }
  return false
}

/**
 * In Vite DEV + browser (not Telegram), mint a local API session when
 * ALLOW_DEV_AUTH is enabled on the API. No-op in production builds.
 *
 * Always ensures `telegramUserId` is present on the stored session so list
 * mutations can sync to the API (otherwise data only lives in localStorage).
 */
export const ensureDevAppAuth = async (): Promise<boolean> => {
  if (!import.meta.env.DEV) return hasAppUserAuth()
  if (isTelegramMiniApp()) return hasAppUserAuth()

  const existing = readTelegramMiniAppSession()
  if (existing?.token?.trim() && typeof existing.telegramUserId === 'number') {
    return true
  }

  if (!bootstrapPromise) {
    bootstrapPromise = mintDevSession().finally(() => {
      bootstrapPromise = null
    })
  }

  return bootstrapPromise
}
