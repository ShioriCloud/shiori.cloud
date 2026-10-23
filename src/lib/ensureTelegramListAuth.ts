import WebApp from '@twa-dev/sdk'
import { registerTelegramUserVisit } from '../services/shioriUsers'
import { buildTelegramUserPayload } from '../utils/telegramUser'
import { hasTelegramSignedInitData, isTelegramMiniApp } from './platform'
import { readTelegramMiniAppSession } from './telegramSessionStorage'

let bootstrapPromise: Promise<void> | null = null

const VISIT_PING_KEY = 'shiori_visit_ping_at'
const VISIT_PING_MAX_AGE_MS = 10 * 60 * 1000

const readLastVisitPingAt = (): number => {
  try {
    const raw = Number(sessionStorage.getItem(VISIT_PING_KEY) || 0)
    return Number.isFinite(raw) ? raw : 0
  } catch {
    return 0
  }
}

const writeLastVisitPingAt = (): void => {
  try {
    sessionStorage.setItem(VISIT_PING_KEY, String(Date.now()))
  } catch {
    // private mode
  }
}

/** Ensures a server session exists before protected list API calls (Telegram mini-app). */
export const ensureTelegramListAuth = async (): Promise<void> => {
  if (!isTelegramMiniApp()) return
  if (!hasTelegramSignedInitData()) return

  const user = buildTelegramUserPayload(WebApp.initDataUnsafe.user, WebApp.initData)
  if (typeof user?.id !== 'number') return

  const session = readTelegramMiniAppSession()
  const sessionMatches =
    Boolean(session?.token?.trim()) &&
    (session?.telegramUserId == null || session.telegramUserId === user.id)
  const pingedRecently = Date.now() - readLastVisitPingAt() < VISIT_PING_MAX_AGE_MS

  // Reuse the live session, but still ping last_seen at least every 10 minutes.
  if (sessionMatches && pingedRecently) return

  if (!bootstrapPromise) {
    bootstrapPromise = registerTelegramUserVisit(user)
      .then(() => {
        writeLastVisitPingAt()
      })
      .catch((error) => {
        if (import.meta.env.DEV) console.warn('telegram session bootstrap failed:', error)
      })
      .finally(() => {
        bootstrapPromise = null
      })
  }

  await bootstrapPromise
}
