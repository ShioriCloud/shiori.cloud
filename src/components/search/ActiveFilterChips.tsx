import { Cancel01Icon } from 'hugeicons-react'
import {
  DEFAULT_SEARCH_FILTERS,
  translateAiringStatus,
  translateFormat,
  translateSeason,
  type SearchUrlFilters,
} from '@/lib/searchFilters'

const toPersianNumber = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return String(num).replace(/[0-9]/g, (w) => persianDigits[+w])
}

type ActiveFilterChipsProps = {
  filters: SearchUrlFilters
  onChange: (next: SearchUrlFilters) => void
}

type ChipItem = {
  key: string
  label: string
  clear: () => SearchUrlFilters
}

export const ActiveFilterChips = ({ filters, onChange }: ActiveFilterChipsProps) => {
  const chips: ChipItem[] = []

  if (filters.genreSlug) {
    chips.push({
      key: 'genre',
      label: filters.genreLabel || filters.genreSlug,
      clear: () => ({ ...filters, genreSlug: null, genreLabel: null }),
    })
  }

  if (filters.season && filters.year != null) {
    chips.push({
      key: 'season-year',
      label: `${translateSeason(filters.season)} ${toPersianNumber(filters.year)}`,
      clear: () => ({ ...filters, season: null, year: null }),
    })
  } else {
    if (filters.season) {
      chips.push({
        key: 'season',
        label: translateSeason(filters.season),
        clear: () => ({ ...filters, season: null }),
      })
    }
    if (filters.year != null) {
      chips.push({
        key: 'year',
        label: toPersianNumber(filters.year),
        clear: () => ({ ...filters, year: null }),
      })
    }
  }

  if (filters.format) {
    chips.push({
      key: 'format',
      label: translateFormat(filters.format),
      clear: () => ({ ...filters, format: null }),
    })
  }

  if (filters.airingStatus) {
    chips.push({
      key: 'status',
      label: translateAiringStatus(filters.airingStatus),
      clear: () => ({ ...filters, airingStatus: null }),
    })
  }

  if (chips.length === 0) return null

  const clearAll = () => {
    onChange({
      ...filters,
      ...DEFAULT_SEARCH_FILTERS,
      query: filters.query,
      sortBy: filters.sortBy,
    })
  }

  return (
    <div className="px-4 pb-2">
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-muted-foreground text-xs">{chips.length} فیلتر فعال</p>
        <button
          type="button"
          onClick={clearAll}
          className="text-primary-300 text-xs font-medium hover:underline"
        >
          پاک کردن همه
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((chip) => (
          <button
            key={chip.key}
            type="button"
            onClick={() => onChange(chip.clear())}
            className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/30 px-3 py-1.5 text-xs text-foreground"
          >
            <span>{chip.label}</span>
            <Cancel01Icon className="h-3 w-3 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  )
}
