import { EXPLORE_SORT_OPTIONS, type ExploreSortKey } from '@/lib/searchFilters'
import { ExploreOptionButton, SHIORI_PRIMARY_BUTTON_CLASS } from './ExploreUi'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

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
      className="rounded-t-2xl border-t border-border bg-background p-0 shadow-[0_-8px_30px_oklch(0.4_0_0/0.12)] dark:shadow-[0_-8px_30px_oklch(0_0_0/0.45)] pb-[var(--app-tg-bottom-inset)]"
    >
      <SheetHeader className="border-b border-border/50 px-4 py-3">
        <SheetTitle className="text-base">مرتب‌سازی</SheetTitle>
      </SheetHeader>
      <div className="grid grid-cols-1 gap-2 px-4 py-4">
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
