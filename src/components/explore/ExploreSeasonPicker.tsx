import { ChevronDown } from 'lucide-react'
import {
  buildSearchYearOptions,
  SEARCH_SEASONS,
  type SearchSeasonKey,
} from '@/lib/searchFilters'
import { cn } from '@/lib/utils'
import { ExploreOptionButton, ExploreSectionTitle } from './ExploreUi'
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

/** Section header: tappable title + chevron (right), result count (left). */
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
    <div
      className={cn(
        'sticky top-16 z-20 flex items-center justify-between gap-3 px-4 py-3',
        'bg-background/95 backdrop-blur-md border-b border-border/60',
        className
      )}
    >
      <button
        type="button"
        onClick={onOpenPicker}
        className={cn(
          'flex min-w-0 flex-1 items-center gap-1 self-stretch -my-3 py-3 pe-3 ps-0',
          'text-start transition-colors active:bg-muted/40 rounded-none'
        )}
        aria-haspopup="dialog"
        aria-label={`انتخاب فصل، ${seasonLabel} ${year}`}
      >
        <h2 className="text-base font-semibold text-foreground truncate">
          {seasonLabel} {toPersianNumber(year)}
        </h2>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
      </button>
      {countLabel != null ? (
        <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{countLabel}</span>
      ) : null}
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
        className="max-h-[75vh] rounded-t-2xl overflow-y-auto pb-[env(safe-area-inset-bottom,0px)]"
      >
        <SheetHeader>
          <SheetTitle>انتخاب فصل</SheetTitle>
        </SheetHeader>
        <div className="px-4 py-4 space-y-5">
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
        <SheetFooter>
          <Button type="button" className="w-full" onClick={onApply}>
            اعمال
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
