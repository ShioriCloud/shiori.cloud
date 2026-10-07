import { Share08Icon } from 'hugeicons-react'
import { Button } from '@/components/ui/button'
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
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      onClick={onShare}
      className={cn(
        'surface-skeuo border-border/60 text-muted-foreground hover:text-foreground',
        className
      )}
      aria-label="اشتراک‌گذاری پروفایل"
    >
      <Share08Icon className="h-4 w-4" />
    </Button>
  )
}
