import { useEffect } from 'react'
import { isTelegramMiniApp } from '@/lib/platform'
import {
  ensureTelegramFullscreenLayout,
  subscribeTelegramSafeArea,
  syncTelegramSafeAreaCss,
} from '@/lib/telegramSafeArea'

/** Keep CSS safe-area variables in sync with Telegram chrome / insets. */
export const useTelegramSafeArea = () => {
  useEffect(() => {
    if (!isTelegramMiniApp()) return

    ensureTelegramFullscreenLayout()
    syncTelegramSafeAreaCss()

    const onChange = () => syncTelegramSafeAreaCss()
    // Insets often arrive after first paint / after fullscreen settles.
    const timers = [50, 150, 400, 1000].map((ms) => window.setTimeout(onChange, ms))
    const unsubscribe = subscribeTelegramSafeArea(onChange)

    return () => {
      timers.forEach((id) => window.clearTimeout(id))
      unsubscribe()
    }
  }, [])
}
