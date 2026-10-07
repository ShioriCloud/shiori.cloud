import { Share08Icon } from 'hugeicons-react'
import { buildUserProfileMiniAppLink } from '@/utils/externalLinks'
import { useTelegramApp } from '@/hooks/useTelegramApp'
import { hapticSelection } from '@/lib/telegramHaptics'
import { cn } from '@/lib/utils'

type ProfileShareButtonProps = {
  telegramUserId: string
  displayName: string
  className?: string
}

export const ProfileShareButton = ({
  telegramUserId,
  displayName,
  className,
}: ProfileShareButtonProps) => {
  const { shareUrl, showAlert } = useTelegramApp()

  const onShare = () => {
    hapticSelection()
    const link = buildUserProfileMiniAppLink(telegramUserId)
    const text = `پروفایل ${displayName.trim() || 'کاربر'} در شیوری`
    try {
      shareUrl(link, text)
    } catch {
      void showAlert('اشتراک‌گذاری در این محیط در دسترس نیست.')
    }
  }

  return (
    <button
      type="button"
      onClick={onShare}
      className={cn(
        'flex h-10 w-10 items-center justify-center rounded-xl',
        'border border-border/50 bg-background/70 text-muted-foreground backdrop-blur-sm',
        'active:scale-95 transition-transform',
        className
      )}
      aria-label="اشتراک‌گذاری پروفایل"
    >
      <Share08Icon className="h-5 w-5" />
    </button>
  )
}
