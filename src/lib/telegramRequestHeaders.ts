import WebApp from '@twa-dev/sdk'
import { getStoredTelegramInitData, persistTelegramInitData } from './platform'

/** Raw signed initData from Telegram WebApp (falls back to a persisted copy). */
export const getTelegramInitData = (): string => {
  const live = String(WebApp.initData ?? '').trim()
  if (live) {
    persistTelegramInitData(live)
    return live
  }
  return getStoredTelegramInitData()
}

export const getTelegramRequestHeaders = (): Record<string, string> => {
  const initData = getTelegramInitData()
  if (!initData) return {}
  return { 'x-telegram-init-data': initData }
}
