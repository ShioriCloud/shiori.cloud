import { EXPLORE_SORT_OPTIONS, type ExploreSortKey } from '@/lib/searchFilters'
import { ExploreOptionButton } from './ExploreUi'
import { Button } from '@/components/ui/button'
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
