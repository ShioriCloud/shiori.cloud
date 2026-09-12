import { hasTelegramSignedInitData } from './platform'
import { readTelegramMiniAppSession } from './telegramSessionStorage'

/** True when list sync requests can include valid Telegram/session auth headers. */
export const canSyncUserAnimeList = (): boolean => {
  return hasTelegramSignedInitData() || Boolean(readTelegramMiniAppSession()?.token?.trim())
}

export const assertUserAnimeListAuth = (): void => {
  if (canSyncUserAnimeList()) return

  throw new Error('ورود تلگرام پیدا نشد. مینی‌اپ را از تلگرام باز کنید.')
}
