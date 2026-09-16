import WebApp from '@twa-dev/sdk'

type TelegramWindow = Window & {
  TelegramWebviewProxy?: unknown
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

/** Telegram injects these into the Mini App URL hash / query. */
export const hasTelegramLaunchParams = (): boolean => {
  if (typeof window === 'undefined') return false
  try {
    return /(?:^|[?#&])tgWebApp(?:Data|Platform|Version)=/.test(
      String(window.location.href || ''),
    )
  } catch {
    return false
  }
}

/** Android Telegram WebView bridge — present even when initData/hash are still empty. */
export const hasTelegramWebviewProxy = (): boolean => {
  if (typeof window === 'undefined') return false
  return Boolean((window as TelegramWindow).TelegramWebviewProxy)
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
  return /Telegram/i.test(String(navigator.userAgent || ''))
}

/** True when running inside Telegram with signed initData. */
export const hasTelegramSignedInitData = (): boolean => {
  if (typeof window === 'undefined') return false
  return String(WebApp.initData ?? '').trim().length > 0
}

const telegramPlatform = (): string => {
  try {
    return String(WebApp.platform ?? '').toLowerCase().trim()
  } catch {
    return ''
  }
}

/**
 * Client-side Mini App environment check (not auth).
 * Must stay permissive for Telegram built-in proxy / slow WebViews where
 * initData and hash can be empty on the first tick.
 */
export const isTelegramMiniApp = (): boolean => {
  if (typeof window === 'undefined') return false

  if (hasTelegramSignedInitData()) return true
  if (hasTelegramLaunchParams()) return true
  if (hasTelegramWebviewProxy()) return true
  if (hasStoredTelegramInitParams()) return true

  const platform = telegramPlatform()
  if (platform && TELEGRAM_PLATFORMS.has(platform)) return true

  // Weak but useful on some Android/iOS WebViews behind proxy.
  if (hasTelegramUserAgent()) return true

  return false
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
