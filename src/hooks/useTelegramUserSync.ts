import { useEffect, useRef } from 'react'
import { isTelegramMiniApp } from '../lib/platform'
import { useTelegramApp } from './useTelegramApp'
import { registerTelegramUserVisit } from '../services/userDataSource'

/** ثبت ورود کاربر به مینی‌اپ (یک بار در هر session) — فقط داخل Telegram */
export const useTelegramUserSync = (enabled: boolean) => {
  const inTelegram = isTelegramMiniApp()
  const { user, showAlert } = useTelegramApp()
  const syncedRef = useRef<number | null>(null)
  const warnedRef = useRef(false)

  useEffect(() => {
    if (!enabled || !inTelegram || typeof user?.id !== 'number') return
    if (syncedRef.current === user.id) return

    syncedRef.current = user.id
    void registerTelegramUserVisit(user).catch((error) => {
      syncedRef.current = null
      if (import.meta.env.DEV) console.warn('telegram register failed:', error)
      if (warnedRef.current) return
      warnedRef.current = true

      const msg = error instanceof Error ? error.message : String(error)
      if (msg.includes('invalid telegram init data')) {
        showAlert(
          'احراز هویت Telegram ناموفق بود. مینی‌اپ را ببندید و دوباره باز کنید. اگر ادامه داشت، توکن بات API باید همان باتی باشد که مینی‌اپ به آن وصل است.'
        )
      }
    })
  }, [enabled, inTelegram, showAlert, user])
}
