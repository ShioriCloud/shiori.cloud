import { useMemo } from 'react'
import { isTelegramMiniApp } from '../lib/platform'
import { useTelegramApp } from './useTelegramApp'

export type AppAuthUser = {
  id: number
  displayName: string
  username?: string | null
  photoUrl?: string | null
  isPremium?: boolean
}

export const useAppAuth = () => {
  const inTelegram = isTelegramMiniApp()
  const telegram = useTelegramApp()

  const user = useMemo<AppAuthUser | null>(() => {
    if (!inTelegram || !telegram.user) return null

    const parts = [telegram.user.first_name, telegram.user.last_name].filter(Boolean)
    return {
      id: telegram.user.id,
      displayName: parts.join(' ').trim() || 'کاربر',
      username: telegram.user.username ?? null,
      photoUrl: telegram.user.photo_url ?? null,
      isPremium: telegram.user.is_premium,
    }
  }, [inTelegram, telegram.user])

  return {
    user,
    isAuthenticated: Boolean(user),
    isReady: inTelegram ? telegram.isReady : true,
    inTelegram,
    platform: 'telegram' as const,
    showAlert: telegram.showAlert,
    showConfirm: telegram.showConfirm,
    openLink: telegram.openLink,
    shareUrl: telegram.shareUrl,
  }
}
