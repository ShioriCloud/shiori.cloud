import WebApp from '@twa-dev/sdk'
import { isTelegramMiniApp } from '@/lib/platform'

let readyCalled = false

/**
 * Hide Telegram's native Mini App splash as early as possible.
 * Safe to call more than once; also invoked from index.html before the bundle loads.
 */
export function ensureTelegramWebAppReady(): void {
  if (readyCalled || !isTelegramMiniApp()) return
  try {
    WebApp.ready()
    readyCalled = true
  } catch {
    // Unsupported / outside Telegram client
  }
}
