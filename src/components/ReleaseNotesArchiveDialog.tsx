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
import { hapticSelection } from '@/lib/telegramHaptics'
import { toPersianDigits } from '@/lib/persianDigits'
import { getAppVersion, getReleaseNotesArchive } from '@/data/releaseNotes'

type ReleaseNotesArchiveDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ReleaseNotesArchiveDialog = ({
  open,
  onOpenChange,
}: ReleaseNotesArchiveDialogProps) => {
  const currentVersion = getAppVersion()
  const archive = getReleaseNotesArchive(currentVersion)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[min(22rem,calc(100vw-2rem))] gap-4 p-5"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="gap-2 text-right">
          <div className="mb-1 flex items-center justify-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Sparkles className="h-5 w-5" />
            </span>
          </div>
          <DialogTitle className="text-center text-base">چی جدید شده؟</DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground">
            نسخه فعلی {toPersianDigits(currentVersion)}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[min(55vh,20rem)] space-y-4 overflow-y-auto text-right">
          {archive.length === 0 ? (
            <p className="text-sm text-muted-foreground">هنوز یادداشتی ثبت نشده.</p>
          ) : (
            archive.map((release) => (
              <div key={release.version} className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  {release.title
                    ? `${release.title} · ${toPersianDigits(release.version)}`
                    : `نسخه ${toPersianDigits(release.version)}`}
                </p>
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
            ))
          )}
        </div>

        <DialogFooter className="sm:justify-stretch">
          <Button
            type="button"
            className={cn('h-11 w-full font-semibold', SHIORI_PRIMARY_BUTTON_CLASS)}
            onClick={() => {
              hapticSelection()
              onOpenChange(false)
            }}
          >
            بستن
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
