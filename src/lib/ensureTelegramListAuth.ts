import { isTelegramMiniApp } from './platform'
import { pingTelegramVisit } from './pingTelegramVisit'

/** Ensures a server session exists before protected list API calls (Telegram mini-app). */
export const ensureTelegramListAuth = async (): Promise<void> => {
  if (!isTelegramMiniApp()) return
  await pingTelegramVisit()
}
