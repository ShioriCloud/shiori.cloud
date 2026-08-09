import { ChevronDown } from 'lucide-react'
import {
  buildSearchYearOptions,
  SEARCH_SEASONS,
  type SearchSeasonKey,
} from '@/lib/searchFilters'
import { cn } from '@/lib/utils'
import {
  EXPLORE_CHIP_CLASS,
  EXPLORE_STICKY_SHELL_CLASS,
  ExploreOptionButton,
  ExploreSectionTitle,
  SHIORI_PRIMARY_BUTTON_CLASS,
} from './ExploreUi'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

const toPersianNumber = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return String(num).replace(/[0-9]/g, (w) => persianDigits[+w])
}

type ExploreSeasonPickerProps = {
  season: SearchSeasonKey
  year: number
  open: boolean
  onOpenChange: (open: boolean) => void
  draftSeason: SearchSeasonKey
  draftYear: number
  onDraftSeason: (season: SearchSeasonKey) => void
  onDraftYear: (year: number) => void
  onApply: () => void
}

type ExploreSeasonHeaderProps = {
  season: SearchSeasonKey
  year: number
  resultCount?: number
  isLoadingCount?: boolean
  onOpenPicker: () => void
  className?: string
}

/** Section header: tappable title + chevron (right), result count chip (left). */
export const ExploreSeasonHeader = ({
  season,
  year,
  resultCount,
  isLoadingCount,
  onOpenPicker,
  className,
}: ExploreSeasonHeaderProps) => {
  const seasonLabel = SEARCH_SEASONS.find((s) => s.key === season)?.label ?? season

  const countLabel =
    isLoadingCount && resultCount == null
      ? '…'
      : resultCount != null
        ? `${toPersianNumber(resultCount)} انیمه`
        : null

  return (
    <div className={cn(EXPLORE_STICKY_SHELL_CLASS, className)}>
      <div className="flex h-8 items-center justify-between gap-3">
        <button
          type="button"
          onClick={onOpenPicker}
          className="flex min-w-0 flex-1 items-center gap-1 text-start"
          aria-haspopup="dialog"
          aria-label={`انتخاب فصل، ${seasonLabel} ${year}`}
        >
          <h2 className="text-sm font-semibold text-foreground truncate">
            {seasonLabel} {toPersianNumber(year)}
          </h2>
          <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
        </button>
        {countLabel != null ? (
          <span className={cn(EXPLORE_CHIP_CLASS, 'shrink-0 tabular-nums')}>{countLabel}</span>
        ) : null}
      </div>
    </div>
  )
}

export const ExploreSeasonSheet = ({
  open,
  onOpenChange,
  draftSeason,
  draftYear,
  onDraftSeason,
  onDraftYear,
  onApply,
}: ExploreSeasonPickerProps) => {
  const years = buildSearchYearOptions(6)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[75vh] overflow-y-auto rounded-t-2xl border-t border-border bg-background p-0 shadow-[0_-8px_30px_oklch(0.4_0_0/0.12)] dark:shadow-[0_-8px_30px_oklch(0_0_0/0.45)] pb-[var(--app-tg-bottom-inset)]"
      >
        <SheetHeader className="border-b border-border/50 px-4 py-3">
          <SheetTitle className="text-base">انتخاب فصل</SheetTitle>
        </SheetHeader>
        <div className="space-y-5 px-4 py-4">
          <div>
            <ExploreSectionTitle>سال</ExploreSectionTitle>
            <div className="grid grid-cols-3 gap-2">
              {years.map((y) => (
                <ExploreOptionButton
                  key={y}
                  active={draftYear === y}
                  onClick={() => onDraftYear(y)}
                >
                  {toPersianNumber(y)}
                </ExploreOptionButton>
              ))}
            </div>
          </div>
          <div>
            <ExploreSectionTitle>فصل</ExploreSectionTitle>
            <div className="grid grid-cols-2 gap-2">
              {SEARCH_SEASONS.map((s) => (
                <ExploreOptionButton
                  key={s.key}
                  active={draftSeason === s.key}
                  onClick={() => onDraftSeason(s.key)}
                >
                  {s.label}
                </ExploreOptionButton>
              ))}
            </div>
          </div>
        </div>
        <SheetFooter className="border-t border-border/50 px-4 py-4">
          <Button
            type="button"
            size="lg"
            className={cn('h-12 w-full text-base font-semibold', SHIORI_PRIMARY_BUTTON_CLASS)}
            onClick={onApply}
          >
            اعمال
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
