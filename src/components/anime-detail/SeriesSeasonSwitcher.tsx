import { useEffect, useRef } from 'react'
import { Video01Icon } from 'hugeicons-react'
import { cn } from '@/lib/utils'
import { formatSeriesMemberLabel, toPersianNumber } from './animeDetailLabels'
import type { Anime } from './types'

export const SeriesSeasonSwitcher = ({
  series,
  currentAnimeId,
  onSelect,
}: {
  series: NonNullable<Anime['series']>
  currentAnimeId: string | number
  onSelect: (member: { id: string | number; slug?: string | null }) => void
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeItemRef = useRef<HTMLButtonElement>(null)

  const currentIndex = series.members.findIndex(
    (member) => String(member.id) === String(currentAnimeId)
  )
  const progressLabel =
    currentIndex >= 0
      ? `${toPersianNumber(currentIndex + 1)} از ${toPersianNumber(series.members.length)}`
      : null

  useEffect(() => {
    const container = scrollRef.current
    const activeEl = activeItemRef.current
    if (!container || !activeEl) return

    const frame = requestAnimationFrame(() => {
      const containerRect = container.getBoundingClientRect()
      const activeRect = activeEl.getBoundingClientRect()
      const activeCenter = activeRect.left + activeRect.width / 2
      const containerCenter = containerRect.left + containerRect.width / 2
      container.scrollLeft += activeCenter - containerCenter
    })

    return () => cancelAnimationFrame(frame)
  }, [currentAnimeId, series.members.length])

  return (
    <div className="mx-4 mt-4">
      <div className="surface-skeuo relative overflow-hidden rounded-2xl p-3.5">
        <div className="relative mb-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {series.title || 'فصل‌های سری'}
            </p>
            <p className="text-[11px] text-muted-foreground">دسترسی سریع به سایر فصل‌های انیمه</p>
          </div>
          {progressLabel ? (
            <span className="shrink-0 rounded-md border border-primary-400/25 bg-primary-500/15 px-2.5 py-1 text-[10px] font-semibold tabular-nums text-primary-700 dark:bg-primary-500/20 dark:text-primary-200">
              {progressLabel}
            </span>
          ) : null}
        </div>

        <div
          ref={scrollRef}
          className="relative -mx-0.5 flex gap-2 overflow-x-auto px-0.5 pb-1 scrollbar-none snap-x snap-mandatory scroll-smooth"
        >
          {series.members.map((member) => {
            const isActive = String(member.id) === String(currentAnimeId)
            const memberLabel = formatSeriesMemberLabel(member)

            return (
              <button
                key={String(member.id)}
                ref={isActive ? activeItemRef : undefined}
                type="button"
                onClick={() => !isActive && onSelect(member)}
                aria-current={isActive ? 'true' : undefined}
                aria-label={`${memberLabel}${member.title ? `: ${member.title}` : ''}`}
                className={cn(
                  'group shrink-0 snap-center scroll-mx-8 text-right transition-all duration-300',
                  isActive ? 'z-10 scale-100' : 'scale-[0.94] opacity-75 hover:scale-[0.97] hover:opacity-100'
                )}
              >
                <div
                  className={cn(
                    'relative aspect-[2/3] w-[5.25rem] overflow-hidden rounded-xl border-2 transition-all duration-300',
                    isActive
                      ? 'border-primary-400 shadow-md shadow-primary-400/20'
                      : 'border-black/[0.08] group-hover:border-primary-400/35 dark:border-border'
                  )}
                >
                  {member.image ? (
                    <img
                      src={member.image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                      <Video01Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/10" />
                  {isActive ? (
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary-400" />
                  ) : null}
                  <div className="absolute inset-x-0 bottom-0 p-2">
                    <p className="truncate text-[10px] font-bold leading-tight text-white">
                      {memberLabel}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
