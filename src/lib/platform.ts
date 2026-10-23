import WebApp from '@twa-dev/sdk'

type TelegramWindow = Window & {
  TelegramWebviewProxy?: unknown
  TelegramWebviewProxyProto?: unknown
  TelegramWebview?: unknown
  Telegram?: { WebApp?: { initData?: string; platform?: string } }
}

const TELEGRAM_PLATFORMS = new Set([
  'android',
  'android_x',
  'ios',
  'macos',
  'tdesktop',
  'web',
  'weba',
  'webk',
  'unigram',
  'windows',
  'linux',
])

const LAUNCH_HASH_KEY = '__telegram__launch_hash'
const INIT_DATA_KEY = '__telegram__init_data'

const extractTgWebAppData = (source: string): string => {
  const raw = String(source ?? '').trim()
  if (!raw || !/tgWebAppData=/.test(raw)) return ''
  try {
    const withoutHash = raw.replace(/^#/, '')
    const query = withoutHash.includes('?')
      ? withoutHash.slice(withoutHash.indexOf('?') + 1)
      : withoutHash
    return String(new URLSearchParams(query).get('tgWebAppData') ?? '').trim()
  } catch {
    return ''
  }
}

export const persistTelegramInitData = (initData: string): void => {
  const value = String(initData ?? '').trim()
  if (!value || typeof window === 'undefined') return
  try {
    sessionStorage.setItem(INIT_DATA_KEY, value)
  } catch {
    // private mode / blocked storage
  }
}

const readPersistedInitData = (): string => {
  if (typeof window === 'undefined') return ''
  try {
    return String(sessionStorage.getItem(INIT_DATA_KEY) || '').trim()
  } catch {
    return ''
  }
}

/** Persist tgWebApp* hash ASAP — iOS/WebView can lose it on navigation/refresh. */
export const persistTelegramLaunchHash = (): void => {
  if (typeof window === 'undefined') return
  try {
    const hash = String(window.location.hash || '')
    const search = String(window.location.search || '')
    if (/tgWebApp(?:Data|Platform|Version)=/.test(hash)) {
      sessionStorage.setItem(LAUNCH_HASH_KEY, hash)
    } else if (/tgWebApp(?:Data|Platform|Version)=/.test(search)) {
      sessionStorage.setItem(LAUNCH_HASH_KEY, search)
    }

    const fromUrl = extractTgWebAppData(hash) || extractTgWebAppData(search)
    if (fromUrl) persistTelegramInitData(fromUrl)
  } catch {
    // private mode / blocked storage
  }
}

const readPersistedLaunchHash = (): string => {
  if (typeof window === 'undefined') return ''
  try {
    return String(sessionStorage.getItem(LAUNCH_HASH_KEY) || '')
  } catch {
    return ''
  }
}

/** Signed initData from sessionStorage / launch hash when WebApp.initData is empty. */
export const getStoredTelegramInitData = (): string => {
  persistTelegramLaunchHash()
  const stored = readPersistedInitData()
  if (stored) return stored

  const fromLaunch = extractTgWebAppData(readPersistedLaunchHash())
  if (fromLaunch) {
    persistTelegramInitData(fromLaunch)
    return fromLaunch
  }
  return ''
}

/** Telegram injects these into the Mini App URL hash / query (or a persisted copy). */
export const hasTelegramLaunchParams = (): boolean => {
  if (typeof window === 'undefined') return false
  try {
    const href = String(window.location.href || '')
    if (/(?:^|[?#&])tgWebApp(?:Data|Platform|Version)=/.test(href)) return true
    return /tgWebApp(?:Data|Platform|Version)=/.test(readPersistedLaunchHash())
  } catch {
    return false
  }
}

/** Native Telegram WebView bridges (Android + iOS variants). */
export const hasTelegramWebviewBridge = (): boolean => {
  if (typeof window === 'undefined') return false
  const w = window as TelegramWindow
  return Boolean(
    w.TelegramWebviewProxy ||
      w.TelegramWebviewProxyProto ||
      w.TelegramWebview,
  )
}

/** Prior Mini App open in this WebView may have stored launch params. */
export const hasStoredTelegramInitParams = (): boolean => {
  if (typeof window === 'undefined') return false
  try {
    const raw = sessionStorage.getItem('__telegram__initParams')
    return Boolean(raw && /tgWebApp(?:Data|Platform|Version)/.test(raw))
  } catch {
    return false
  }
}

export const hasTelegramUserAgent = (): boolean => {
  if (typeof navigator === 'undefined') return false
  // Note: many iOS Telegram builds use a plain Safari UA — do not rely on this alone.
  return /Telegram/i.test(String(navigator.userAgent || ''))
}

/** True when running inside Telegram with signed initData. */
export const hasTelegramSignedInitData = (): boolean => {
  if (typeof window === 'undefined') return false
  if (String(WebApp.initData ?? '').trim().length > 0) return true
  return getStoredTelegramInitData().length > 0
}

const telegramPlatform = (): string => {
  try {
    return String(WebApp.platform ?? '').toLowerCase().trim()
  } catch {
    return ''
  }
}

/**
 * Client-side Mini App environment hint (not auth).
 * Prefer false negatives over locking users behind the boot gate — real auth
 * is validated server-side via initData HMAC.
 */
export const isTelegramMiniApp = (): boolean => {
  if (typeof window === 'undefined') return false

  persistTelegramLaunchHash()

  if (hasTelegramSignedInitData()) return true
  if (hasTelegramLaunchParams()) return true
  if (hasTelegramWebviewBridge()) return true
  if (hasStoredTelegramInitParams()) return true

  const platform = telegramPlatform()
  if (platform && TELEGRAM_PLATFORMS.has(platform)) return true

  if (hasTelegramUserAgent()) return true

  return false
}

/**
 * Plain desktop browsers with zero Telegram signals — lock immediately
 * (no splash wait). Mobile / WebView stays ambiguous because iOS Telegram
 * often looks like Safari until initData arrives.
 */
export const isClearlyOutsideTelegram = (): boolean => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false
  if (isTelegramMiniApp()) return false

  const ua = String(navigator.userAgent || '')
  // iOS Telegram Mini Apps often report a plain Safari UA.
  if (/iPhone|iPad|iPod/i.test(ua)) return false
  // Android Telegram WebViews can populate bridges/initData a moment later.
  if (/Android/i.test(ua)) return false

  return true
}

/** Poll briefly — proxy/slow WebViews often populate initData a moment later. */
export const waitForTelegramMiniApp = async (
  timeoutMs = 2500,
): Promise<boolean> => {
  if (isTelegramMiniApp()) return true

  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    await new Promise((r) => setTimeout(r, 100))
    if (isTelegramMiniApp()) return true
  }
  return isTelegramMiniApp()
}

export type AppPlatform = 'telegram' | 'web'

/** Telegram Desktop / Web clients — mini-app panel should stay windowed, not expanded/fullscreen. */
export const isTelegramDesktopPlatform = (): boolean => {
  if (typeof window === 'undefined') return false
  const platform = telegramPlatform()
  return ['tdesktop', 'macos', 'web', 'weba', 'webk', 'unigram'].includes(platform)
}

export const getAppPlatform = (): AppPlatform =>
  isTelegramMiniApp() ? 'telegram' : 'web'
