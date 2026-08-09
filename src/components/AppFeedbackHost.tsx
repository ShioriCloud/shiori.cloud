import { useAppFeedbackStore } from '@/store/appFeedbackStore'
import { Toaster } from '@/components/ui/sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { SHIORI_PRIMARY_BUTTON_CLASS } from '@/components/explore/ExploreUi'
import { cn } from '@/lib/utils'
import { hapticImpact, hapticNotification, hapticSelection } from '@/lib/telegramHaptics'

/** Hosts Sonner toasts + in-app confirm dialogs. */
export const AppFeedbackHost = () => {
  const confirm = useAppFeedbackStore((s) => s.confirm)
  const clearConfirm = useAppFeedbackStore((s) => s.clearConfirm)

  const finishConfirm = (value: boolean) => {
    if (!confirm) return
    confirm.resolve(value)
    clearConfirm()
  }

  return (
    <>
      <Toaster />

      <Dialog
        open={Boolean(confirm)}
        onOpenChange={(open) => {
          if (!open) finishConfirm(false)
        }}
      >
        <DialogContent
          hideClose
          overlayClassName="z-[130]"
          className="z-[130] max-w-[min(22rem,calc(100vw-2rem))] gap-5 p-5"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {confirm ? (
            <>
              <DialogHeader className="gap-2">
                <DialogTitle>{confirm.title}</DialogTitle>
                <DialogDescription className="leading-7 text-muted-foreground">
                  {confirm.message}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex-row gap-2 sm:justify-stretch">
                <Button
                  type="button"
                  className={cn(
                    'h-11 flex-1 font-semibold',
                    confirm.destructive
                      ? 'bg-red-500 text-white hover:bg-red-500/90'
                      : SHIORI_PRIMARY_BUTTON_CLASS
                  )}
                  onClick={() => {
                    if (confirm.destructive) hapticImpact('medium')
                    else hapticNotification('success')
                    finishConfirm(true)
                  }}
                >
                  {confirm.confirmLabel}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 flex-1"
                  onClick={() => {
                    hapticSelection()
                    finishConfirm(false)
                  }}
                >
                  {confirm.cancelLabel}
                </Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}
