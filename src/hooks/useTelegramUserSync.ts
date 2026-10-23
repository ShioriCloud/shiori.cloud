import { useEffect } from 'react'
import WebApp from '@twa-dev/sdk'
import { isTelegramMiniApp } from '../lib/platform'
import { pingTelegramVisit } from '../lib/pingTelegramVisit'
import { useTelegramApp } from './useTelegramApp'

const VISIT_HEARTBEAT_MS = 3 * 60 * 1000

/** ثبت بازدید مینی‌اپ: هنگام بارگذاری، برگشت به تب، و هر چند دقیقه تا وقتی باز است. */
export const useTelegramUserSync = (enabled: boolean) => {
  const inTelegram = isTelegramMiniApp()
  const { user } = useTelegramApp()

  useEffect(() => {
    if (!enabled || !inTelegram) return

    const ping = () => {
      void pingTelegramVisit()
    }

    ping()

    const onVisibility = () => {
      if (document.visibilityState === 'visible') ping()
    }
    const onPageShow = () => ping()
    const onFocus = () => ping()
    const onActivated = () => ping()

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pageshow', onPageShow)
    window.addEventListener('focus', onFocus)

    const webApp = WebApp as typeof WebApp & {
      onEvent?: (event: string, callback: () => void) => void
      offEvent?: (event: string, callback: () => void) => void
    }
    try {
      webApp.onEvent?.('activated', onActivated)
    } catch {
      // older Telegram clients
    }

    const heartbeat = window.setInterval(() => {
      if (document.visibilityState === 'visible') ping()
    }, VISIT_HEARTBEAT_MS)

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pageshow', onPageShow)
      window.removeEventListener('focus', onFocus)
      try {
        webApp.offEvent?.('activated', onActivated)
      } catch {
        // ignore
      }
      window.clearInterval(heartbeat)
    }
  }, [enabled, inTelegram, user?.id])
}
