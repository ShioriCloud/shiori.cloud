import { APP_SESSION_KEY, readStoredAppSession } from './appSessionStorage'

/** Device flag after preview URL or successful allowlisted login. */
export const WEB_MINIAPP_BYPASS_KEY = 'shiori_web_miniapp_bypass'

export const WEB_MINIAPP_PREVIEW_PARAM = 'web_preview'

const parseAllowlist = (): Set<number> => {
  const raw = String(import.meta.env.VITE_WEB_MINIAPP_ALLOWLIST ?? '').trim()
  if (!raw) return new Set()

  const ids = new Set<number>()
  for (const part of raw.split(/[,\s]+/)) {
    const n = Number(part.trim())
    if (Number.isFinite(n) && n !== 0) ids.add(Math.trunc(n))
  }
  return ids
}

const readPreviewKey = (): string =>
  String(import.meta.env.VITE_WEB_MINIAPP_PREVIEW_KEY ?? '').trim()

export const isUserIdWebMiniappAllowed = (userId: number): boolean => {
  const allowlist = parseAllowlist()
  if (allowlist.size === 0) return false
  return allowlist.has(Math.trunc(userId))
}

export const isWebMiniappGateConfigured = (): boolean =>
  parseAllowlist().size > 0 || Boolean(readPreviewKey())

export const readWebMiniappBypassFlag = (): boolean => {
  try {
    return localStorage.getItem(WEB_MINIAPP_BYPASS_KEY) === '1'
  } catch {
    return false
  }
}

export const setWebMiniappBypassForUser = (userId: number): void => {
  if (!isUserIdWebMiniappAllowed(userId)) return
  try {
    localStorage.setItem(WEB_MINIAPP_BYPASS_KEY, '1')
  } catch {
    // ignore
  }
}

export const clearWebMiniappBypass = (): void => {
  try {
    localStorage.removeItem(WEB_MINIAPP_BYPASS_KEY)
  } catch {
    // ignore
  }
}

/** Mirrors index.html gate — used when env allowlist matches a stored session. */
export const hasAllowlistedWebSessionInStorage = (): boolean => {
  try {
    const raw = localStorage.getItem(APP_SESSION_KEY)
    if (!raw) return false
    const parsed = JSON.parse(raw) as { userId?: number; expiresAt?: string }
    if (typeof parsed?.userId !== 'number') return false
    const expiresMs = Date.parse(String(parsed.expiresAt ?? ''))
    if (Number.isFinite(expiresMs) && expiresMs <= Date.now()) return false
    return isUserIdWebMiniappAllowed(parsed.userId)
  } catch {
    return false
  }
}

export const processWebMiniappPreviewFromUrl = (): boolean => {
  const secret = readPreviewKey()
  if (!secret) return false

  try {
    const params = new URLSearchParams(window.location.search)
    const key = params.get(WEB_MINIAPP_PREVIEW_PARAM)?.trim()
    if (!key || key !== secret) return false

    localStorage.setItem(WEB_MINIAPP_BYPASS_KEY, '1')
    params.delete(WEB_MINIAPP_PREVIEW_PARAM)
    const qs = params.toString()
    const next = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash || ''}`
    window.history.replaceState(null, '', next)
    return true
  } catch {
    return false
  }
}

/**
 * Desktop browser: allow boot when allowlist is configured and either
 * preview unlock, stored bypass, or an allowlisted web session exists.
 */
export const shouldAllowWebMiniappOutsideTelegram = (): boolean => {
  if (!isWebMiniappGateConfigured()) return false

  processWebMiniappPreviewFromUrl()

  if (readWebMiniappBypassFlag()) return true
  if (hasAllowlistedWebSessionInStorage()) {
    const session = readStoredAppSession()
    if (session) setWebMiniappBypassForUser(session.userId)
    return true
  }

  const session = readStoredAppSession()
  if (session && isUserIdWebMiniappAllowed(session.userId)) {
    setWebMiniappBypassForUser(session.userId)
    return true
  }

  return false
}
