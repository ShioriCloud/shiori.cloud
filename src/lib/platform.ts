import WebApp from '@twa-dev/sdk'

/** Telegram injects these into the Mini App URL hash / query. */
const hasTelegramLaunchParams = (): boolean => {
  if (typeof window === 'undefined') return false
  try {
    return /(?:^|[?#&])tgWebApp(?:Data|Platform|Version)=/.test(String(window.location.href || ''))
  } catch {
    return false
  }
}

/** True when running inside Telegram with signed initData. */
export const hasTelegramSignedInitData = (): boolean => {
  if (typeof window === 'undefined') return false
  return String(WebApp.initData ?? '').trim().length > 0
}

export const isTelegramMiniApp = (): boolean => {
  if (typeof window === 'undefined') return false

  if (hasTelegramSignedInitData()) return true

  // Launch params survive even when the CDN script failed and initData is late.
  if (hasTelegramLaunchParams()) return true

  const platform = String(WebApp.platform ?? '').toLowerCase()
  return platform !== 'unknown' && platform !== '' && platform !== 'web'
}

export type AppPlatform = 'telegram' | 'web'

/** Telegram Desktop / Web clients — mini-app panel should stay windowed, not expanded/fullscreen. */
export const isTelegramDesktopPlatform = (): boolean => {
  if (typeof window === 'undefined') return false
  const platform = String(WebApp.platform ?? '').toLowerCase()
  return ['tdesktop', 'macos', 'web', 'weba', 'webk', 'unigram'].includes(platform)
}

export const getAppPlatform = (): AppPlatform =>
  isTelegramMiniApp() ? 'telegram' : 'web'
