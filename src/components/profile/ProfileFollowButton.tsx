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
import { hapticSelection } from '@/lib/telegramHaptics'
import { cn } from '@/lib/utils'

const storageKey = (viewerId: number | string, targetId: number | string) =>
  `shiori-follow:${viewerId}:${targetId}`

type ProfileFollowButtonProps = {
  viewerId: number | string | null | undefined
  targetId: number | string | null | undefined
  className?: string
}

/** Local follow UX until server-side follows ship. */
export const ProfileFollowButton = ({
  viewerId,
  targetId,
  className,
}: ProfileFollowButtonProps) => {
  const [following, setFollowing] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    if (viewerId == null || targetId == null) {
      setFollowing(false)
      return
    }
    try {
      setFollowing(localStorage.getItem(storageKey(viewerId, targetId)) === '1')
    } catch {
      setFollowing(false)
    }
  }, [viewerId, targetId])

  const persist = (next: boolean) => {
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
    if (!following) {
      persist(true)
      return
    }
    setConfirmOpen(true)
  }

  const onUnfollow = () => {
    hapticSelection()
    persist(false)
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
        onClick={onPrimaryClick}
        className={cn(
          'mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors',
          following
            ? 'border border-border/70 bg-card text-foreground hover:bg-muted/50'
            : cn('border border-transparent text-white', SHIORI_PRIMARY_BUTTON_CLASS),
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
