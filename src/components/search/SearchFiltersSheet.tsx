import { useMemo, useState, type ReactNode } from 'react'
import { Search01Icon } from 'hugeicons-react'
import { Check, ChevronDown } from 'lucide-react'
import type { GenreAdminItem } from '@/services/catalogSource'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import {
  SEARCH_AIRING_STATUSES,
  SEARCH_FORMATS,
  SEARCH_SEASONS,
  SEARCH_SORT_OPTIONS,
  buildSearchYearOptions,
  getCurrentSeasonKey,
  getCurrentSeasonYear,
  type SearchUrlFilters,
} from '@/lib/searchFilters'

type SearchFiltersSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  draft: SearchUrlFilters
  onDraftChange: (next: SearchUrlFilters) => void
  onApply: () => void
  onReset: () => void
  genres: GenreAdminItem[]
  genresLoading?: boolean
}

const genreLabel = (g: GenreAdminItem) => g.name_fa || g.name_en || g.slug

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h3 className="text-foreground mb-2 text-sm font-semibold">{children}</h3>
)

const OptionGrid = ({
  children,
  cols = 2,
}: {
  children: ReactNode
  cols?: 2 | 4
}) => (
  <div className={cn('grid gap-2', cols === 4 ? 'grid-cols-4' : 'grid-cols-2')}>
    {children}
  </div>
)

const OptionButton = ({
  active,
  children,
  onClick,
  className,
}: {
  active?: boolean
  children: ReactNode
  onClick: () => void
  className?: string
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'min-h-10 rounded-xl border px-3 py-2 text-sm font-medium transition-colors',
      active
        ? 'border-primary-400/50 bg-primary-600/20 text-primary-100'
        : 'border-border/70 bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground',
      className
    )}
  >
    {children}
  </button>
)

const GenreMultiSelect = ({
  genres,
  genresLoading,
  selectedSlugs,
  onChange,
}: {
  genres: GenreAdminItem[]
  genresLoading?: boolean
  selectedSlugs: string[]
  onChange: (slugs: string[]) => void
}) => {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const filteredGenres = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return genres
    return genres.filter((g) => {
      const label = genreLabel(g).toLowerCase()
      return label.includes(q) || g.slug.includes(q)
    })
  }, [genres, query])

  const summary =
    selectedSlugs.length === 0
      ? 'همه ژانرها'
      : selectedSlugs.length === 1
        ? (() => {
            const match = genres.find((g) => g.slug === selectedSlugs[0])
            return match ? genreLabel(match) : selectedSlugs[0]
          })()
        : `${selectedSlugs.length} ژانر`

  const toggleSlug = (slug: string) => {
    if (selectedSlugs.includes(slug)) {
      onChange(selectedSlugs.filter((s) => s !== slug))
      return
    }
    onChange([...selectedSlugs, slug])
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
        >
          <span className={cn(!selectedSlugs.length && 'text-muted-foreground')}>{summary}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-70" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
        sideOffset={4}
      >
        <div className="border-b border-border/60 p-2">
          <div className="relative">
            <Search01Icon className="text-muted-foreground pointer-events-none absolute end-2.5 top-1/2 h-4 w-4 -translate-y-1/2" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="جستجو در ژانرها..."
              className="h-9 pe-8 text-sm"
            />
          </div>
        </div>
        <div className="max-h-52 overflow-y-auto p-1">
          {genresLoading ? (
            <p className="text-muted-foreground py-6 text-center text-sm">در حال بارگذاری...</p>
          ) : filteredGenres.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">ژانری پیدا نشد</p>
          ) : (
            filteredGenres.map((genre) => {
              const active = selectedSlugs.includes(genre.slug)
              return (
                <button
                  key={genre.slug}
                  type="button"
                  onClick={() => toggleSlug(genre.slug)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-2.5 py-2 text-sm transition-colors',
                    active ? 'bg-primary-600/15 text-primary-100' : 'hover:bg-muted/50'
                  )}
                >
                  <span>{genreLabel(genre)}</span>
                  {active ? <Check className="h-4 w-4 shrink-0" /> : null}
                </button>
              )
            })
          )}
        </div>
        {selectedSlugs.length > 0 ? (
          <div className="border-t border-border/60 p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => onChange([])}
            >
              پاک کردن ژانرها
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

export const SearchFiltersSheet = ({
  open,
  onOpenChange,
  draft,
  onDraftChange,
  onApply,
  onReset,
  genres,
  genresLoading,
}: SearchFiltersSheetProps) => {
  const years = useMemo(() => buildSearchYearOptions(12), [])

  const setDraft = (patch: Partial<SearchUrlFilters>) => {
    onDraftChange({ ...draft, ...patch })
  }

  const applyCurrentSeason = () => {
    setDraft({
      year: getCurrentSeasonYear(),
      season: getCurrentSeasonKey(),
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="flex max-h-[88vh] flex-col rounded-t-2xl p-0">
        <SheetHeader className="shrink-0 border-b border-border/60 px-4 py-3">
          <SheetTitle className="text-base">فیلتر و مرتب‌سازی</SheetTitle>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
          <section>
            <SectionTitle>مرتب‌سازی</SectionTitle>
            <OptionGrid>
              {SEARCH_SORT_OPTIONS.map((option) => (
                <OptionButton
                  key={option.key}
                  active={draft.sortBy === option.key}
                  onClick={() => setDraft({ sortBy: option.key })}
                >
                  {option.label}
                </OptionButton>
              ))}
            </OptionGrid>
          </section>

          <section>
            <SectionTitle>فیلتر سریع</SectionTitle>
            <OptionGrid>
              <OptionButton
                active={
                  draft.year === getCurrentSeasonYear() &&
                  draft.season === getCurrentSeasonKey()
                }
                onClick={applyCurrentSeason}
              >
                فصل جاری
              </OptionButton>
              <OptionButton
                active={draft.format === 'MOVIE'}
                onClick={() =>
                  setDraft({ format: draft.format === 'MOVIE' ? null : 'MOVIE' })
                }
              >
                سینمایی
              </OptionButton>
              <OptionButton
                active={draft.format === 'DONGHUA'}
                onClick={() =>
                  setDraft({ format: draft.format === 'DONGHUA' ? null : 'DONGHUA' })
                }
              >
                دونگهوا
              </OptionButton>
              <OptionButton
                active={draft.airingStatus === 'RELEASING'}
                onClick={() =>
                  setDraft({
                    airingStatus:
                      draft.airingStatus === 'RELEASING' ? null : 'RELEASING',
                  })
                }
              >
                در حال پخش
              </OptionButton>
            </OptionGrid>
          </section>

          <section>
            <SectionTitle>سال</SectionTitle>
            <Select
              value={draft.year != null ? String(draft.year) : 'all'}
              onValueChange={(value) =>
                setDraft({ year: value === 'all' ? null : Number(value) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="همه سال‌ها" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه سال‌ها</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          <section>
            <SectionTitle>فصل پخش</SectionTitle>
            <Select
              value={draft.season ?? 'all'}
              onValueChange={(value) =>
                setDraft({
                  season: value === 'all' ? null : (value as SearchUrlFilters['season']),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="همه فصل‌ها" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه فصل‌ها</SelectItem>
                {SEARCH_SEASONS.map((season) => (
                  <SelectItem key={season.key} value={season.key}>
                    {season.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          <section>
            <SectionTitle>نوع محتوا</SectionTitle>
            <Select
              value={draft.format ?? 'all'}
              onValueChange={(value) =>
                setDraft({
                  format: value === 'all' ? null : (value as SearchUrlFilters['format']),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="همه" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه</SelectItem>
                {SEARCH_FORMATS.map((format) => (
                  <SelectItem key={format.key} value={format.key}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          <section>
            <SectionTitle>وضعیت پخش</SectionTitle>
            <Select
              value={draft.airingStatus ?? 'all'}
              onValueChange={(value) =>
                setDraft({
                  airingStatus:
                    value === 'all' ? null : (value as SearchUrlFilters['airingStatus']),
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="همه" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه</SelectItem>
                {SEARCH_AIRING_STATUSES.map((status) => (
                  <SelectItem key={status.key} value={status.key}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </section>

          <section>
            <SectionTitle>ژانر</SectionTitle>
            <GenreMultiSelect
              genres={genres}
              genresLoading={genresLoading}
              selectedSlugs={draft.genreSlugs}
              onChange={(genreSlugs) => setDraft({ genreSlugs })}
            />
          </section>
        </div>

        <SheetFooter className="shrink-0 flex-row gap-2 border-t border-border/60 px-4 py-3 sm:flex-row">
          <Button type="button" className="flex-1" onClick={onApply}>
            اعمال فیلتر
          </Button>
          <Button type="button" variant="outline" className="flex-1" onClick={onReset}>
            حذف فیلترها
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
