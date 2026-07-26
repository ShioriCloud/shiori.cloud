import { useEffect } from 'react'
import { isTelegramMiniApp } from '@/lib/platform'
import {
  canUseTelegramSafeArea,
  subscribeTelegramSafeArea,
  syncTelegramSafeAreaCss,
} from '@/lib/telegramSafeArea'

/** Keep CSS safe-area variables in sync with Telegram fullscreen chrome. */
export const useTelegramSafeArea = () => {
  useEffect(() => {
    if (!isTelegramMiniApp()) return

    syncTelegramSafeAreaCss()
    if (!canUseTelegramSafeArea()) return

    const onChange = () => syncTelegramSafeAreaCss()
    // Re-read shortly after launch — insets often arrive after first paint.
    const t1 = window.setTimeout(onChange, 50)
    const t2 = window.setTimeout(onChange, 300)
    const unsubscribe = subscribeTelegramSafeArea(onChange)

    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      unsubscribe()
    }
  }, [])
}
