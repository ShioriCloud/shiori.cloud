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
import { Cancel01Icon, CheckmarkCircle02Icon, Alert02Icon } from 'hugeicons-react'

const toneShell = {
  default: 'border-zinc-700/80 bg-zinc-900 text-zinc-50',
  success: 'border-emerald-500/45 bg-zinc-900 text-zinc-50',
  error: 'border-red-500/50 bg-zinc-900 text-zinc-50',
} as const

const toneIcon = {
  default: 'text-primary-300',
  success: 'text-emerald-400',
  error: 'text-red-400',
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
          top: 'calc(var(--app-tg-top-inset) + 0.65rem)',
        }}
        aria-live="polite"
        aria-relevant="additions"
      >
        {toasts.map((toast) => {
          const Icon =
            toast.tone === 'success'
              ? CheckmarkCircle02Icon
              : toast.tone === 'error'
                ? Alert02Icon
                : CheckmarkCircle02Icon
          return (
            <button
              key={toast.id}
              type="button"
              className={cn(
                'app-toast-enter pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-2xl border px-3.5 py-3 text-start',
                'shadow-[0_12px_40px_-12px_rgba(0,0,0,0.65)]',
                toneShell[toast.tone]
              )}
              onClick={() => dismissToast(toast.id)}
            >
              <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', toneIcon[toast.tone])} aria-hidden />
              <span className="min-w-0 flex-1 text-sm font-medium leading-6">{toast.message}</span>
              <Cancel01Icon className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
            </button>
          )
        })}
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
