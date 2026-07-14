import { readStoredAppSession } from './appSessionStorage'
import { hasTelegramSignedInitData, isTelegramMiniApp } from './platform'
import { readTelegramMiniAppSession } from './telegramSessionStorage'

/** True when list sync requests can include valid auth headers. */
export const canSyncUserAnimeList = (): boolean => {
  if (isTelegramMiniApp()) {
    return hasTelegramSignedInitData() || Boolean(readTelegramMiniAppSession()?.token?.trim())
  }
  return Boolean(readStoredAppSession()?.token?.trim())
}

export const assertUserAnimeListAuth = (): void => {
  if (canSyncUserAnimeList()) return

  if (isTelegramMiniApp()) {
    throw new Error(
      'Telegram initData یافت نشد — مینی‌اپ را از داخل Telegram ببندید و دوباره باز کنید.'
    )
  }

  throw new Error('برای ذخیره لیست، ابتدا وارد حساب کاربری شوید.')
}
