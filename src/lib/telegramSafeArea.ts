import WebApp from '@twa-dev/sdk'
import { isTelegramDesktopPlatform } from '@/lib/platform'

type InsetBox = {
  top: number
  bottom: number
  left: number
  right: number
}

type WebAppSafeAreaApi = {
  safeAreaInset?: Partial<InsetBox>
  contentSafeAreaInset?: Partial<InsetBox>
  isFullscreen?: boolean
  setHeaderColor?: (color: 'bg_color' | 'secondary_bg_color' | string) => void
  onEvent?: (event: string, cb: () => void) => void
  offEvent?: (event: string, cb: () => void) => void
  isVersionAtLeast?: (version: string) => boolean
}

/** Typical Telegram fullscreen chrome row (Close / chevron / menu) when insets are late. */
const FULLSCREEN_CONTENT_TOP_FALLBACK = 54

const px = (n: number): string => `${Math.max(0, Math.round(n))}px`

const readCssPx = (name: string): number => {
  if (typeof document === 'undefined') return 0
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  const n = Number.parseFloat(raw)
  return Number.isFinite(n) ? n : 0
}

const insetSide = (
  box: Partial<InsetBox> | undefined,
  side: keyof InsetBox,
  cssVar: string,
): number => Math.max(0, Number(box?.[side]) || 0, readCssPx(cssVar))

/**
 * Sync computed app insets onto :root.
 * Never overwrite Telegram's --tg-* vars (SDK 8 sets those via events).
 *
 * --app-tg-safe-top: device notch / status bar
 * --app-tg-content-top: Telegram chrome row (Close … menu) — logo sits in this band
 * --app-tg-top-inset: safe + content (full clearance below chrome)
 */
export const syncTelegramSafeAreaCss = (): void => {
  if (typeof document === 'undefined') return

  const wa = WebApp as unknown as WebAppSafeAreaApi
  const root = document.documentElement

  const safeTop = insetSide(wa.safeAreaInset, 'top', '--tg-safe-area-inset-top')
  const safeBottom = insetSide(wa.safeAreaInset, 'bottom', '--tg-safe-area-inset-bottom')
  let contentTop = insetSide(
    wa.contentSafeAreaInset,
    'top',
    '--tg-content-safe-area-inset-top',
  )
  const contentBottom = insetSide(
    wa.contentSafeAreaInset,
    'bottom',
    '--tg-content-safe-area-inset-bottom',
  )

  if (wa.isFullscreen && contentTop < 40 && !isTelegramDesktopPlatform()) {
    contentTop = FULLSCREEN_CONTENT_TOP_FALLBACK
  }

  root.style.setProperty('--app-tg-safe-top', px(safeTop))
  root.style.setProperty('--app-tg-content-top', px(contentTop))
  root.style.setProperty('--app-tg-top-inset', px(safeTop + contentTop))
  root.style.setProperty('--app-tg-bottom-inset', px(safeBottom + contentBottom))
}

/** Apply Telegram chrome styling. Launch size is controlled by BotFather (compact/fullscreen). */
export const ensureTelegramFullscreenLayout = (): void => {
  const wa = WebApp as unknown as WebAppSafeAreaApi
  try {
    if (isTelegramDesktopPlatform()) return
    wa.setHeaderColor?.('secondary_bg_color')
  } catch {
    // ignore
  }
}

export const subscribeTelegramSafeArea = (onChange: () => void): (() => void) => {
  const wa = WebApp as unknown as WebAppSafeAreaApi
  if (typeof wa.onEvent !== 'function') return () => undefined

  wa.onEvent('safeAreaChanged', onChange)
  wa.onEvent('contentSafeAreaChanged', onChange)
  wa.onEvent('fullscreenChanged', onChange)
  wa.onEvent('viewportChanged', onChange)

  return () => {
    wa.offEvent?.('safeAreaChanged', onChange)
    wa.offEvent?.('contentSafeAreaChanged', onChange)
    wa.offEvent?.('fullscreenChanged', onChange)
    wa.offEvent?.('viewportChanged', onChange)
  }
}

export const canUseTelegramSafeArea = (): boolean => {
  try {
    const wa = WebApp as unknown as WebAppSafeAreaApi
    if (typeof wa.isVersionAtLeast === 'function') {
      return wa.isVersionAtLeast('8.0')
    }
  } catch {
    // ignore
  }
  const wa = WebApp as unknown as WebAppSafeAreaApi
  return Boolean(wa.safeAreaInset || wa.contentSafeAreaInset)
}
