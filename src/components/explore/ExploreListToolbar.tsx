import { Filter, ArrowUpDown, Loader2, Search as SearchIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EXPLORE_CHIP_CLASS, EXPLORE_STICKY_SHELL_CLASS } from './ExploreUi'

const toPersianNumber = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return String(num).replace(/[0-9]/g, (w) => persianDigits[+w])
}

type ExploreListToolbarProps = {
  /** Contextual list title (sort label, genre name, season, …). */
  listTitle: string
  filterCount?: number
  onFilterClick: () => void
  onSortClick: () => void
  searchValue: string
  onSearchChange: (value: string) => void
  /** Search debounce / filter refetch in progress */
  busy?: boolean
  className?: string
}

/** RTL: list title on the right (start), action buttons on the left (end). */
export const ExploreListToolbar = ({
  listTitle,
  filterCount = 0,
  onFilterClick,
  onSortClick,
  searchValue,
  onSearchChange,
  busy = false,
  className,
}: ExploreListToolbarProps) => (
  <div className={cn(EXPLORE_STICKY_SHELL_CLASS, className)}>
    <div className="flex h-8 items-center justify-between gap-3">
      <p className="text-sm font-semibold text-foreground truncate">{listTitle}</p>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onFilterClick}
          className={cn(EXPLORE_CHIP_CLASS)}
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
          className={cn(EXPLORE_CHIP_CLASS)}
          aria-label="مرتب‌سازی"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          مرتب‌سازی
        </button>
      </div>
    </div>

    <div className="ui-elevated relative mt-2.5 flex h-10 min-w-0 items-center rounded-xl px-2.5 ps-10 pe-10">
      <SearchIcon className="text-muted-foreground absolute start-3 h-4 w-4" />
      <input
        type="search"
        enterKeyHint="search"
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="نام انیمه را جستجو کن..."
        className="bg-transparent w-full text-sm focus:outline-none"
        aria-label="جستجو"
        aria-busy={busy}
      />
      {busy ? (
        <Loader2
          className="absolute end-3 h-4 w-4 animate-spin text-primary-400"
          aria-hidden
        />
      ) : null}
    </div>
    {busy ? (
      <div
        className="mt-2 h-0.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label="در حال به‌روزرسانی نتایج"
      >
        <div className="explore-fetch-bar h-full w-1/3 rounded-full bg-primary-400" />
      </div>
    ) : (
      <div className="mt-2 h-0.5" aria-hidden />
    )}
  </div>
)
