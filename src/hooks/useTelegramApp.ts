import { useEffect, useState } from 'react'
import WebApp from '@twa-dev/sdk'
import { buildTelegramUserPayload } from '@/utils/telegramUser'
import type { TelegramUserPayload } from '@/types/telegramUser'
import { isTelegramMiniApp } from '@/lib/platform'
import { ensureTelegramWebAppReady } from '@/lib/telegramReady'
import { openTelegramDeepLink } from '@/lib/telegramOpenLink'
import { showAppConfirm, showAppToast } from '@/store/appFeedbackStore'

interface PopupButton {
  type: 'default' | 'destructive'
  text: string
  id?: string
}

export type AppConfirmInput =
  | string
  | {
      message: string
      title?: string
      confirmLabel?: string
      cancelLabel?: string
      destructive?: boolean
    }

export const useTelegramApp = () => {
  const [user, setUser] = useState<TelegramUserPayload | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    let cancelled = false

    const readUser = (): TelegramUserPayload | null => {
      try {
        ensureTelegramWebAppReady()
        return buildTelegramUserPayload(WebApp.initDataUnsafe.user, WebApp.initData)
      } catch (error) {
        console.error('Failed to initialize Telegram Web App:', error)
        return null
      }
    }

    const apply = (): boolean => {
      if (cancelled) return true
      const next = readUser()
      if (next) {
        setUser(next)
        setIsReady(true)
        return true
      }
      return false
    }

    if (apply()) {
      return () => {
        cancelled = true
      }
    }

    // iOS / proxy: initData can arrive after first paint even when heuristics fail.
    let tries = 0
    const timer = window.setInterval(() => {
      tries += 1
      if (apply() || tries >= 30) {
        window.clearInterval(timer)
        if (!cancelled) {
          if (!isTelegramMiniApp()) setUser(null)
          setIsReady(true)
        }
      }
    }, 100)

    return () => {
      cancelled = true
      window.clearInterval(timer)
    }
  }, [])

  const showAlert = (message: string) => {
    showAppToast(message)
  }

  const showConfirm = (input: AppConfirmInput): Promise<boolean> => {
    if (typeof input === 'string') {
      return showAppConfirm({
        message: input,
        destructive: /حذف|پاک/.test(input),
        confirmLabel: /حذف|پاک/.test(input) ? 'حذف' : 'تأیید',
      })
    }
    return showAppConfirm(input)
  }

  const showPopup = (params: { title?: string; message: string; buttons?: PopupButton[] }) => {
    return new Promise<string>((resolve) => {
      WebApp.showPopup(
        {
          ...params,
          buttons: params.buttons?.map((button) => ({
            ...button,
            type: button.type || 'default',
          })),
        },
        (buttonId) => {
          resolve(buttonId || '')
        }
      )
    })
  }

  const openLink = (url: string) => {
    WebApp.openLink(url)
  }

  /** t.me / tg:// deep links — keeps Mini App open (unlike window.open on Desktop). */
  const openTelegramLink = (url: string) => {
    openTelegramDeepLink(url)
  }

  const shareUrl = (url: string, text?: string) => {
    const shareLink = new URL('https://t.me/share/url')
    shareLink.searchParams.set('url', url)
    if (text?.trim()) shareLink.searchParams.set('text', text.trim())
    openTelegramDeepLink(shareLink.toString())
  }

  return {
    user,
    isReady,
    showAlert,
    showConfirm,
    showPopup,
    openLink,
    openTelegramLink,
    shareUrl,
  }
}
