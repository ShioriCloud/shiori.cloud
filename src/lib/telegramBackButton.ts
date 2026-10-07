import WebApp from '@twa-dev/sdk'

type TelegramBackButton = {
  isVisible: boolean
  show: () => TelegramBackButton
  hide: () => TelegramBackButton
  onClick: (cb: () => void) => TelegramBackButton
  offClick: (cb: () => void) => TelegramBackButton
}

/** Telegram WebApp.BackButton — Bot API 6.1+ */
export const getTelegramBackButton = (): TelegramBackButton | null => {
  const bb = (WebApp as unknown as { BackButton?: TelegramBackButton }).BackButton
  return bb ?? null
}

export const canUseTelegramBackButton = (): boolean => {
  try {
    if (typeof WebApp.isVersionAtLeast === 'function') {
      return WebApp.isVersionAtLeast('6.1')
    }
  } catch {
    // ignore
  }
  return Boolean(getTelegramBackButton())
}

/** React Router / browser history index when available. */
export const historyCanGoBack = (): boolean => {
  const idx = (window.history.state as { idx?: number } | null)?.idx
  if (typeof idx === 'number') return idx > 0
  return window.history.length > 1
}

const ROOT_TAB_PATHS = new Set(['/', '/schedule', '/explore', '/my-list', '/profile'])

export const shouldShowTelegramBackButton = (pathname: string): boolean => {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (ROOT_TAB_PATHS.has(path)) return false
  return true
}

export const fallbackBackPath = (pathname: string): string => {
  if (pathname.startsWith('/my-list/lists/')) return '/my-list?tab=lists'
  if (pathname.startsWith('/profile/people')) return '/profile?tab=feed'
  if (pathname.startsWith('/notifications')) return '/profile'
  if (pathname.startsWith('/support')) return '/profile'
  if (pathname.startsWith('/subscribe') || pathname.startsWith('/donate')) return '/profile'
  if (pathname.startsWith('/anime/')) return '/'
  if (pathname.startsWith('/studios/')) return '/'
  if (pathname.startsWith('/translators/')) return '/'
  if (pathname.startsWith('/u/')) {
    const parts = pathname.split('/').filter(Boolean)
    if (parts.length >= 2 && parts[0] === 'u') {
      const base = `/u/${parts[1]}`
      if (pathname.includes('/translations') || pathname.endsWith('/followers') || pathname.endsWith('/following')) {
        return base
      }
    }
    return '/profile'
  }
  if (pathname.startsWith('/search') || pathname.startsWith('/explore')) return '/'
  return '/'
}
