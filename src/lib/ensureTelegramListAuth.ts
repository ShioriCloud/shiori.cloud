import WebApp from '@twa-dev/sdk'
import { registerTelegramUserVisit } from '../services/shioriUsers'
import { buildTelegramUserPayload } from '../utils/telegramUser'
import { hasTelegramSignedInitData, isTelegramMiniApp } from './platform'
import { readTelegramMiniAppSession } from './telegramSessionStorage'

let bootstrapPromise: Promise<void> | null = null

/** Ensures a server session exists before protected list API calls (Telegram mini-app). */
export const ensureTelegramListAuth = async (): Promise<void> => {
  if (!isTelegramMiniApp()) return
  if (readTelegramMiniAppSession()?.token?.trim()) return
  if (!hasTelegramSignedInitData()) return

  const user = buildTelegramUserPayload(WebApp.initDataUnsafe.user, WebApp.initData)
  if (typeof user?.id !== 'number') return

  if (!bootstrapPromise) {
    bootstrapPromise = registerTelegramUserVisit(user)
      .catch((error) => {
        if (import.meta.env.DEV) console.warn('telegram session bootstrap failed:', error)
      })
      .finally(() => {
        bootstrapPromise = null
      })
  }

  await bootstrapPromise
}
