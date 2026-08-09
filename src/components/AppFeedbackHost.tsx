import { useAppFeedbackStore } from '@/store/appFeedbackStore'
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

const toneClass = {
  default: 'border-border/70 bg-card text-foreground',
  success: 'border-emerald-500/30 bg-card text-foreground',
  error: 'border-red-500/35 bg-card text-foreground',
} as const

const toneAccent = {
  default: 'bg-primary-400',
  success: 'bg-emerald-500',
  error: 'bg-red-500',
} as const

export const AppFeedbackHost = () => {
  const toasts = useAppFeedbackStore((s) => s.toasts)
  const confirm = useAppFeedbackStore((s) => s.confirm)
  const dismissToast = useAppFeedbackStore((s) => s.dismissToast)
  const clearConfirm = useAppFeedbackStore((s) => s.clearConfirm)

  const finishConfirm = (value: boolean) => {
    if (!confirm) return
    confirm.resolve(value)
    clearConfirm()
  }

  return (
    <>
      <div
        className="pointer-events-none fixed inset-x-0 z-[120] flex flex-col items-center gap-2 px-4"
        style={{
          bottom: 'calc(4.75rem + var(--app-tg-bottom-inset))',
        }}
        aria-live="polite"
        aria-relevant="additions"
      >
        {toasts.map((toast) => (
          <button
            key={toast.id}
            type="button"
            className={cn(
              'pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-xl border px-3.5 py-3 text-start shadow-lg',
              'animate-in fade-in-0 slide-in-from-bottom-2 duration-200',
              toneClass[toast.tone]
            )}
            onClick={() => dismissToast(toast.id)}
          >
            <span
              className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', toneAccent[toast.tone])}
              aria-hidden
            />
            <span className="min-w-0 flex-1 text-sm leading-6">{toast.message}</span>
          </button>
        ))}
      </div>

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
