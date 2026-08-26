import { useEffect, useMemo, useState } from 'react'
import { Sparkles } from 'lucide-react'
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
import { hapticNotification, hapticSelection } from '@/lib/telegramHaptics'
import { toPersianDigits } from '@/lib/persianDigits'
import {
  getAppVersion,
  getUnseenReleaseNotes,
  setLastSeenAppVersion,
  type ReleaseNote,
} from '@/data/releaseNotes'

type ReleaseNotesDialogProps = {
  /** Wait until boot splash is fully gone before opening. */
  enabled?: boolean
}

export const ReleaseNotesDialog = ({ enabled = true }: ReleaseNotesDialogProps) => {
  const currentVersion = useMemo(() => getAppVersion(), [])
  const [notes, setNotes] = useState<ReleaseNote[] | null>(null)

  useEffect(() => {
    if (!enabled) return
    const unseen = getUnseenReleaseNotes(currentVersion)
    if (unseen.length === 0) {
      setLastSeenAppVersion(currentVersion)
      setNotes(null)
      return
    }
    setNotes(unseen)
  }, [enabled, currentVersion])

  const open = Boolean(notes && notes.length > 0)

  const dismiss = () => {
    setLastSeenAppVersion(currentVersion)
    setNotes(null)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          hapticSelection()
          dismiss()
        }
      }}
    >
      <DialogContent
        overlayClassName="z-[125]"
        className="z-[125] max-w-[min(22rem,calc(100vw-2rem))] gap-4 p-5"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {notes ? (
          <>
            <DialogHeader className="gap-2 text-right">
              <div className="mb-1 flex items-center justify-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <Sparkles className="h-5 w-5" />
                </span>
              </div>
              <DialogTitle className="text-center text-base">چی جدید شده؟</DialogTitle>
              <DialogDescription className="text-center text-xs text-muted-foreground">
                نسخه {toPersianDigits(currentVersion)}
              </DialogDescription>
            </DialogHeader>

            <div className="max-h-[min(50vh,18rem)] space-y-4 overflow-y-auto text-right">
              {notes.map((release) => (
                <div key={release.version} className="space-y-2">
                  {notes.length > 1 || release.title ? (
                    <p className="text-sm font-medium text-foreground">
                      {release.title ?? `نسخه ${toPersianDigits(release.version)}`}
                    </p>
                  ) : null}
                  <ul className="space-y-2">
                    {release.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm leading-6 text-muted-foreground"
                      >
                        <span
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70"
                          aria-hidden
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <DialogFooter className="sm:justify-stretch">
              <Button
                type="button"
                className={cn('h-11 w-full font-semibold', SHIORI_PRIMARY_BUTTON_CLASS)}
                onClick={() => {
                  hapticNotification('success')
                  dismiss()
                }}
              >
                باشه، فهمیدم
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
