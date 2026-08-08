import { useCallback, useEffect, useMemo } from 'react'
import WebApp from '@twa-dev/sdk'
import { isTelegramMiniApp } from '../lib/platform'
import { useThemeStore, type ThemePreference } from '../store/themeStore'

const resolveAutoIsDark = (): boolean => {
  if (typeof window === 'undefined') return true
  if (isTelegramMiniApp()) {
    const scheme = String(
      (WebApp as unknown as { colorScheme?: string }).colorScheme ?? ''
    ).toLowerCase()
    if (scheme === 'light') return false
    if (scheme === 'dark') return true
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

type ThemeEventsApi = {
  onEvent?: (event: string, cb: () => void) => void
  offEvent?: (event: string, cb: () => void) => void
}

export const useTheme = () => {
  const preference = useThemeStore((s) => s.preference)
  const setPreference = useThemeStore((s) => s.setPreference)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)

  const isDarkMode = useMemo(() => {
    if (preference === 'dark') return true
    if (preference === 'light') return false
    return resolveAutoIsDark()
  }, [preference])

  const applyTheme = useCallback(() => {
    const root = document.documentElement
    if (isDarkMode) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    root.style.colorScheme = isDarkMode ? 'dark' : 'light'

    if (isTelegramMiniApp()) {
      try {
        const wa = WebApp as unknown as {
          setBackgroundColor?: (color: string) => void
          setHeaderColor?: (color: string) => void
        }
        const bg = isDarkMode ? '#161616' : '#ffffff'
        wa.setBackgroundColor?.(bg)
        wa.setHeaderColor?.(bg)
      } catch {
        // Unsupported client
      }
    }
  }, [isDarkMode])

  useEffect(() => {
    applyTheme()
  }, [applyTheme])

  useEffect(() => {
    if (preference !== 'auto') return

    if (isTelegramMiniApp()) {
      const wa = WebApp as unknown as ThemeEventsApi
      const onThemeChanged = () => applyTheme()
      try {
        wa.onEvent?.('themeChanged', onThemeChanged)
        return () => {
          wa.offEvent?.('themeChanged', onThemeChanged)
        }
      } catch {
        return undefined
      }
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [preference, applyTheme])

  return {
    preference,
    setPreference: (next: ThemePreference) => setPreference(next),
    isDarkMode,
    toggleTheme,
    applyTheme,
  }
}

export const getSystemTheme = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const watchSystemTheme = (callback: (theme: 'dark' | 'light') => void) => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const handleChange = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light')
  }

  mediaQuery.addEventListener('change', handleChange)

  return () => {
    mediaQuery.removeEventListener('change', handleChange)
  }
}
