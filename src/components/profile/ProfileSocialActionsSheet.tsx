import { useNavigate } from 'react-router-dom'
import { Ban, VolumeX, Volume2 } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useAppAuth } from '@/hooks/useAppAuth'
import { useSocialModerationMutations } from '@/hooks/useSocialProfile'
import { hapticSelection } from '@/lib/telegramHaptics'

type ProfileSocialActionsSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetTelegramUserId: string
  displayName: string
  isMuted?: boolean
  blockedByYou?: boolean
}

export const ProfileSocialActionsSheet = ({
  open,
  onOpenChange,
  targetTelegramUserId,
  displayName,
  isMuted = false,
  blockedByYou = false,
}: ProfileSocialActionsSheetProps) => {
  const navigate = useNavigate()
  const { showConfirm, showAlert } = useAppAuth()
  const { block, unblock, mute, unmute, isPending } =
    useSocialModerationMutations(targetTelegramUserId)

  const onBlock = async () => {
    hapticSelection()
    const ok = await showConfirm({
      title: 'مسدود کردن کاربر؟',
      message: `«${displayName}» دیگر در جست‌وجو، فید و نظرات دیده نمی‌شود و نمی‌تواند پروفایلت را ببیند.`,
      confirmLabel: 'مسدود کردن',
      cancelLabel: 'انصراف',
    })
    if (!ok) return
    try {
      await block.mutateAsync()
      onOpenChange(false)
      showAlert('کاربر مسدود شد')
      navigate('/profile', { replace: true })
    } catch {
      showAlert('مسدود کردن ناموفق بود')
    }
  }

  const onUnblock = async () => {
    hapticSelection()
    try {
      await unblock.mutateAsync()
      onOpenChange(false)
      showAlert('مسدودیت برداشته شد')
    } catch {
      showAlert('عملیات ناموفق بود')
    }
  }

  const onToggleMute = async () => {
    hapticSelection()
    try {
      if (isMuted) await unmute.mutateAsync()
      else await mute.mutateAsync()
      onOpenChange(false)
      showAlert(isMuted ? 'بی‌صدا برداشته شد' : 'فعالیت این کاربر در فید مخفی می‌شود')
    } catch {
      showAlert('عملیات ناموفق بود')
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl border-t border-border bg-background p-0 pb-[var(--app-tg-bottom-inset)]"
      >
        <SheetHeader className="border-b border-border/50 px-4 py-3 text-right">
          <SheetTitle className="text-base">گزینه‌های کاربر</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-2 px-4 py-4">
          <Button
            type="button"
            variant="secondary"
            className="h-11 w-full justify-start gap-2"
            disabled={isPending}
            onClick={() => void onToggleMute()}
          >
            {isMuted ? (
              <Volume2 className="h-4 w-4" aria-hidden />
            ) : (
              <VolumeX className="h-4 w-4" aria-hidden />
            )}
            {isMuted ? 'برداشتن بی‌صدا از فید' : 'بی‌صدا کردن در فید'}
          </Button>
          {blockedByYou ? (
            <Button
              type="button"
              variant="outline"
              className="h-11 w-full justify-start gap-2"
              disabled={isPending}
              onClick={() => void onUnblock()}
            >
              <Ban className="h-4 w-4" aria-hidden />
              برداشتن مسدودیت
            </Button>
          ) : (
            <Button
              type="button"
              variant="destructive"
              className="h-11 w-full justify-start gap-2"
              disabled={isPending}
              onClick={() => void onBlock()}
            >
              <Ban className="h-4 w-4" aria-hidden />
              مسدود کردن کاربر
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
