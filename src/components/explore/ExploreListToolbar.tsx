import { Filter, ArrowUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const toPersianNumber = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return String(num).replace(/[0-9]/g, (w) => persianDigits[+w])
}

type ExploreListToolbarProps = {
  sortLabel: string
  filterCount?: number
  onFilterClick: () => void
  onSortClick: () => void
  className?: string
}

/** RTL: sort title on the right (start), action buttons on the left (end). */
export const ExploreListToolbar = ({
  sortLabel,
  filterCount = 0,
  onFilterClick,
  onSortClick,
  className,
}: ExploreListToolbarProps) => (
  <div
    className={cn(
      'sticky top-16 z-20 -mx-4 px-4 py-2.5 bg-background/95 backdrop-blur-md border-b border-border/60',
      className
    )}
  >
    <div className="flex items-center justify-between gap-3">
      <p className="text-sm font-semibold text-foreground truncate">{sortLabel}</p>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onFilterClick}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted/70 transition-colors"
          aria-label="فیلتر"
        >
          <Filter className="h-3.5 w-3.5" />
          فیلتر
          {filterCount > 0 ? (
            <span className="rounded-full bg-primary-400/20 text-primary-400 text-[10px] min-w-[1.125rem] px-1 py-0.5 font-semibold leading-none">
              {toPersianNumber(filterCount)}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={onSortClick}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted/70 transition-colors"
          aria-label="مرتب‌سازی"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          مرتب‌سازی
        </button>
      </div>
    </div>
  </div>
)
