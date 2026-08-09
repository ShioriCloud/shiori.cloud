import { useMemo, useState, type ReactNode } from 'react'
import { Search01Icon } from 'hugeicons-react'
import { Check, ChevronDown } from 'lucide-react'
import type { GenreAdminItem } from '@/services/catalogSource'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ExploreOptionButton, SHIORI_PRIMARY_BUTTON_CLASS, SHIORI_SECONDARY_BUTTON_CLASS } from '@/components/explore/ExploreUi'
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
  SEARCH_HARDSUB_LANGUAGES,
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
  /** Explore keeps sort in a separate sheet. */
  showSort?: boolean
  showHardsub?: boolean
  title?: string
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
          dir="rtl"
          className="ui-elevated grid h-10 w-full grid-cols-[1fr_auto] items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground"
        >
          <span className={cn('min-w-0 truncate text-start', !selectedSlugs.length && 'text-muted-foreground')}>
            {summary}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-70" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="ui-elevated w-[var(--radix-popover-trigger-width)] overflow-hidden p-0"
        align="start"
        sideOffset={4}
      >
        <div className="border-b border-border/50 p-2">
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
                    'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm transition-colors',
                    active
                      ? 'bg-primary-400/15 font-medium text-primary-700 dark:text-primary-200'
                      : 'text-foreground hover:bg-muted/50'
                  )}
                >
                  <span>{genreLabel(genre)}</span>
                  {active ? <Check className="h-4 w-4 shrink-0 text-primary-500" /> : null}
                </button>
              )
            })
          )}
        </div>
        {selectedSlugs.length > 0 ? (
          <div className="border-t border-border/50 p-2">
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
  showSort = true,
  showHardsub = false,
  title = 'فیلتر و مرتب‌سازی',
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
      <SheetContent
        side="bottom"
        className="flex max-h-[88vh] flex-col rounded-t-2xl border-t border-border bg-background p-0 shadow-[0_-8px_30px_oklch(0.4_0_0/0.12)] dark:shadow-[0_-8px_30px_oklch(0_0_0/0.45)] pb-[var(--app-tg-bottom-inset)]"
      >
        <SheetHeader className="shrink-0 border-b border-border/50 px-4 py-3">
          <SheetTitle className="text-base">{title}</SheetTitle>
        </SheetHeader>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
          {showSort ? (
            <section>
              <SectionTitle>مرتب‌سازی</SectionTitle>
              <OptionGrid>
                {SEARCH_SORT_OPTIONS.map((option) => (
                  <ExploreOptionButton
                    key={option.key}
                    active={draft.sortBy === option.key}
                    onClick={() => setDraft({ sortBy: option.key })}
                  >
                    {option.label}
                  </ExploreOptionButton>
                ))}
              </OptionGrid>
            </section>
          ) : null}

          <section>
            <SectionTitle>فیلتر سریع</SectionTitle>
            <OptionGrid>
              <ExploreOptionButton
                active={
                  draft.year === getCurrentSeasonYear() &&
                  draft.season === getCurrentSeasonKey()
                }
                onClick={applyCurrentSeason}
              >
                فصل جاری
              </ExploreOptionButton>
              <ExploreOptionButton
                active={draft.format === 'MOVIE'}
                onClick={() =>
                  setDraft({ format: draft.format === 'MOVIE' ? null : 'MOVIE' })
                }
              >
                سینمایی
              </ExploreOptionButton>
              <ExploreOptionButton
                active={draft.format === 'DONGHUA'}
                onClick={() =>
                  setDraft({ format: draft.format === 'DONGHUA' ? null : 'DONGHUA' })
                }
              >
                دونگهوا
              </ExploreOptionButton>
              <ExploreOptionButton
                active={draft.airingStatus === 'RELEASING'}
                onClick={() =>
                  setDraft({
                    airingStatus:
                      draft.airingStatus === 'RELEASING' ? null : 'RELEASING',
                  })
                }
              >
                در حال پخش
              </ExploreOptionButton>
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

          {showHardsub ? (
            <section>
              <SectionTitle>زبان زیرنویس</SectionTitle>
              <OptionGrid>
                <ExploreOptionButton
                  active={draft.hardsubLanguage == null}
                  onClick={() => setDraft({ hardsubLanguage: null })}
                >
                  همه
                </ExploreOptionButton>
                {SEARCH_HARDSUB_LANGUAGES.map((option) => (
                  <ExploreOptionButton
                    key={option.key}
                    active={draft.hardsubLanguage === option.key}
                    onClick={() => setDraft({ hardsubLanguage: option.key })}
                  >
                    {option.label}
                  </ExploreOptionButton>
                ))}
              </OptionGrid>
            </section>
          ) : null}
        </div>

        <SheetFooter className="shrink-0 flex-row gap-3 border-t border-border/50 px-4 py-4 sm:flex-row">
          <Button
            type="button"
            size="lg"
            className={cn('h-12 flex-1 text-base font-semibold', SHIORI_PRIMARY_BUTTON_CLASS)}
            onClick={onApply}
          >
            اعمال فیلتر
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className={cn('h-12 flex-1 text-base font-semibold', SHIORI_SECONDARY_BUTTON_CLASS)}
            onClick={onReset}
          >
            حذف فیلترها
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
