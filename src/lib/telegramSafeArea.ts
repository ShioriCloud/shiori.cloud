import WebApp from '@twa-dev/sdk'

type InsetBox = {
  top: number
  bottom: number
  left: number
  right: number
}

type WebAppSafeAreaApi = {
  safeAreaInset?: Partial<InsetBox>
  contentSafeAreaInset?: Partial<InsetBox>
  onEvent?: (event: string, cb: () => void) => void
  offEvent?: (event: string, cb: () => void) => void
  isVersionAtLeast?: (version: string) => boolean
}

const px = (n: number | undefined): string => `${Math.max(0, Number(n) || 0)}px`

/**
 * Sync Telegram Bot API 8.0+ safe-area insets onto :root CSS variables.
 * Clients also expose --tg-*-inset-* natively; JS sync covers late updates / older SDK typings.
 */
export const syncTelegramSafeAreaCss = (): void => {
  if (typeof document === 'undefined') return

  const wa = WebApp as unknown as WebAppSafeAreaApi
  const root = document.documentElement
  const safe = wa.safeAreaInset
  const content = wa.contentSafeAreaInset

  if (safe) {
    root.style.setProperty('--tg-safe-area-inset-top', px(safe.top))
    root.style.setProperty('--tg-safe-area-inset-bottom', px(safe.bottom))
    root.style.setProperty('--tg-safe-area-inset-left', px(safe.left))
    root.style.setProperty('--tg-safe-area-inset-right', px(safe.right))
  }

  if (content) {
    root.style.setProperty('--tg-content-safe-area-inset-top', px(content.top))
    root.style.setProperty('--tg-content-safe-area-inset-bottom', px(content.bottom))
    root.style.setProperty('--tg-content-safe-area-inset-left', px(content.left))
    root.style.setProperty('--tg-content-safe-area-inset-right', px(content.right))
  }
}

export const subscribeTelegramSafeArea = (onChange: () => void): (() => void) => {
  const wa = WebApp as unknown as WebAppSafeAreaApi
  if (typeof wa.onEvent !== 'function') return () => undefined

  wa.onEvent('safeAreaChanged', onChange)
  wa.onEvent('contentSafeAreaChanged', onChange)
  wa.onEvent('fullscreenChanged', onChange)

  return () => {
    wa.offEvent?.('safeAreaChanged', onChange)
    wa.offEvent?.('contentSafeAreaChanged', onChange)
    wa.offEvent?.('fullscreenChanged', onChange)
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
