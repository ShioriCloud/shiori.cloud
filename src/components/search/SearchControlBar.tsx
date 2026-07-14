import { Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  countActiveSearchFilters,
  translateSort,
  type SearchUrlFilters,
} from '@/lib/searchFilters'

type SearchControlBarProps = {
  filters: SearchUrlFilters
  onOpenFilters: () => void
  onQuickCurrentSeason: () => void
  onQuickPopular: () => void
  isCurrentSeasonActive: boolean
  isPopularSort: boolean
}

export const SearchControlBar = ({
  filters,
  onOpenFilters,
  onQuickCurrentSeason,
  onQuickPopular,
  isCurrentSeasonActive,
  isPopularSort,
}: SearchControlBarProps) => {
  const filterCount = countActiveSearchFilters(filters)
  const sortLabel = filters.sortBy !== 'created_at' ? translateSort(filters.sortBy) : null

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="h-11 w-full justify-between rounded-xl px-4"
        onClick={onOpenFilters}
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <Filter className="h-4 w-4 text-muted-foreground" />
          فیلتر و مرتب‌سازی
        </span>
        <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
          {filterCount > 0 ? (
            <span className="bg-primary-500/20 text-primary-200 rounded-md px-2 py-0.5 tabular-nums">
              {filterCount} فیلتر
            </span>
          ) : null}
          {sortLabel ? <span>{sortLabel}</span> : null}
        </span>
      </Button>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onQuickCurrentSeason}
          className={cn(
            'flex-1 rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors',
            isCurrentSeasonActive
              ? 'border-primary-400/50 bg-primary-600/20 text-primary-100'
              : 'border-border/70 bg-card text-muted-foreground hover:bg-muted/50'
          )}
        >
          فصل جاری
        </button>
        <button
          type="button"
          onClick={onQuickPopular}
          className={cn(
            'flex-1 rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors',
            isPopularSort
              ? 'border-primary-400/50 bg-primary-600/20 text-primary-100'
              : 'border-border/70 bg-card text-muted-foreground hover:bg-muted/50'
          )}
        >
          محبوب‌ترین
        </button>
      </div>
    </div>
  )
}
