import WebApp from '@twa-dev/sdk'
import { registerTelegramUserVisit } from '../services/shioriUsers'
import { buildTelegramUserPayload } from '../utils/telegramUser'
import { isTelegramMiniApp } from './platform'
import { getTelegramInitData } from './telegramRequestHeaders'
import {
  getSessionTelegramUserId,
  readTelegramMiniAppSession,
} from './telegramSessionStorage'
import type { TelegramUserPayload } from '../types/telegramUser'

const VISIT_PING_KEY = 'shiori_visit_ping_at'
const VISIT_PING_MAX_AGE_MS = 2 * 60 * 1000

let pingPromise: Promise<void> | null = null

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

const resolveVisitUser = (): TelegramUserPayload | null => {
  const fromTelegram = buildTelegramUserPayload(
    WebApp.initDataUnsafe?.user,
    getTelegramInitData(),
  )
  if (fromTelegram) return fromTelegram

  const sessionId = getSessionTelegramUserId()
  if (typeof sessionId !== 'number') return null
  return { id: sessionId, first_name: 'کاربر' }
}

/**
 * Record last_seen for the current Mini App user.
 * Safe to call often — client throttle is 2 minutes; visit_count stays 30 minutes server-side.
 */
export const pingTelegramVisit = async (options?: { force?: boolean }): Promise<void> => {
  if (!isTelegramMiniApp()) return

  const user = resolveVisitUser()
  if (typeof user?.id !== 'number') return

  const session = readTelegramMiniAppSession()
  const needsSession = !session?.token?.trim()
  if (!options?.force && !needsSession && Date.now() - readLastVisitPingAt() < VISIT_PING_MAX_AGE_MS) {
    return
  }

  if (!pingPromise) {
    pingPromise = registerTelegramUserVisit(user)
      .then(() => {
        writeLastVisitPingAt()
      })
      .catch((error) => {
        if (import.meta.env.DEV) console.warn('telegram visit ping failed:', error)
      })
      .finally(() => {
        pingPromise = null
      })
  }

  await pingPromise
}
