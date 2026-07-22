import {
  EXPLORE_FORMATS,
  EXPLORE_SORT_OPTIONS,
  SEARCH_HARDSUB_LANGUAGES,
  type ExploreFormatKey,
  type ExploreSortKey,
  type SearchHardsubLanguageKey,
} from '@/lib/searchFilters'
import { ExploreOptionButton, ExploreSectionTitle } from './ExploreUi'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

type ExploreFilterSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  draftFormat: ExploreFormatKey | null
  draftHardsub: SearchHardsubLanguageKey | null
  onDraftFormat: (v: ExploreFormatKey | null) => void
  onDraftHardsub: (v: SearchHardsubLanguageKey | null) => void
  onApply: () => void
  onReset: () => void
}

export const ExploreFilterSheet = ({
  open,
  onOpenChange,
  draftFormat,
  draftHardsub,
  onDraftFormat,
  onDraftHardsub,
  onApply,
  onReset,
}: ExploreFilterSheetProps) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent
      side="bottom"
      className="max-h-[80vh] rounded-t-2xl overflow-y-auto pb-[env(safe-area-inset-bottom,0px)]"
    >
      <SheetHeader>
        <SheetTitle>فیلتر</SheetTitle>
      </SheetHeader>
      <div className="px-4 py-4 space-y-5">
        <div>
          <ExploreSectionTitle>نوع محتوا</ExploreSectionTitle>
          <div className="grid grid-cols-2 gap-2">
            <ExploreOptionButton active={draftFormat == null} onClick={() => onDraftFormat(null)}>
              همه
            </ExploreOptionButton>
            {EXPLORE_FORMATS.map((f) => (
              <ExploreOptionButton
                key={f.key}
                active={draftFormat === f.key}
                onClick={() => onDraftFormat(f.key)}
              >
                {f.label}
              </ExploreOptionButton>
            ))}
          </div>
        </div>
        <div>
          <ExploreSectionTitle>زبان زیرنویس</ExploreSectionTitle>
          <div className="grid grid-cols-2 gap-2">
            <ExploreOptionButton active={draftHardsub == null} onClick={() => onDraftHardsub(null)}>
              همه
            </ExploreOptionButton>
            {SEARCH_HARDSUB_LANGUAGES.map((h) => (
              <ExploreOptionButton
                key={h.key}
                active={draftHardsub === h.key}
                onClick={() => onDraftHardsub(h.key)}
              >
                {h.label}
              </ExploreOptionButton>
            ))}
          </div>
        </div>
      </div>
      <SheetFooter className="gap-2 flex-row">
        <Button type="button" variant="ghost" className="flex-1" onClick={onReset}>
          پاک کردن
        </Button>
        <Button type="button" className="flex-1" onClick={onApply}>
          اعمال
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
)

type ExploreSortSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  draftSort: ExploreSortKey
  onDraftSort: (v: ExploreSortKey) => void
  onApply: () => void
}

export const ExploreSortSheet = ({
  open,
  onOpenChange,
  draftSort,
  onDraftSort,
  onApply,
}: ExploreSortSheetProps) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent
      side="bottom"
      className="rounded-t-2xl overflow-y-auto pb-[env(safe-area-inset-bottom,0px)]"
    >
      <SheetHeader>
        <SheetTitle>مرتب‌سازی</SheetTitle>
      </SheetHeader>
      <div className="px-4 py-4 grid grid-cols-1 gap-2">
        {EXPLORE_SORT_OPTIONS.map((s) => (
          <ExploreOptionButton
            key={s.key}
            active={draftSort === s.key}
            onClick={() => onDraftSort(s.key)}
          >
            {s.label}
          </ExploreOptionButton>
        ))}
      </div>
      <SheetFooter>
        <Button type="button" className="w-full" onClick={onApply}>
          اعمال
        </Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
)
