import { useEffect, useState } from 'react'
import { UserMinus, UserPlus } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { SHIORI_PRIMARY_BUTTON_CLASS } from '@/components/explore/ExploreUi'
import { useSocialFollowMutation } from '@/hooks/useSocialProfile'
import { hapticSelection } from '@/lib/telegramHaptics'
import { cn } from '@/lib/utils'

const storageKey = (viewerId: number | string, targetId: number | string) =>
  `shiori-follow:${viewerId}:${targetId}`

type ProfileFollowButtonProps = {
  viewerId: number | string | null | undefined
  targetId: number | string | null | undefined
  className?: string
  /** When true, sync follow state with API (social rollout). */
  apiEnabled?: boolean
  isFollowing?: boolean
}

export const ProfileFollowButton = ({
  viewerId,
  targetId,
  className,
  apiEnabled = false,
  isFollowing: isFollowingProp = false,
}: ProfileFollowButtonProps) => {
  const [following, setFollowing] = useState(isFollowingProp)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { follow, unfollow, isPending } = useSocialFollowMutation(
    apiEnabled ? String(targetId ?? '') : undefined
  )

  useEffect(() => {
    if (apiEnabled) {
      setFollowing(isFollowingProp)
      return
    }
    if (viewerId == null || targetId == null) {
      setFollowing(false)
      return
    }
    try {
      setFollowing(localStorage.getItem(storageKey(viewerId, targetId)) === '1')
    } catch {
      setFollowing(false)
    }
  }, [apiEnabled, isFollowingProp, viewerId, targetId])

  const persistLocal = (next: boolean) => {
    if (viewerId == null || targetId == null) return
    try {
      const key = storageKey(viewerId, targetId)
      if (next) localStorage.setItem(key, '1')
      else localStorage.removeItem(key)
    } catch {
      /* ignore */
    }
    setFollowing(next)
  }

  const onPrimaryClick = () => {
    hapticSelection()
    if (targetId == null) return

    if (apiEnabled) {
      if (!following) {
        void follow.mutateAsync().then(() => setFollowing(true))
      } else {
        setConfirmOpen(true)
      }
      return
    }

    if (!following) {
      persistLocal(true)
      return
    }
    setConfirmOpen(true)
  }

  const onUnfollow = () => {
    hapticSelection()
    if (apiEnabled && targetId != null) {
      void unfollow.mutateAsync().then(() => {
        setFollowing(false)
        setConfirmOpen(false)
      })
      return
    }
    persistLocal(false)
    setConfirmOpen(false)
  }

  if (
    viewerId != null &&
    targetId != null &&
    String(viewerId) === String(targetId)
  ) {
    return null
  }

  return (
    <>
      <button
        type="button"
        disabled={apiEnabled && isPending}
        onClick={onPrimaryClick}
        className={cn(
          'mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors',
          following
            ? 'border border-border/70 bg-card text-foreground hover:bg-muted/50'
            : cn('border border-transparent text-white', SHIORI_PRIMARY_BUTTON_CLASS),
          (apiEnabled && isPending) && 'opacity-70',
          className
        )}
      >
        {following ? (
          <>
            <UserMinus className="h-4 w-4 opacity-80" aria-hidden />
            دنبال می‌کنی
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4 opacity-90" aria-hidden />
            دنبال کردن
          </>
        )}
      </button>

      <Sheet open={confirmOpen} onOpenChange={setConfirmOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl border-border/60 px-0 pb-[max(1rem,env(safe-area-inset-bottom))]"
        >
          <SheetHeader className="space-y-1 border-b border-border/50 px-4 py-3 text-right">
            <SheetTitle className="text-base">لغو دنبال کردن؟</SheetTitle>
            <SheetDescription className="text-xs leading-relaxed">
              دیگر به‌روزرسانی‌های این کاربر در فیدت دیده نمی‌شود.
            </SheetDescription>
          </SheetHeader>
          <SheetFooter className="mt-0 flex-col gap-2 px-4 py-4 sm:flex-col">
            <Button
              type="button"
              variant="destructive"
              className="h-11 w-full font-semibold"
              onClick={onUnfollow}
              disabled={apiEnabled && isPending}
            >
              آنفالو کردن
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="h-11 w-full font-semibold"
              onClick={() => setConfirmOpen(false)}
            >
              انصراف
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
