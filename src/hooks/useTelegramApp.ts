import { useEffect, useState } from 'react'
import WebApp from '@twa-dev/sdk'
import { buildTelegramUserPayload } from '@/utils/telegramUser'
import type { TelegramUserPayload } from '@/types/telegramUser'
import { isTelegramMiniApp } from '@/lib/platform'
import { ensureTelegramWebAppReady } from '@/lib/telegramReady'
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
    if (!isTelegramMiniApp()) {
      setIsReady(true)
      setUser(null)
      return
    }

    try {
      // ready() already fired from index.html / main.tsx; ensure + read user sync.
      ensureTelegramWebAppReady()
      setUser(buildTelegramUserPayload(WebApp.initDataUnsafe.user, WebApp.initData))
      setIsReady(true)
    } catch (error) {
      console.error('Failed to initialize Telegram Web App:', error)
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

  const shareUrl = (url: string, text?: string) => {
    const shareLink = new URL('https://t.me/share/url')
    shareLink.searchParams.set('url', url)
    if (text?.trim()) shareLink.searchParams.set('text', text.trim())
    WebApp.openTelegramLink(shareLink.toString())
  }

  return {
    user,
    isReady,
    showAlert,
    showConfirm,
    showPopup,
    openLink,
    shareUrl,
  }
}
