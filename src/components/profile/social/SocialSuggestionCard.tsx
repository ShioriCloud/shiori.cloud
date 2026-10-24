import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useSocialFollowMutation } from '@/hooks/useSocialProfile'
import { hapticSelection } from '@/lib/telegramHaptics'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'
import type { SocialProfileFollowSuggestionItem } from '@/services/socialProfile'
import { SocialUserAvatar } from './SocialUserAvatar'
import { SOCIAL_SURFACE_CLASS } from './socialUi'

type SocialSuggestionCardProps = {
  user: SocialProfileFollowSuggestionItem
  onFollowed?: () => void
}

export const SocialSuggestionCard = ({ user, onFollowed }: SocialSuggestionCardProps) => {
  const { follow, isPending } = useSocialFollowMutation(user.telegram_user_id)

  return (
    <div
      className={cn(
        SOCIAL_SURFACE_CLASS,
        'flex w-[9.5rem] shrink-0 flex-col items-center px-3 pb-3 pt-4 text-center'
      )}
    >
      <Link
        to={`/u/${encodeURIComponent(user.telegram_user_id)}`}
        className="flex w-full flex-col items-center active:opacity-90"
      >
        <SocialUserAvatar
          photoUrl={user.photo_url}
          displayName={user.display_name}
          size="lg"
          className="ring-primary-400/20"
        />
        <p className="mt-2.5 line-clamp-2 w-full text-sm font-semibold leading-snug text-foreground">
          {user.display_name}
        </p>
        {user.mutual_connections > 0 ? (
          <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-muted-foreground">
            {toPersianDigits(user.mutual_connections)} نفر از دنبال‌شده‌هایت
          </p>
        ) : (
          <p className="mt-1 text-[10px] text-muted-foreground">پیشنهاد برای تو</p>
        )}
      </Link>
      <Button
        type="button"
        size="sm"
        className="mt-3 h-9 w-full text-xs font-semibold"
        disabled={isPending}
        onClick={() => {
          hapticSelection()
          void follow.mutateAsync().then(() => onFollowed?.())
        }}
      >
        دنبال کردن
      </Button>
    </div>
  )
}
