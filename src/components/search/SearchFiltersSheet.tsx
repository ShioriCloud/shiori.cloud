import { useMemo, useState, type ReactNode } from 'react'
import { Search01Icon } from 'hugeicons-react'
import { Check, ChevronLeft } from 'lucide-react'
import type { GenreAdminItem } from '@/services/catalogSource'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

type SheetView = 'main' | 'genre'

const genreLabel = (g: GenreAdminItem) => g.name_fa || g.name_en || g.slug

const SectionTitle = ({ children }: { children: ReactNode }) => (
  <h3 className="text-foreground mb-2.5 text-sm font-semibold">{children}</h3>
)

const OptionGrid = ({
  children,
  cols = 2,
}: {
  children: ReactNode
  cols?: 2 | 4
}) => (
  <div
    className={cn(
      'grid gap-2',
      cols === 4 ? 'grid-cols-4' : 'grid-cols-2'
    )}
  >
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
      'min-h-11 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors',
      active
        ? 'border-primary-400/50 bg-primary-600/20 text-primary-100'
        : 'border-border/70 bg-card text-muted-foreground hover:bg-muted/50 hover:text-foreground',
      className
    )}
  >
    {children}
  </button>
)

const RowLink = ({
  label,
  value,
  onClick,
}: {
  label: string
  value: string
  onClick: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center justify-between gap-3 rounded-xl border border-border/70 bg-card px-4 py-3.5 text-start transition-colors hover:bg-muted/40"
  >
    <span className="text-sm font-medium text-foreground">{label}</span>
    <span className="text-muted-foreground flex items-center gap-1 text-xs">
      {value}
      <ChevronLeft className="h-4 w-4 rotate-180" />
    </span>
  </button>
)

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
  const [view, setView] = useState<SheetView>('main')
  const [genreQuery, setGenreQuery] = useState('')
  const years = useMemo(() => buildSearchYearOptions(10), [])

  const filteredGenres = useMemo(() => {
    const q = genreQuery.trim().toLowerCase()
    if (!q) return genres
    return genres.filter((g) => {
      const label = genreLabel(g).toLowerCase()
      return label.includes(q) || g.slug.includes(q)
    })
  }, [genreQuery, genres])

  const setDraft = (patch: Partial<SearchUrlFilters>) => {
    onDraftChange({ ...draft, ...patch })
  }

  const applyCurrentSeason = () => {
    setDraft({
      year: getCurrentSeasonYear(),
      season: getCurrentSeasonKey(),
    })
  }

  const genreSummary = draft.genreSlug
    ? draft.genreLabel || draft.genreSlug
    : 'همه ژانرها'

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setView('main')
      setGenreQuery('')
    }
    onOpenChange(next)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="flex max-h-[88vh] flex-col rounded-t-2xl p-0">
        <SheetHeader className="shrink-0 border-b border-border/60 px-4 py-3">
          <div className="flex items-center gap-2">
            {view === 'genre' ? (
              <button
                type="button"
                onClick={() => setView('main')}
                className="text-muted-foreground hover:text-foreground rounded-lg p-1 transition-colors"
                aria-label="بازگشت"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            ) : null}
            <SheetTitle className="text-base">
              {view === 'genre' ? 'انتخاب ژانر' : 'فیلتر و مرتب‌سازی'}
            </SheetTitle>
          </div>
        </SheetHeader>

        {view === 'main' ? (
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-4">
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
              <SectionTitle>فصل پخش</SectionTitle>
              <OptionGrid cols={4}>
                {SEARCH_SEASONS.map((season) => (
                  <OptionButton
                    key={season.key}
                    active={draft.season === season.key}
                    onClick={() =>
                      setDraft({
                        season: draft.season === season.key ? null : season.key,
                      })
                    }
                    className="px-2 text-xs"
                  >
                    {season.label}
                  </OptionButton>
                ))}
              </OptionGrid>
            </section>

            <section>
              <SectionTitle>سال</SectionTitle>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <OptionButton
                  active={draft.year == null}
                  onClick={() => setDraft({ year: null })}
                  className="shrink-0 min-w-[4.5rem]"
                >
                  همه
                </OptionButton>
                {years.map((year) => (
                  <OptionButton
                    key={year}
                    active={draft.year === year}
                    onClick={() => setDraft({ year: draft.year === year ? null : year })}
                    className="shrink-0 min-w-[4.5rem] tabular-nums"
                  >
                    {year}
                  </OptionButton>
                ))}
              </div>
            </section>

            <section>
              <SectionTitle>نوع محتوا</SectionTitle>
              <OptionGrid>
                {SEARCH_FORMATS.map((format) => (
                  <OptionButton
                    key={format.key}
                    active={draft.format === format.key}
                    onClick={() =>
                      setDraft({
                        format: draft.format === format.key ? null : format.key,
                      })
                    }
                  >
                    {format.label}
                  </OptionButton>
                ))}
              </OptionGrid>
            </section>

            <section>
              <SectionTitle>وضعیت پخش</SectionTitle>
              <OptionGrid>
                {SEARCH_AIRING_STATUSES.map((status) => (
                  <OptionButton
                    key={status.key}
                    active={draft.airingStatus === status.key}
                    onClick={() =>
                      setDraft({
                        airingStatus:
                          draft.airingStatus === status.key ? null : status.key,
                      })
                    }
                  >
                    {status.label}
                  </OptionButton>
                ))}
              </OptionGrid>
            </section>

            <section>
              <SectionTitle>ژانر</SectionTitle>
              <RowLink label="ژانر" value={genreSummary} onClick={() => setView('genre')} />
            </section>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 px-4 pt-3">
              <div className="relative">
                <Search01Icon className="text-muted-foreground pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                  value={genreQuery}
                  onChange={(e) => setGenreQuery(e.target.value)}
                  placeholder="جستجو در ژانرها..."
                  className="bg-card pe-9"
                  autoFocus
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
              <button
                type="button"
                onClick={() => setDraft({ genreSlug: null, genreLabel: null })}
                className={cn(
                  'mb-1 flex w-full items-center justify-between rounded-xl px-3 py-3.5 text-sm transition-colors',
                  !draft.genreSlug ? 'bg-primary-600/15 text-primary-100' : 'hover:bg-muted/40'
                )}
              >
                <span>همه ژانرها</span>
                {!draft.genreSlug ? <Check className="h-4 w-4" /> : null}
              </button>

              {genresLoading ? (
                <p className="text-muted-foreground py-8 text-center text-sm">در حال بارگذاری...</p>
              ) : filteredGenres.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">ژانری پیدا نشد</p>
              ) : (
                filteredGenres.map((genre) => {
                  const active = draft.genreSlug === genre.slug
                  return (
                    <button
                      key={genre.slug}
                      type="button"
                      onClick={() =>
                        setDraft({
                          genreSlug: genre.slug,
                          genreLabel: genreLabel(genre),
                        })
                      }
                      className={cn(
                        'flex w-full items-center justify-between rounded-xl px-3 py-3.5 text-sm transition-colors',
                        active ? 'bg-primary-600/15 text-primary-100' : 'hover:bg-muted/40'
                      )}
                    >
                      <span>{genreLabel(genre)}</span>
                      {active ? <Check className="h-4 w-4 shrink-0" /> : null}
                    </button>
                  )
                })
              )}
            </div>

            <div className="shrink-0 border-t border-border/60 px-4 py-3">
              <Button type="button" className="w-full" onClick={() => setView('main')}>
                تأیید ژانر
              </Button>
            </div>
          </div>
        )}

        {view === 'main' ? (
          <SheetFooter className="shrink-0 flex-row gap-2 border-t border-border/60 px-4 py-3 sm:flex-row">
            <Button type="button" variant="outline" className="flex-1" onClick={onReset}>
              پاک کردن
            </Button>
            <Button type="button" className="flex-1" onClick={onApply}>
              نمایش نتایج
            </Button>
          </SheetFooter>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
