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
const USER_WAIT_MS = 2500
const RETRY_DELAY_MS = 800
const MAX_ATTEMPTS = 3

let pingPromise: Promise<void> | null = null

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

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

const waitForVisitUser = async (): Promise<TelegramUserPayload | null> => {
  const started = Date.now()
  let user = resolveVisitUser()
  while (!user && Date.now() - started < USER_WAIT_MS) {
    await delay(100)
    user = resolveVisitUser()
  }
  return user
}

/**
 * Record last_seen for the current Mini App user.
 * Safe to call often — client throttle is 2 minutes; visit_count stays 30 minutes server-side.
 */
export const pingTelegramVisit = async (options?: { force?: boolean }): Promise<void> => {
  if (!isTelegramMiniApp()) return

  const session = readTelegramMiniAppSession()
  const needsSession = !session?.token?.trim()
  if (!options?.force && !needsSession && Date.now() - readLastVisitPingAt() < VISIT_PING_MAX_AGE_MS) {
    return
  }

  if (!pingPromise) {
    pingPromise = (async () => {
      let lastError: unknown
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
        const user = attempt === 0 ? await waitForVisitUser() : resolveVisitUser()
        if (typeof user?.id !== 'number') {
          lastError = new Error('telegram user not ready')
          await delay(RETRY_DELAY_MS)
          continue
        }

        try {
          await registerTelegramUserVisit(user)
          writeLastVisitPingAt()
          return
        } catch (error) {
          lastError = error
          await delay(RETRY_DELAY_MS)
        }
      }

      if (import.meta.env.DEV && lastError) {
        console.warn('telegram visit ping failed:', lastError)
      }
    })().finally(() => {
      pingPromise = null
    })
  }

  await pingPromise
}
