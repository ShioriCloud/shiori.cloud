import WebApp from '@twa-dev/sdk'
import { isTelegramMiniApp } from '@/lib/platform'

const isTelegramHostedUrl = (url: string): boolean =>
  /^https?:\/\/(t\.me|telegram\.me)\//i.test(url) || /^tg:\/\//i.test(url)

/**
 * Open a bot / t.me deep link without tearing down the Mini App WebView.
 *
 * Telegram Desktop closes the mini-app when `window.open(t.me/…)` navigates the
 * host WebView. Official `WebApp.openTelegramLink` keeps the Mini App open
 * (Bot API 7.0+). Non-Telegram URLs use `openLink` / `window.open` as fallback.
 */
export function openTelegramDeepLink(url: string): void {
  const href = String(url ?? '').trim()
  if (!href) return

  if (isTelegramMiniApp()) {
    try {
      if (isTelegramHostedUrl(href)) {
        WebApp.openTelegramLink(href)
        return
      }
      WebApp.openLink(href)
      return
    } catch (error) {
      console.warn('openTelegramDeepLink failed:', error)
    }
  }

  window.open(href, '_blank', 'noopener,noreferrer')
}
