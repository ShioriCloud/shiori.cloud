import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft01Icon, MinusSignIcon, PlusSignIcon, StarIcon } from 'hugeicons-react'
import type { FavoriteProgress } from '../store/animeStore'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetFooter,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { BidiText } from '@/components/BidiText'
import { toPersianDigits } from '@/lib/persianDigits'
import {
  clampUserRating,
  deriveWatchStatus,
  formatUserRatingFa,
  PROFILE_WATCH_STATUSES,
  progressForWatchStatus,
  WATCH_STATUS_LABELS,
  type WatchStatus,
} from '@/lib/myListUtils'

const DISMISS_DRAG_PX = 80
const MAX_UPWARD_DRAG_PX = 24

const dragTranslateY = (offset: number) => {
  if (offset > 0) return offset
  if (offset < 0) return offset * 0.35
  return 0
}

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  titleRomaji?: string | null
  image: string
  detailHref?: string
  episodesCount: number
  progress: FavoriteProgress
  saving?: boolean
  onSave: (progress: FavoriteProgress) => void
  onRemove?: () => void
}

const FavoriteAnimeEditor = ({
  open,
  onOpenChange,
  title,
  titleRomaji,
  image,
  detailHref,
  episodesCount,
  progress,
  saving = false,
  onSave,
  onRemove,
}: Props) => {
  const maxEpisodes = Math.max(episodesCount, 1)
  const [episodesWatched, setEpisodesWatched] = useState(progress.episodesWatched)
  const [userRating, setUserRating] = useState<number | null>(progress.userRating)
  const [listStatus, setListStatus] = useState<WatchStatus>(() =>
    deriveWatchStatus(progress, maxEpisodes)
  )
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isClosingByDrag, setIsClosingByDrag] = useState(false)
  const sheetRef = useRef<HTMLDivElement>(null)
  const dragStartY = useRef(0)
  const dragOffsetRef = useRef(0)
  const isDraggingRef = useRef(false)

  useEffect(() => {
    dragOffsetRef.current = dragOffset
  }, [dragOffset])

  useEffect(() => {
    if (!open) return
    setEpisodesWatched(progress.episodesWatched)
    setUserRating(progress.userRating)
    setListStatus(deriveWatchStatus(progress, maxEpisodes))
  }, [open, progress, maxEpisodes])

  useEffect(() => {
    if (open) return
    setDragOffset(0)
    setIsDragging(false)
    setIsClosingByDrag(false)
    dragOffsetRef.current = 0
    isDraggingRef.current = false
  }, [open])

  const progressPercent = Math.min(100, Math.round((episodesWatched / maxEpisodes) * 100))

  const bumpEpisodes = (delta: number) => {
    setEpisodesWatched((prev) => {
      const next = Math.min(maxEpisodes, Math.max(0, prev + delta))
      if (next >= maxEpisodes) setListStatus('completed')
      else if (next > 0 && (listStatus === 'planning' || listStatus === 'completed')) {
        setListStatus('watching')
      }
      return next
    })
  }

  const applyStatus = (status: WatchStatus) => {
    const next = progressForWatchStatus(
      status,
      { episodesWatched, userRating, listStatus },
      maxEpisodes
    )
    setListStatus(status)
    setEpisodesWatched(next.episodesWatched)
  }

  const bumpRating = (delta: number) => {
    setUserRating((prev) => {
      const base = prev ?? 8
      const next = clampUserRating(base + delta)
      return next
    })
  }

  const setDrag = (offset: number) => {
    dragOffsetRef.current = offset
    setDragOffset(offset)
  }

  const finishDrag = useCallback(() => {
    const offset = dragOffsetRef.current
    isDraggingRef.current = false
    setIsDragging(false)

    if (offset > DISMISS_DRAG_PX) {
      const height = sheetRef.current?.getBoundingClientRect().height ?? 480
      setIsClosingByDrag(true)
      setDrag(height + 32)
      window.setTimeout(() => {
        onOpenChange(false)
      }, 300)
      return
    }

    setDrag(0)
  }, [onOpenChange])

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (saving) return
    event.preventDefault()
    dragStartY.current = event.clientY
    isDraggingRef.current = true
    setIsDragging(true)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return
    const delta = event.clientY - dragStartY.current
    const next = delta >= 0 ? delta : Math.max(-MAX_UPWARD_DRAG_PX, delta)
    setDrag(next)
  }

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    finishDrag()
  }

  const dragY = dragTranslateY(dragOffset)
  const isSheetMoved = dragOffset !== 0 || isDragging || isClosingByDrag
  const romaji = titleRomaji?.trim() || null
  const sliderValue = userRating ?? 8

  const handleSave = () => {
    const rating =
      userRating != null && Number.isFinite(userRating) ? clampUserRating(userRating) : null
    onSave({
      episodesWatched,
      userRating: rating,
      listStatus,
    })
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        ref={sheetRef}
        side="bottom"
        overlayClassName={cn(isSheetMoved && 'transition-none')}
        overlayStyle={
          dragY > 0 ? { opacity: Math.max(0, 0.8 * (1 - dragY / 420)) } : undefined
        }
        className={cn(
          'flex max-h-[92vh] flex-col overflow-hidden rounded-t-2xl border-t border-border bg-background p-0',
          'pb-[max(1rem,var(--app-tg-bottom-inset))]',
          isSheetMoved && '[animation:none!important]',
          !isDragging &&
            dragOffset !== 0 &&
            'transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]'
        )}
        style={isSheetMoved ? { transform: `translateY(${dragY}px)` } : undefined}
      >
        <div
          className="flex touch-none cursor-grab flex-col active:cursor-grabbing"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          aria-label="کشیدن برای بستن"
        >
          <div className="flex justify-center pb-2 pt-3">
            <div className="h-1.5 w-12 rounded-full bg-muted-foreground/35" />
          </div>

          <div className="flex items-start gap-3 px-4 pb-4">
            <div className="media-card-skeuo h-[88px] w-[88px] shrink-0 rounded-2xl">
              <div className="media-card-skeuo-face overflow-hidden bg-muted">
                <img src={image} alt="" className="h-full w-full object-cover" />
              </div>
            </div>
            <div className="min-w-0 flex-1 pt-0.5 text-right">
              <BidiText as="h2" className="line-clamp-2 text-base font-bold leading-snug text-foreground">
                {title}
              </BidiText>
              {romaji ? (
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground" dir="ltr">
                  {romaji}
                </p>
              ) : null}
              {detailHref ? (
                <Link
                  to={detailHref}
                  onClick={() => onOpenChange(false)}
                  onPointerDown={(e) => e.stopPropagation()}
                  className={cn(
                    'mt-2 inline-flex h-8 items-center gap-1 rounded-lg border px-2.5',
                    'border-border/50 bg-muted/35 text-[11px] font-medium text-muted-foreground',
                    'transition-colors hover:bg-muted/50 hover:text-foreground active:scale-[0.98]'
                  )}
                >
                  صفحه انیمه
                  <ArrowLeft01Icon className="h-3.5 w-3.5" />
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-2">
          <section>
            <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground">
              وضعیت تماشا
            </p>
            <div className="grid grid-cols-2 gap-2">
              {PROFILE_WATCH_STATUSES.map((status) => {
                const active = listStatus === status
                return (
                  <button
                    key={status}
                    type="button"
                    disabled={saving}
                    onClick={() => applyStatus(status)}
                    className={cn(
                      'rounded-xl border px-2.5 py-2.5 text-right text-[12px] font-medium leading-snug transition-all',
                      active
                        ? 'border-primary-400/55 bg-primary-500/15 text-primary-300 ring-1 ring-primary-400/20'
                        : 'border-border/70 bg-card/50 text-muted-foreground hover:border-border hover:bg-muted/40'
                    )}
                  >
                    {WATCH_STATUS_LABELS[status]}
                  </button>
                )
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-border/60 bg-muted/20 p-4">
            <p className="mb-3 text-xs font-semibold text-muted-foreground">قسمت‌های دیده‌شده</p>
            <div className="flex items-center justify-between gap-3">
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="h-12 w-12 shrink-0 rounded-xl"
                disabled={episodesWatched <= 0 || saving}
                onClick={() => bumpEpisodes(-1)}
              >
                <MinusSignIcon className="h-5 w-5" />
              </Button>
              <div className="flex-1 text-center">
                <p className="text-2xl font-bold tabular-nums tracking-tight">
                  {toPersianDigits(episodesWatched)}
                  <span className="mx-1.5 text-base font-normal text-muted-foreground">/</span>
                  {toPersianDigits(maxEpisodes)}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">قسمت</p>
              </div>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="h-12 w-12 shrink-0 rounded-xl"
                disabled={episodesWatched >= maxEpisodes || saving}
                onClick={() => bumpEpisodes(1)}
              >
                <PlusSignIcon className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-background/80">
              <div
                className="h-full rounded-full bg-gradient-to-l from-primary-500 to-primary-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {episodesWatched < maxEpisodes ? (
              <Button
                type="button"
                variant="outline"
                className="mt-3 h-10 w-full rounded-xl text-sm"
                disabled={saving}
                onClick={() => {
                  setEpisodesWatched(maxEpisodes)
                  setListStatus('completed')
                }}
              >
                علامت‌گذاری همه ({toPersianDigits(maxEpisodes)} قسمت)
              </Button>
            ) : null}
          </section>

          <section
            className={cn(
              'relative overflow-hidden rounded-2xl border p-4',
              userRating != null
                ? 'border-amber-400/35 bg-gradient-to-br from-amber-500/10 via-background to-primary-500/5'
                : 'border-border/60 bg-muted/15'
            )}
          >
            <div className="pointer-events-none absolute -left-8 -top-8 h-24 w-24 rounded-full bg-amber-400/10 blur-2xl" />
            <div className="relative flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-muted-foreground">امتیاز تو</p>
              {userRating != null ? (
                <button
                  type="button"
                  className="text-[11px] font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                  disabled={saving}
                  onClick={() => setUserRating(null)}
                >
                  بدون امتیاز
                </button>
              ) : null}
            </div>

            <div className="relative mt-3 flex items-center justify-center gap-4">
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="h-11 w-11 rounded-xl"
                disabled={saving || (userRating != null && userRating <= 1)}
                onClick={() => bumpRating(-0.5)}
              >
                <MinusSignIcon className="h-4 w-4" />
              </Button>
              <div className="flex min-w-[5.5rem] flex-col items-center">
                <StarIcon
                  className={cn(
                    'mb-1 h-5 w-5',
                    userRating != null ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40'
                  )}
                />
                <span
                  className={cn(
                    'text-4xl font-bold tabular-nums leading-none',
                    userRating != null ? 'text-foreground' : 'text-muted-foreground/50'
                  )}
                >
                  {userRating != null ? formatUserRatingFa(userRating) : '—'}
                </span>
                <span className="mt-1 text-[10px] text-muted-foreground">از ۱۰</span>
              </div>
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="h-11 w-11 rounded-xl"
                disabled={saving || (userRating != null && userRating >= 10)}
                onClick={() => bumpRating(0.5)}
              >
                <PlusSignIcon className="h-4 w-4" />
              </Button>
            </div>

            <div className="relative mt-5">
              <input
                type="range"
                min={1}
                max={10}
                step={0.5}
                disabled={saving}
                value={sliderValue}
                onChange={(e) => setUserRating(clampUserRating(Number(e.target.value)))}
                className={cn(
                  'h-2 w-full cursor-pointer appearance-none rounded-full bg-muted',
                  '[&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none',
                  '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background',
                  '[&::-webkit-slider-thumb]:bg-amber-400 [&::-webkit-slider-thumb]:shadow-md'
                )}
                aria-label="امتیاز از ۱ تا ۱۰"
              />
              <div className="mt-2 flex justify-between text-[10px] tabular-nums text-muted-foreground">
                <span>{toPersianDigits(1)}</span>
                <span>{toPersianDigits(10)}</span>
              </div>
            </div>

            <div className="relative mt-3 flex flex-wrap justify-center gap-1.5">
              {[5, 6, 7, 8, 9, 10].map((score) => {
                const active = userRating != null && Math.abs(userRating - score) < 0.01
                return (
                  <button
                    key={score}
                    type="button"
                    disabled={saving}
                    onClick={() => setUserRating(score)}
                    className={cn(
                      'min-w-[2.25rem] rounded-lg border px-2 py-1.5 text-xs font-semibold tabular-nums transition-colors',
                      active
                        ? 'border-amber-400/50 bg-amber-500/15 text-amber-200'
                        : 'border-border/60 bg-background/60 text-muted-foreground hover:bg-muted/50'
                    )}
                  >
                    {toPersianDigits(score)}
                  </button>
                )
              })}
            </div>
          </section>
        </div>

        <SheetFooter className="mt-2 flex-row gap-2 border-t border-border/40 bg-background/95 px-4 pt-3 sm:flex-row">
          <Button type="button" className="h-11 flex-1 rounded-xl" disabled={saving} onClick={handleSave}>
            {saving ? 'در حال ذخیره…' : 'ذخیره'}
          </Button>
          {onRemove ? (
            <Button
              type="button"
              variant="outline"
              className="h-11 flex-1 rounded-xl"
              disabled={saving}
              onClick={onRemove}
            >
              حذف
            </Button>
          ) : null}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export default FavoriteAnimeEditor
