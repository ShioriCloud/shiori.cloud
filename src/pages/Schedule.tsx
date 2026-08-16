import { useMemo, useState, type MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import AnimePrefetchLink from '../components/AnimePrefetchLink'
import { BidiText } from '../components/BidiText'
import { Calendar01Icon } from 'hugeicons-react'
import type { GenreItem } from '../types/catalog'
import { ExploreEmptyState } from '@/components/explore/ExploreUi'
import {
  AnimatedTabContent,
  tabThumbTransition,
  useTabSlideDirection,
} from '@/components/AnimatedTabContent'
import { TabSwipeArea, TAB_SWIPE_FIXED_HEADER_CLASS } from '@/components/TabSwipeArea'
import { cn } from '@/lib/utils'
import { useScheduleQuery } from '../hooks/queries/useAnimeQueries'
import { animeDetailPath, animePublicSegment } from '../lib/animePaths'
import { hapticSelection } from '../lib/telegramHaptics'
import { showAppToast } from '@/store/appFeedbackStore'
import shioriLogo from '../assets/images/shiori.svg'
import { LayoutGroup, motion, useReducedMotion } from 'motion/react'

type Anime = {
  id: number
  localId?: string | number | null
  title: string
  image: string
  episode: string
  genres?: GenreItem[]
  time?: string
}

type ScheduleInfo = {
  schedule: Record<string, Anime[]>
  currentSeason: string
  currentYear: number
}

type PersianDay = 'شنبه' | 'یکشنبه' | 'دوشنبه' | 'سه‌شنبه' | 'چهارشنبه' | 'پنج‌شنبه' | 'جمعه'

const PERSIAN_DAYS: PersianDay[] = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
]

const DAY_SHORT: Record<PersianDay, string> = {
  شنبه: 'ش',
  یکشنبه: 'ی',
  دوشنبه: 'د',
  سه‌شنبه: 'س',
  چهارشنبه: 'چ',
  پنج‌شنبه: 'پ',
  جمعه: 'ج',
}

const EMPTY_SCHEDULE: Record<PersianDay, Anime[]> = {
  شنبه: [],
  یکشنبه: [],
  دوشنبه: [],
  سه‌شنبه: [],
  چهارشنبه: [],
  پنج‌شنبه: [],
  جمعه: [],
}

const getCurrentPersianDay = (): PersianDay => {
  const dayMap: Record<string, PersianDay> = {
    Sun: 'یکشنبه',
    Mon: 'دوشنبه',
    Tue: 'سه‌شنبه',
    Wed: 'چهارشنبه',
    Thu: 'پنج‌شنبه',
    Fri: 'جمعه',
    Sat: 'شنبه',
  }
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tehran',
    weekday: 'short',
  }).format(new Date())
  return dayMap[weekday] ?? 'شنبه'
}

const translateSeason = (season: string): string => {
  switch (season) {
    case 'WINTER':
      return 'زمستان'
    case 'SPRING':
      return 'بهار'
    case 'SUMMER':
      return 'تابستان'
    case 'FALL':
      return 'پاییز'
    default:
      return season
  }
}

const toPersianNumber = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return String(num).replace(/[0-9]/g, (w) => persianDigits[+w])
}

const filterScheduleList = (list: Anime[]): Anime[] =>
  list.filter((anime) => {
    const genres = anime.genres || []
    return !genres.some((g) => String(g.slug).toLowerCase() === 'hentai')
  })

const ScheduleSkeleton = () => (
  <div className="pb-24 animate-pulse">
    <div className="px-4 pt-4 flex items-center justify-between gap-3">
      <div className="h-6 w-28 bg-muted rounded" />
      <div className="h-5 w-32 bg-muted rounded" />
    </div>
    <div className="px-4 pt-3 flex justify-between gap-1">
      {PERSIAN_DAYS.map((day) => (
        <div key={day} className="flex-1 flex justify-center">
          <div className="w-10 h-10 rounded-full bg-muted" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-3 gap-3 px-4 pt-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="aspect-[2/3] rounded-2xl bg-muted" />
      ))}
    </div>
  </div>
)

const Schedule = () => {
  const navigate = useNavigate()

  const { data, isLoading, isError, refetch } = useScheduleQuery()
  const [activeDay, setActiveDay] = useState<PersianDay>(getCurrentPersianDay())

  const buildTranslationRequestHref = (anime: Anime) => {
    const params = new URLSearchParams()
    params.set('compose', '1')
    params.set('category', 'feature_request')
    params.set('subject', `درخواست ترجمه: ${anime.title}`)
    params.set(
      'body',
      [
        `لطفاً ترجمهٔ این عنوان را به کاتالوگ شیوری اضافه کنید.`,
        ``,
        `عنوان: ${anime.title}`,
        `AniList ID: ${anime.id}`,
        anime.episode ? `قسمت برنامه پخش: ${anime.episode}` : null,
      ]
        .filter(Boolean)
        .join('\n')
    )
    return `/support?${params.toString()}`
  }

  const scheduleInfo = data as ScheduleInfo | undefined
  const currentSeason = scheduleInfo?.currentSeason ?? ''
  const currentYear = scheduleInfo?.currentYear ?? 0

  const schedule = useMemo(() => {
    const nextSchedule = { ...EMPTY_SCHEDULE }
    if (scheduleInfo?.schedule) {
      for (const day of PERSIAN_DAYS) {
        nextSchedule[day] = scheduleInfo.schedule[day] ?? []
      }
    }
    return nextSchedule
  }, [scheduleInfo])

  const error = isError ? 'خطا در بارگذاری برنامه پخش' : null
  const loading = isLoading && !scheduleInfo

  const activeList = useMemo(
    () => filterScheduleList(schedule[activeDay] ?? []),
    [schedule, activeDay]
  )
  const dayDirection = useTabSlideDirection(PERSIAN_DAYS, activeDay)
  const reduceMotion = useReducedMotion()

  const handleAnimeClick = (e: MouseEvent<HTMLAnchorElement>, anime: Anime) => {
    e.preventDefault()

    if (anime.localId) {
      navigate(animeDetailPath({ id: anime.localId, title: anime.title }))
      return
    }

    showAppToast('هنوز در کاتالوگ شیوری نیست', 'warning', {
      description: 'می‌تونی برای ترجمه‌اش درخواست ثبت کنی.',
      duration: 6500,
      action: {
        label: 'درخواست ترجمه',
        onClick: () => {
          hapticSelection()
          navigate(buildTranslationRequestHref(anime))
        },
      },
    })
  }

  if (loading) return <ScheduleSkeleton />

  if (error) {
    return (
      <div className="pb-24">
        <ExploreEmptyState
          title="خطا در بارگذاری برنامه پخش"
          subtitle={error}
          actionLabel="تلاش مجدد"
          onAction={() => void refetch()}
        />
      </div>
    )
  }

  const seasonLabel =
    currentSeason && currentYear
      ? `فصل ${translateSeason(currentSeason)} ${toPersianNumber(currentYear)}`
      : null

  return (
    <TabSwipeArea
      tabs={PERSIAN_DAYS}
      active={activeDay}
      onChange={setActiveDay}
      className={cn('pb-24', TAB_SWIPE_FIXED_HEADER_CLASS)}
    >
      <div className="shrink-0 px-4 pt-4 flex items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-foreground shrink-0">برنامه پخش هفتگی</h1>
        {seasonLabel && (
          <p className="text-sm font-medium text-muted-foreground">{seasonLabel}</p>
        )}
      </div>

      <div className="flex-1">
        {/* Day picker */}
        <div className="px-4 pt-3">
          <LayoutGroup id="schedule-day-thumb">
            <div className="flex items-center justify-between gap-1">
              {PERSIAN_DAYS.map((day) => {
                const isActive = activeDay === day

                return (
                  <button
                    key={day}
                    type="button"
                    title={day}
                    onClick={() => {
                      if (day === activeDay) return
                      hapticSelection()
                      setActiveDay(day)
                    }}
                    className="flex-1 flex justify-center py-1"
                  >
                    <span className="relative flex h-10 w-10 items-center justify-center">
                      {isActive ? (
                        reduceMotion ? (
                          <span
                            aria-hidden
                            className="absolute inset-0 rounded-full bg-primary-500 shadow-md shadow-primary-400/35"
                          />
                        ) : (
                          <motion.span
                            layoutId="schedule-day-thumb"
                            aria-hidden
                            className="absolute inset-0 rounded-full bg-primary-500 shadow-md shadow-primary-400/35"
                            transition={tabThumbTransition}
                          />
                        )
                      ) : (
                        <span
                          aria-hidden
                          className="absolute inset-0 rounded-full bg-muted/80"
                        />
                      )}
                      <span
                        className={cn(
                          'relative z-10 text-sm font-bold',
                          isActive ? 'text-white' : 'text-muted-foreground'
                        )}
                      >
                        {DAY_SHORT[day]}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </LayoutGroup>
        </div>

        <AnimatedTabContent activeKey={activeDay} direction={dayDirection}>
        {/* Content header */}
        <div className="px-4 pt-4 pb-2 flex items-baseline justify-between">
          <h2 className="text-base font-semibold text-foreground">{activeDay}</h2>
          <span className="text-xs text-muted-foreground">
            {activeList.length > 0
              ? `${toPersianNumber(activeList.length)} عنوان`
              : 'خالی'}
          </span>
        </div>

        {activeList.length > 0 ? (
          <div className="grid grid-cols-3 gap-3 px-4">
            {activeList.map((anime) => (
              <AnimePrefetchLink
                key={anime.id}
                animeId={
                  anime.localId
                    ? animePublicSegment({ id: anime.localId, title: anime.title })
                    : anime.id
                }
                to={
                  anime.localId
                    ? animeDetailPath({ id: anime.localId, title: anime.title })
                    : '#'
                }
                onClick={(e) => handleAnimeClick(e, anime)}
                className="group block active:scale-[0.98] transition-transform"
              >
                <div className="media-card-skeuo rounded-xl">
                  <div className="media-card-skeuo-face relative aspect-[2/3] bg-muted">
                    <img
                      src={anime.image}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                    {anime.localId ? (
                    <span
                      className="absolute top-1.5 start-1.5 flex h-6 w-6 items-center justify-center rounded-md bg-rose-500 shadow-sm"
                      title="ترجمه شیوری"
                      aria-label="موجود در کاتالوگ شیوری"
                    >
                      <img src={shioriLogo} alt="" className="h-3.5 w-3.5 object-contain" />
                    </span>
                  ) : null}

                  <div className="absolute left-0 bottom-0 p-2 pt-10">
                    <BidiText
                      as="h3"
                      className="text-xs text-left font-semibold text-white line-clamp-2 drop-shadow-sm"
                    >
                      {anime.title}
                    </BidiText>
                    <p className="text-[11px] text-white/75 mt-0.5 text-left">
                      {anime.time ? (
                        <>
                          <span>{anime.time}</span>
                          <span className="mx-1.5 opacity-50">|</span>
                        </>
                      ) : null}
                      <span className="text-white/90 font-medium">
                        قسمت {toPersianNumber(anime.episode)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </AnimePrefetchLink>
          ))}
        </div>
      ) : (
        <div className="mx-4 mt-2 rounded-2xl border border-dashed border-border bg-muted/20 flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
            <Calendar01Icon className="w-7 h-7 text-muted-foreground/50" />
          </div>
          <p className="text-sm font-medium text-foreground">روز خالی</p>
          <p className="text-xs text-muted-foreground mt-2 leading-6 max-w-[240px]">
            {activeDay} انیمه‌ای در برنامه پخش این فصل ثبت نشده.
          </p>
        </div>
      )}

      <p className="text-[10px] text-muted-foreground/70 text-center px-6 pt-6 leading-5">
        داده از AniList · فقط عناوین موجود در شیوری قابل باز شدن هستند
      </p>
        </AnimatedTabContent>
      </div>
    </TabSwipeArea>
  )
}

export default Schedule
