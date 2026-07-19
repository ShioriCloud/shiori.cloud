import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AnimePrefetchLink from '../components/AnimePrefetchLink'
import { BidiText } from '../components/BidiText'
import FavoriteAnimeEditor from '../components/FavoriteAnimeEditor'
import {
  FavouriteIcon,
  Clock01Icon,
  Video01Icon,
  Building01Icon,
  Calendar01Icon,
  Calendar02Icon,
  LeftToRightListNumberIcon,
  Download01Icon,
  UserIcon,
  Share08Icon,
  TelegramIcon,
  CheckmarkCircle02Icon,
} from 'hugeicons-react'
import { ExternalLink, Lock } from 'lucide-react'
import { useUserAnimeList } from '../hooks/useUserAnimeList'
import { useNotifications } from '../hooks/useNotifications'
import { useTelegramApp } from '../hooks/useTelegramApp'
import { useAiringReminderStore } from '../store/airingReminderStore'
import {
  useAnimeDetailQuery,
  useExternalScoresQuery,
  useSimilarAnimeQuery,
  useTranslatorLinksQuery,
} from '../hooks/queries/useAnimeQueries'
import { prefetchSimilarAnime } from '../hooks/queries/prefetch'
import { formatAnilistPercent } from '../services/externalScores'
import { formatUserListSaveError } from '../services/userListErrors'
import type { GenreItem } from '../types/catalog'
import {
  buildAnilistUrl,
  buildAnimeMiniAppLink,
  buildMalUrl,
  parseAnimeDetailTab,
} from '../utils/externalLinks'
import { isAnimeDetailShell } from '../utils/api'
import { animeCardMatchesRouteParam, animeDetailPath, animePublicSegment } from '../lib/animePaths'
import { MediaSpecTags } from '../components/anime/MediaSpecTags'
import {
  normalizeVideoEncode,
  normalizeVideoFileType,
  normalizeVideoResolution,
  resolveHardsubLanguage,
  videoQualityButtonLabel,
  type HardsubLanguage,
  type VideoEncode,
  type VideoFileType,
  type VideoResolution,
} from '../utils/animeMediaTags'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  useClaimFreeDownload,
  useDownloadTokenBalance,
} from '../hooks/useDownloadTokens'
import {
  useClaimEpisodePackDownload,
  useClaimPaidEpisodeDownload,
  useSubscriptionMe,
} from '../hooks/useSubscription'
import {
  ENABLE_FREE_TOKEN_WALLET_UI,
  ENABLE_SUBSCRIPTION_DOWNLOAD_GATE,
  SHOW_HARD_AND_FREE_DOWNLOAD_TABS,
} from '../config/monetizationFlags'

import malLogo from '../assets/images/mal-logo.png'
import alLogo from '../assets/images/anilist-logo.svg'
import shioriLogo from '../assets/images/shiori-logo.svg'

interface Episode {
  id: string | number
  number: number
  title: string
  download_link?: string
  subtitle_link?: string
  video_file_type?: 'softsub' | 'hardsub' | 'free'
}

interface SubtitlePack {
  id: string | number
  title?: string
  subtitle_link?: string
}

interface EpisodePack {
  title?: string | null
  download_link?: string | null
}

interface Anime {
  id: number | string
  slug?: string | null
  title: string
  title_romaji?: string | null
  image: string
  featured_image: string
  format?: string
  description: string
  status: string
  airing_status?: string
  genres: GenreItem[]
  episodes: Episode[]
  subtitles?: Array<{ subtitle_link?: string }>
  subtitle_packs?: SubtitlePack[]
  episode_pack?: EpisodePack | null
  episodes_count: number
  hardsub_language?: 'fa' | 'en'
  video_file_type?: 'softsub' | 'hardsub'
  video_resolution?: '480p' | '720p' | '1080p'
  video_encode?: 'x264' | 'x265' | 'x265_10bit' | 'bluray'
  averageScore?: number
  animeListScore?: number
  malScore?: number
  shioriScore?: number
  favoriteCount?: number
  anilist_id?: number
  mal_id?: number
  studios: string[]
  studio_links?: Array<{ slug: string; name: string }>
  producers: string[]
  season: string
  year?: number
  startDate: string
  endDate: string
  score?: number
  series?: {
    series_id: string
    title: string
    members: Array<{
      id: string | number
      slug?: string | null
      title: string
      image?: string
      sort_order: number
      label_fa: string | null
    }>
  } | null
}

type TabType = 'info' | 'episodes' | 'similar' | 'translators'
type EpisodeKindTab = 'hardsub' | 'softsub' | 'free'
/** Launch download sub-tabs (when hard/free kind tabs are hidden). */
type LaunchDownloadTab = 'episodes' | 'subtitles'

const MAIN_TABS: { id: TabType; label: string }[] = [
  { id: 'info', label: 'اطلاعات' },
  { id: 'episodes', label: 'دانلود' },
  { id: 'similar', label: 'مشابه' },
  { id: 'translators', label: 'مترجم' },
]

/** Softsub / hardsub / free — restored when SHOW_HARD_AND_FREE_DOWNLOAD_TABS is true */
const EPISODE_KIND_TABS: { id: EpisodeKindTab; label: string }[] = [
  { id: 'hardsub', label: 'هاردساب' },
  { id: 'softsub', label: 'سافت‌ساب' },
  { id: 'free', label: 'رایگان' },
]

const EPISODE_KIND_TABS_SUBSCRIBED: { id: EpisodeKindTab; label: string }[] = [
  { id: 'hardsub', label: 'هاردساب' },
  { id: 'softsub', label: 'سافت‌ساب' },
]

const LAUNCH_DOWNLOAD_TABS: { id: LaunchDownloadTab; label: string }[] = [
  { id: 'episodes', label: 'قسمت‌ها' },
  { id: 'subtitles', label: 'زیرنویس' },
]

const useLaunchDownloadTabs =
  !SHOW_HARD_AND_FREE_DOWNLOAD_TABS && !ENABLE_SUBSCRIPTION_DOWNLOAD_GATE

const toPersianNumber = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return String(num).replace(/[0-9]/g, (w) => persianDigits[+w])
}

/** برچسب فصل از پنل ادمین (label_fa) — با اعداد فارسی */
const formatSeriesMemberLabel = (member: {
  sort_order: number
  label_fa: string | null
}) => {
  const fromAdmin = String(member.label_fa ?? '').trim()
  if (fromAdmin) return toPersianNumber(fromAdmin)
  return `فصل ${toPersianNumber(member.sort_order)}`
}

const translateStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    RELEASING: 'در حال پخش',
    FINISHED: 'پایان یافته',
    NOT_YET_RELEASED: 'منتشر نشده',
    CANCELLED: 'لغو شده',
    HIATUS: 'متوقف شده',
  }
  return statusMap[status] || status
}

const translateSeason = (season: string) => {
  const seasonMap: Record<string, string> = {
    WINTER: 'زمستان',
    SPRING: 'بهار',
    SUMMER: 'تابستان',
    FALL: 'پاییز',
  }
  return seasonMap[String(season || '').toUpperCase()] || season
}

const translateFormat = (format?: string) => {
  const key = String(format ?? '')
    .trim()
    .toUpperCase()
  const map: Record<string, string> = {
    TV: 'سریالی',
    MOVIE: 'سینمایی',
    SPECIAL: 'قسمت ویژه',
    ONA: 'ONA',
    'ONA (CHINESE)': 'دونگهوا',
  }
  return map[key] || (format ?? '—')
}

const genreLabel = (g: GenreItem) => g.name_fa || g.name_en || g.slug

const toJalaliDate = (value?: string) => {
  if (!value) return 'نامشخص'

  const raw = String(value).trim()
  const match = raw.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)
  if (!match) return toPersianNumber(raw)

  const gy = Number(match[1])
  const gm = Number(match[2])
  const gd = Number(match[3])
  if (!Number.isFinite(gy) || !Number.isFinite(gm) || !Number.isFinite(gd))
    return toPersianNumber(raw)

  if (gy < 1700) {
    const pad2 = (n: number) => String(n).padStart(2, '0')
    return toPersianNumber(`${gy}/${pad2(gm)}/${pad2(gd)}`)
  }

  const g2j = (y: number, m: number, d: number) => {
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
    let jy = y <= 1600 ? 0 : 979
    y -= y <= 1600 ? 621 : 1600
    const gy2 = m > 2 ? y + 1 : y
    let days =
      365 * y +
      Math.floor((gy2 + 3) / 4) -
      Math.floor((gy2 + 99) / 100) +
      Math.floor((gy2 + 399) / 400) -
      80 +
      d +
      g_d_m[m - 1]
    jy += 33 * Math.floor(days / 12053)
    days %= 12053
    jy += 4 * Math.floor(days / 1461)
    days %= 1461
    if (days > 365) {
      jy += Math.floor((days - 1) / 365)
      days = (days - 1) % 365
    }
    const jm = days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30)
    const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30)
    return { jy, jm, jd }
  }

  const { jy, jm, jd } = g2j(gy, gm, gd)
  const pad2 = (n: number) => String(n).padStart(2, '0')
  return toPersianNumber(`${jy}/${pad2(jm)}/${pad2(jd)}`)
}

const PulseBlock = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-md bg-muted', className)} aria-hidden />
)

const DetailSkeleton = () => (
  <div className="pb-24 animate-pulse">
    <div className="relative">
      <div className="absolute inset-x-0 top-0 h-52 bg-muted" />
      <div className="relative z-10 pt-24 px-4 pb-2 flex flex-col items-center">
        <div className="w-32 aspect-[2/3] rounded-2xl bg-muted border-4 border-background" />
        <div className="h-6 w-56 bg-muted rounded mt-4" />
        <div className="flex gap-2 mt-3">
          <div className="h-6 w-16 bg-muted rounded-md" />
          <div className="h-6 w-16 bg-muted rounded-md" />
          <div className="h-6 w-16 bg-muted rounded-md" />
        </div>
      </div>
    </div>
    <div className="mx-4 mt-5 grid grid-cols-3 gap-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-16 rounded-xl bg-muted" />
      ))}
    </div>
    <div className="mx-4 mt-4 h-24 rounded-xl bg-muted" />
    <div className="mx-4 mt-5 h-10 rounded-xl bg-muted" />
    <div className="mx-4 mt-4 space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-14 rounded-xl bg-muted" />
      ))}
    </div>
  </div>
)

const TELEGRAM_BLUE = '#229ED9'

const StatsRowSkeleton = () => (
  <div className="mx-4 mt-5 flex items-stretch gap-2">
    <div className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card/60 px-3">
      <PulseBlock className="h-5 w-5 shrink-0 rounded" />
      <PulseBlock className="h-3 w-28" />
    </div>
    <PulseBlock className="h-12 w-12 shrink-0 rounded-xl" />
  </div>
)

const ScoreChipsSkeleton = () => (
  <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-2 py-1.5"
      >
        <PulseBlock className="w-5 h-5 rounded shrink-0" />
        <PulseBlock className="h-4 w-9" />
      </div>
    ))}
  </div>
)

const SeriesSwitcherSkeleton = () => (
  <div className="mx-4 mt-4">
    <PulseBlock className="h-4 w-24 mb-3 mx-auto" />
    <div className="flex gap-2 overflow-hidden px-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <PulseBlock key={i} className="h-[4.5rem] w-[7rem] shrink-0 rounded-xl" />
      ))}
    </div>
  </div>
)

const InfoTabSkeleton = () => (
  <div className="rounded-xl border border-border bg-card/60 divide-y divide-border overflow-hidden">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="flex items-center justify-between gap-3 px-4 py-3.5">
        <PulseBlock className="h-4 w-24" />
        <PulseBlock className="h-4 w-28" />
      </div>
    ))}
  </div>
)

const EpisodesTabSkeleton = () => (
  <div className="space-y-4">
    <PulseBlock className="h-10 w-full rounded-xl" />
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <PulseBlock key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  </div>
)

const SynopsisSkeleton = () => (
  <div className="mx-4 mt-4 rounded-xl border border-border bg-card/60 p-4 space-y-3">
    <PulseBlock className="h-4 w-24" />
    <div className="space-y-2">
      <PulseBlock className="h-3 w-full" />
      <PulseBlock className="h-3 w-full" />
      <PulseBlock className="h-3 w-11/12" />
      <PulseBlock className="h-3 w-4/5" />
    </div>
  </div>
)

const HeroTitleSkeleton = () => (
  <div className="relative w-full mt-3 px-10 space-y-2 flex flex-col items-center">
    <PulseBlock className="h-6 w-56" />
    <PulseBlock className="h-4 w-40" />
  </div>
)

const TranslatorsTabSkeleton = () => (
  <div className="space-y-2">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="flex items-center gap-3 rounded-xl border border-border bg-card/60 p-3"
      >
        <PulseBlock className="w-10 h-10 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <PulseBlock className="h-4 w-32" />
          <PulseBlock className="h-3 w-20" />
        </div>
      </div>
    ))}
  </div>
)

const ReminderStatCard = ({
  active,
  busy = false,
  onClick,
}: {
  active: boolean
  busy?: boolean
  onClick: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={busy}
    className={cn(
      'flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-center transition-colors disabled:opacity-60',
      active
        ? 'border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/15'
        : 'border-border bg-card/60 hover:bg-muted/40'
    )}
    aria-label={active ? 'یادآوری پخش فعال است' : 'یادآوری پخش در تلگرام'}
    aria-pressed={active}
  >
    {active ? (
      <CheckmarkCircle02Icon className="h-5 w-5 shrink-0 text-emerald-400" />
    ) : (
      <TelegramIcon className="h-5 w-5 shrink-0" style={{ color: TELEGRAM_BLUE }} />
    )}
    <span
      className={cn(
        'text-[12px] font-medium leading-tight',
        active ? 'text-emerald-300' : 'text-foreground'
      )}
    >
      {active ? 'یادآوری پخش فعال شد' : 'یادآوری پخش در تلگرام'}
    </span>
  </button>
)

const FavoriteStatCard = ({
  active,
  favoriteCount,
  favoriteCountLoading,
  onClick,
}: {
  active: boolean
  favoriteCount?: number
  favoriteCountLoading?: boolean
  onClick: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors',
      active
        ? 'border-red-500/35 bg-red-500/10 hover:bg-red-500/15'
        : 'border-border bg-card/60 hover:bg-muted/40'
    )}
    aria-label={active ? 'ویرایش پیشرفت و امتیاز' : 'افزودن به علاقه‌مندی‌ها'}
  >
    {favoriteCountLoading ? (
      <span
        className="absolute -top-1 -start-1 h-5 w-5 rounded-full bg-muted animate-pulse"
        aria-hidden
      />
    ) : typeof favoriteCount === 'number' && favoriteCount > 0 ? (
      <span
        className={cn(
          'absolute -top-1 -start-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[9px] font-semibold tabular-nums leading-none',
          active ? 'bg-red-500 text-white' : 'bg-muted-foreground text-background'
        )}
        aria-label={`${toPersianNumber(favoriteCount)} علاقه‌مند`}
      >
        {toPersianNumber(favoriteCount)}
      </span>
    ) : null}
    <FavouriteIcon
      className={cn(
        'h-5 w-5',
        active ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
      )}
    />
  </button>
)

const ScoreChip = ({
  value,
  logo,
  logoAlt,
  fallbackLabel,
  loading = false,
  href,
  onOpenLink,
  logoClassName,
  logoWrapClassName,
}: {
  value: string
  logo?: string
  logoAlt?: string
  fallbackLabel?: string
  loading?: boolean
  href?: string
  onOpenLink?: (url: string) => void
  logoClassName?: string
  logoWrapClassName?: string
}) => {
  const logoEl = logo ? (
    logoWrapClassName ? (
      <span
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded',
          logoWrapClassName
        )}
      >
        <img
          src={logo}
          className={cn('h-3.5 w-3.5 object-contain', logoClassName)}
          alt={logoAlt ?? ''}
        />
      </span>
    ) : (
      <img
        src={logo}
        className={cn('h-5 w-5 shrink-0 rounded', logoClassName)}
        alt={logoAlt ?? ''}
      />
    )
  ) : (
    <span className="text-[10px] font-bold text-yellow-500 leading-none shrink-0">
      {fallbackLabel ?? '—'}
    </span>
  )

  const inner = (
    <>
      {logoEl}
      {loading ? (
        <span className="h-4 w-9 rounded-md bg-muted animate-pulse" aria-hidden />
      ) : (
        <span className="text-sm font-semibold text-foreground tabular-nums">{value}</span>
      )}
    </>
  )

  const className = cn(
    'flex items-center gap-1.5 rounded-xl border border-border bg-card/60 px-2 py-1.5 transition-colors',
    href && !loading && 'hover:bg-muted/40 active:scale-[0.98] cursor-pointer'
  )

  if (href && onOpenLink && !loading) {
    return (
      <button
        type="button"
        className={className}
        aria-label={`${logoAlt ?? 'امتیاز'} در سایت مرجع`}
        onClick={() => onOpenLink(href)}
      >
        {inner}
      </button>
    )
  }

  return <div className={className}>{inner}</div>
}

const posterStatusClass = (status: string) => {
  switch (status) {
    case 'RELEASING':
      return 'bg-green-500/90 text-white'
    case 'FINISHED':
      return 'bg-slate-600/90 text-white'
    case 'NOT_YET_RELEASED':
      return 'bg-amber-500/90 text-white'
    case 'HIATUS':
      return 'bg-orange-500/90 text-white'
    case 'CANCELLED':
      return 'bg-red-600/90 text-white'
    default:
      return 'bg-muted/90 text-foreground border border-border'
  }
}

const SegmentedTabs = <T extends string>({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: { id: T; label: string }[]
  active: T
  onChange: (id: T) => void
  className?: string
}) => (
  <div className={cn('relative flex rounded-xl border border-border bg-muted/20 p-0', className)}>
    {tabs.map((tab) => {
      const isActive = active === tab.id
      return (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          aria-pressed={isActive}
          className={cn(
            'relative flex-1 py-2.5 rounded-xl text-sm transition-all duration-200',
            isActive
              ? 'text-primary-400 font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {isActive && (
            <span
              aria-hidden
              className="absolute inset-0 rounded-xl bg-primary-400/15 border border-primary-400/35 shadow-sm shadow-primary-400/10"
            />
          )}
          <span className="relative z-10">{tab.label}</span>
        </button>
      )
    })}
  </div>
)

const SeriesSeasonSwitcher = ({
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
      <div className="relative overflow-hidden rounded-2xl border border-primary-400/15 bg-gradient-to-br from-primary-500/[0.12] via-card/90 to-card/70 p-3.5 shadow-[0_8px_30px_-12px_rgba(99,102,241,0.35)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-10 -left-6 h-28 w-28 rounded-full bg-primary-400/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-8 -right-4 h-24 w-24 rounded-full bg-primary-300/10 blur-2xl"
        />

        <div className="relative mb-3 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {series.title || 'فصل‌های سری'}
            </p>
            <p className="text-[11px] text-muted-foreground">دسترسی سریع به سایر فصل‌های انیمه</p>
          </div>
          {progressLabel ? (
            <span className="shrink-0 rounded-full border border-primary-400/20 bg-primary-400/10 px-2.5 py-1 text-[10px] font-semibold tabular-nums text-primary-300">
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
                      ? 'border-primary-400 shadow-lg shadow-primary-400/30 ring-2 ring-primary-400/25'
                      : 'border-border/70 group-hover:border-primary-400/35'
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
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary-400 shadow-[0_0_8px_rgba(129,140,248,0.9)]" />
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

const InfoRow = ({
  icon,
  label,
  children,
}: {
  icon: ReactNode
  label: string
  children: ReactNode
}) => (
  <div className="flex items-start justify-between gap-3 px-4 py-3.5">
    <span className="text-muted-foreground text-sm flex items-center gap-2 shrink-0">
      {icon}
      {label}
    </span>
    <div className="text-foreground text-sm text-left min-w-0">{children}</div>
  </div>
)

const EmptyBlock = ({
  message,
  hint,
  action,
  icon,
}: {
  message: string
  hint?: string
  action?: { label: string; onClick: () => void }
  icon?: ReactNode
}) => (
  <div className="rounded-2xl border border-dashed border-border bg-muted/20 py-12 px-6 text-center space-y-3">
    {icon ?? (
      <Download01Icon className="w-10 h-10 mx-auto text-muted-foreground/35" aria-hidden />
    )}
    <p className="text-sm text-muted-foreground">{message}</p>
    {hint ? <p className="text-xs text-muted-foreground/75 leading-6">{hint}</p> : null}
    {action ? (
      <Button type="button" size="sm" variant="secondary" onClick={action.onClick}>
        {action.label}
      </Button>
    ) : null}
  </div>
)

const SimilarPosterCard = ({
  anime,
}: {
  anime: { id: number | string; slug?: string | null; title: string; image: string }
}) => (
  <AnimePrefetchLink
    animeId={animePublicSegment(anime)}
    to={animeDetailPath(anime)}
    className="group block active:scale-[0.98] transition-transform"
    aria-label={`مشاهده ${anime.title}`}
  >
    <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-border bg-muted shadow-sm">
      <img
        src={anime.image}
        alt=""
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-2 pt-10">
        <BidiText as="h3" className="text-xs font-semibold text-white line-clamp-2 leading-5">
          {anime.title}
        </BidiText>
      </div>
    </div>
  </AnimePrefetchLink>
)

const EpisodeDownloadCard = ({
  episode,
  showSubtitleButton,
  hardsubLanguage,
  videoFileType,
  videoResolution,
  videoEncode,
  subscriptionLocked = false,
  onDownloadAvailable,
  onSubtitle,
  onLockedQuality,
}: {
  episode: Episode
  showSubtitleButton: boolean
  hardsubLanguage: HardsubLanguage
  videoFileType: VideoFileType
  videoResolution: VideoResolution
  videoEncode: VideoEncode
  subscriptionLocked?: boolean
  onDownloadAvailable: () => void
  onSubtitle: () => void
  onLockedQuality: (quality: string) => void
}) => {
  const qualities = (
    [
      { id: '480p' as const, shortLabel: '480p' },
      { id: '720p' as const, shortLabel: '720p' },
      { id: '1080p' as const, shortLabel: '1080p' },
    ] as const
  ).map((quality) => {
    const available = !subscriptionLocked && quality.id === videoResolution
    return {
      ...quality,
      available,
      label: available
        ? videoQualityButtonLabel(videoResolution, videoEncode)
        : quality.shortLabel,
    }
  })

  return (
  <div className="overflow-hidden rounded-xl border border-border bg-card/60">
    <div className="flex items-center justify-between gap-3 px-3 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <p className="shrink-0 text-sm font-semibold text-foreground">
          قسمت {toPersianNumber(episode.number)}
        </p>
        <MediaSpecTags
          hardsubLanguage={hardsubLanguage}
          videoFileType={videoFileType}
        />
      </div>
      {showSubtitleButton ? (
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="shrink-0 gap-1"
          onClick={onSubtitle}
        >
          <Download01Icon className="h-3.5 w-3.5" />
          زیرنویس
        </Button>
      ) : null}
    </div>

    <div className="grid grid-cols-3 gap-1.5 border-t border-border/60 bg-muted/10 p-2">
      {qualities.map((quality) => {
        const isAvailable = quality.available

        return (
          <button
            key={quality.id}
            type="button"
            aria-disabled={!isAvailable}
            aria-label={
              subscriptionLocked
                ? `دانلود قسمت ${episode.number} نیازمند اشتراک`
                : isAvailable
                  ? `دانلود قسمت ${episode.number} با کیفیت ${quality.label}`
                  : `کیفیت ${quality.label} فعلاً در دسترس نیست`
            }
            className={cn(
              'flex min-h-[3.25rem] flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-center transition-colors',
              isAvailable
                ? 'border-primary-400/35 bg-primary-400/10 text-primary-200 hover:bg-primary-400/15 active:scale-[0.98]'
                : 'cursor-not-allowed border-border/60 bg-muted/20 text-muted-foreground opacity-70'
            )}
            onClick={() => {
              if (subscriptionLocked) {
                onLockedQuality('اشتراک')
                return
              }
              if (isAvailable) {
                onDownloadAvailable()
                return
              }
              onLockedQuality(quality.label)
            }}
          >
            {isAvailable ? (
              <Download01Icon className="h-4 w-4 shrink-0" />
            ) : (
              <Lock className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
            )}
            <span
              className={cn(
                'font-semibold tabular-nums leading-tight',
                isAvailable && quality.label.length > 8 ? 'text-[10px]' : 'text-xs'
              )}
            >
              {subscriptionLocked ? 'قفل' : quality.label}
            </span>
          </button>
        )
      })}
    </div>
  </div>
  )
}

const EpisodePackDownloadCard = ({
  pack,
  hardsubLanguage,
  videoFileType,
  onDownload,
  locked = false,
}: {
  pack: EpisodePack
  hardsubLanguage: HardsubLanguage
  videoFileType: VideoFileType
  onDownload: () => void
  locked?: boolean
}) => (
  <div className="episode-pack-card-wrap">
    <div className="episode-pack-card-inner flex items-center justify-between gap-3 bg-card p-3">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <p className="min-w-0 truncate text-sm font-semibold text-foreground">
          {pack.title?.trim() || 'دانلود تمام قسمت‌ها'}
        </p>
        <MediaSpecTags
          hardsubLanguage={hardsubLanguage}
          videoFileType={videoFileType}
        />
      </div>
      <Button
        type="button"
        size="sm"
        className="shrink-0 gap-1 font-semibold"
        variant={locked ? 'secondary' : 'default'}
        onClick={onDownload}
      >
        {locked ? <Lock className="w-3.5 h-3.5" /> : <Download01Icon className="w-3.5 h-3.5" />}
        {locked ? 'اشتراک' : 'دانلود'}
      </Button>
    </div>
  </div>
)

const FREE_QUALITY_LABEL = '1080p x265 10bit'

const MOCK_FREE_EPISODES: Episode[] = [
  {
    id: 'mock-free-1',
    number: 1,
    title: 'نمونه قسمت ۱',
    download_link: 'https://t.me/ShioriUploadBot?start=get_free_demo',
    video_file_type: 'free',
  },
  {
    id: 'mock-free-2',
    number: 2,
    title: 'نمونه قسمت ۲',
    download_link: 'https://t.me/ShioriUploadBot?start=get_free_demo',
    video_file_type: 'free',
  },
  {
    id: 'mock-free-3',
    number: 3,
    title: 'نمونه قسمت ۳',
    download_link: 'https://t.me/ShioriUploadBot?start=get_free_demo',
    video_file_type: 'free',
  },
]

const FreeTokenWalletCard = ({
  balance,
  pending,
  exhausted,
  isMock,
}: {
  balance: number
  pending: boolean
  exhausted: boolean
  isMock?: boolean
}) => (
  <div
    className={cn(
      'overflow-hidden rounded-2xl border p-4',
      exhausted
        ? 'border-amber-500/35 bg-gradient-to-br from-amber-500/15 to-card/80'
        : 'border-border bg-gradient-to-br from-primary-400/10 via-card/80 to-card/60'
    )}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-semibold text-foreground">کیف توکن رایگان</p>
          {isMock ? (
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              نمونه
            </span>
          ) : null}
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          هر دانلود رایگان ۱ توکن · کیفیت ثابت {FREE_QUALITY_LABEL}
        </p>
      </div>
      <div className="shrink-0 rounded-xl border border-border/70 bg-background/50 px-3 py-2 text-center">
        <p className="text-[10px] text-muted-foreground">موجودی</p>
        <p className="text-xl font-bold tabular-nums leading-tight text-foreground">
          {pending ? '…' : toPersianNumber(balance)}
        </p>
      </div>
    </div>
    {exhausted ? (
      <div className="mt-3 space-y-2 border-t border-border/50 pt-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          توکن‌ها تمام شده. با اشتراک ماهانه به سافت‌ساب و هاردساب بدون محدودیت دسترسی دارید.
        </p>
        <Button asChild size="sm" className="w-full gap-1">
          <Link to="/subscribe">خرید اشتراک ماهانه</Link>
        </Button>
      </div>
    ) : (
      <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/50 pt-3">
        <p className="text-[11px] text-muted-foreground">دسترسی نامحدود سافت/هارد</p>
        <Button asChild size="sm" variant="secondary">
          <Link to="/subscribe">اشتراک</Link>
        </Button>
      </div>
    )}
  </div>
)

const FreeEpisodeDownloadCard = ({
  episode,
  claiming,
  disabled,
  onClaim,
}: {
  episode: Episode
  claiming: boolean
  disabled: boolean
  onClaim: () => void
}) => (
  <div className="overflow-hidden rounded-xl border border-border bg-card/60">
    <div className="flex items-center justify-between gap-3 px-3 py-3">
      <div className="min-w-0">
        <p className="shrink-0 text-sm font-semibold text-foreground">
          قسمت {toPersianNumber(episode.number)}
        </p>
        {episode.title ? (
          <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{episode.title}</p>
        ) : null}
      </div>
    </div>
    <div className="border-t border-border/60 bg-muted/10 p-2">
      <button
        type="button"
        disabled={disabled || claiming}
        aria-label={`دانلود رایگان قسمت ${episode.number} با کیفیت ${FREE_QUALITY_LABEL}`}
        className={cn(
          'flex min-h-[3.25rem] w-full flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 text-center transition-colors',
          disabled
            ? 'cursor-not-allowed border-border/60 bg-muted/20 text-muted-foreground opacity-70'
            : 'border-primary-400/35 bg-primary-400/10 text-primary-200 hover:bg-primary-400/15 active:scale-[0.98]'
        )}
        onClick={onClaim}
      >
        <Download01Icon className="h-4 w-4 shrink-0" />
        <span className="text-[10px] font-semibold tabular-nums leading-tight">
          {claiming ? '…' : FREE_QUALITY_LABEL}
        </span>
        <span className="text-[10px] text-muted-foreground">۱ توکن</span>
      </button>
    </div>
  </div>
)

const AnimeDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { toggleFavorite, isFavorite, getProgress, saveProgress, isSaving: isSavingProgress } =
    useUserAnimeList({ syncRemoteList: false })
  const { preferences, updatePreferences, updatingPreferences } = useNotifications()
  const { showAlert, openLink, shareUrl } = useTelegramApp()
  const [reminderBusy, setReminderBusy] = useState(false)
  const reminderAnimeIds = useAiringReminderStore((s) => s.reminderAnimeIds)
  const toggleAiringReminder = useAiringReminderStore((s) => s.toggleReminder)

  const {
    data: animeData,
    isLoading,
    isError,
    refetch,
    isPlaceholderData,
  } = useAnimeDetailQuery(id)

  const anime = (animeData ?? null) as Anime | null

  const favoriteCount = anime?.favoriteCount
  const favoriteCountPending = Boolean(anime) && favoriteCount === undefined && isLoading

  useEffect(() => {
    if (!anime || !id || isPlaceholderData) return
    const canonical = animePublicSegment(anime)
    if (decodeURIComponent(id) === canonical) return
    navigate(`${animeDetailPath(anime)}${window.location.search}`, { replace: true })
  }, [anime, id, isPlaceholderData, navigate])

  const externalIds = useMemo(
    () => ({
      anilist_id: anime?.anilist_id,
      mal_id: anime?.mal_id,
    }),
    [anime?.anilist_id, anime?.mal_id]
  )

  const needsLiveAnilist =
    Boolean(anime?.anilist_id && anime.anilist_id > 0) &&
    !(typeof anime?.averageScore === 'number' && Number.isFinite(anime.averageScore))

  const needsLiveMal =
    Boolean(anime?.mal_id && anime.mal_id > 0) &&
    !(typeof anime?.malScore === 'number' && Number.isFinite(anime.malScore))

  const needsLiveScores = needsLiveAnilist || needsLiveMal

  const {
    data: liveScores,
    isFetching: liveScoresFetching,
  } = useExternalScoresQuery(externalIds, Boolean(anime) && needsLiveScores)

  const [activeTab, setActiveTab] = useState<TabType>(() =>
    parseAnimeDetailTab(searchParams.get('tab'))
  )
  const [episodeKindTab, setEpisodeKindTab] = useState<EpisodeKindTab>('softsub')
  const [launchDownloadTab, setLaunchDownloadTab] = useState<LaunchDownloadTab>('episodes')
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [progressEditorOpen, setProgressEditorOpen] = useState(false)

  const {
    data: translatorLinks = [],
    isPending: translatorLinksPending,
  } = useTranslatorLinksQuery(anime?.id, activeTab === 'translators')

  const claimFreeDownloadMutation = useClaimFreeDownload()
  const claimPaidEpisodeMutation = useClaimPaidEpisodeDownload()
  const claimEpisodePackMutation = useClaimEpisodePackDownload()
  // Subscription + token funnel (disabled for initial launch — flip flags in monetizationFlags.ts)
  const { data: subscriptionMe } = useSubscriptionMe(
    ENABLE_SUBSCRIPTION_DOWNLOAD_GATE && activeTab === 'episodes'
  )
  const hasActiveSubscription = ENABLE_SUBSCRIPTION_DOWNLOAD_GATE
    ? Boolean(subscriptionMe?.active)
    : true
  const {
    data: tokenBalanceData,
    isPending: tokenBalancePending,
  } = useDownloadTokenBalance(
    ENABLE_FREE_TOKEN_WALLET_UI &&
      activeTab === 'episodes' &&
      episodeKindTab === 'free' &&
      !hasActiveSubscription
  )
  const [claimingEpisodeId, setClaimingEpisodeId] = useState<string | null>(null)
  const [showDonatePrompt, setShowDonatePrompt] = useState(false)
  const [mockTokenBalance, setMockTokenBalance] = useState(10)

  useEffect(() => {
    if (
      ENABLE_SUBSCRIPTION_DOWNLOAD_GATE &&
      hasActiveSubscription &&
      episodeKindTab === 'free'
    ) {
      setEpisodeKindTab('softsub')
    }
  }, [hasActiveSubscription, episodeKindTab])

  const genreSlugs = useMemo(
    () => (anime?.genres || []).map((g) => g.slug).filter(Boolean),
    [anime?.genres]
  )

  const { data: similarCards = [], isLoading: similarLoading } = useSimilarAnimeQuery(
    anime?.id,
    genreSlugs,
    activeTab === 'similar' && Boolean(anime)
  )

  const similarAnime = useMemo(
    () => similarCards.map((c) => ({ id: c.id, title: c.title, image: c.image })),
    [similarCards]
  )

  const loading = isLoading && !anime
  const detailPending =
    isPlaceholderData ||
    (Boolean(anime) && Boolean(id) && !animeCardMatchesRouteParam(anime!, String(id)))
  const isCardShell = isAnimeDetailShell(animeData)
  const heroPending = detailPending && !isCardShell
  const error = isError ? 'خطا در بارگذاری اطلاعات انیمه' : null

  const handleMainTabChange = (tab: TabType) => {
    setActiveTab(tab)
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (tab === 'info') next.delete('tab')
        else next.set('tab', tab)
        return next
      },
      { replace: true }
    )
  }

  useEffect(() => {
    setActiveTab(parseAnimeDetailTab(searchParams.get('tab')))
  }, [id, searchParams])

  useEffect(() => {
    setEpisodeKindTab('softsub')
    setLaunchDownloadTab('episodes')
    setShowFullDescription(false)
  }, [id])

  useEffect(() => {
    if (useLaunchDownloadTabs) return
    if (!anime?.episodes?.length) return
    const hasSoft = anime.episodes.some(
      (e) => (e.video_file_type ?? 'softsub') === 'softsub'
    )
    const hasHard = anime.episodes.some((e) => e.video_file_type === 'hardsub')
    const hasFree = anime.episodes.some((e) => e.video_file_type === 'free')
    setEpisodeKindTab((current) => {
      if (current === 'softsub' && hasSoft) return current
      if (current === 'hardsub' && hasHard) return current
      if (current === 'free' && hasFree) return current
      if (hasSoft) return 'softsub'
      if (hasHard) return 'hardsub'
      if (hasFree) return 'free'
      return 'softsub'
    })
  }, [anime?.id, anime?.episodes])

  useEffect(() => {
    if (activeTab === 'similar' && anime?.id && genreSlugs.length > 0) {
      prefetchSimilarAnime(anime.id, genreSlugs)
    }
  }, [activeTab, anime?.id, genreSlugs])

  const isFinished =
    String(anime?.airing_status ?? anime?.status ?? '')
      .trim()
      .toUpperCase() === 'FINISHED'

  const showSubtitlePacks =
    Boolean(isFinished) && Array.isArray(anime?.subtitle_packs) && anime.subtitle_packs.length > 0

  const subtitlePacksList = Array.isArray(anime?.subtitle_packs) ? anime.subtitle_packs : []
  const hasSubtitlePacks = subtitlePacksList.length > 0

  const isDonghua =
    String(anime?.format ?? '')
      .trim()
      .toUpperCase() === 'ONA (CHINESE)'
  const isMovie =
    String(anime?.format ?? '')
      .trim()
      .toUpperCase() === 'MOVIE'

  const anilistScoreLabel = (() => {
    if (typeof anime?.averageScore === 'number' && Number.isFinite(anime.averageScore)) {
      return formatAnilistPercent(anime.averageScore, toPersianNumber)
    }
    if (
      typeof liveScores?.anilistScore === 'number' &&
      Number.isFinite(liveScores.anilistScore) &&
      liveScores.anilistScore > 0
    ) {
      return `${toPersianNumber(Math.round(liveScores.anilistScore))}٪`
    }
    return '—'
  })()

  const resolvedMalScore =
    liveScores?.malScore ?? (typeof anime?.malScore === 'number' ? anime.malScore : null)

  const malScoreLabel =
    resolvedMalScore !== null ? toPersianNumber(resolvedMalScore.toFixed(1)) : '—'

  const malChipLoading = needsLiveMal && liveScoresFetching && resolvedMalScore === null
  const anilistChipLoading =
    needsLiveAnilist && liveScoresFetching && anilistScoreLabel === '—'

  const handleShare = () => {
    if (!anime) return
    const link = buildAnimeMiniAppLink(animePublicSegment(anime), activeTab)
    shareUrl(link, `${anime.title} — شیوری`)
  }

  /** امتیاز شیوری — میانگین امتیاز کاربران */
  const shioriScoreValue = (() => {
    const raw = anime?.shioriScore as number | string | null | undefined
    if (typeof raw === 'number' && Number.isFinite(raw)) return raw
    if (raw == null || raw === '') return null
    const n = Number(raw)
    return Number.isFinite(n) ? n : null
  })()
  const shioriScoreLabel =
    shioriScoreValue != null ? toPersianNumber(shioriScoreValue.toFixed(1)) : '—'

  const statusKey = String(anime?.airing_status ?? anime?.status ?? '')
    .trim()
    .toUpperCase()

  const handleFavorite = async () => {
    if (!anime) return
    if (isFavorite(anime.id)) {
      setProgressEditorOpen(true)
      return
    }
    try {
      // Open first — Telegram showAlert can dismiss the sheet if shown before it.
      setProgressEditorOpen(true)
      await toggleFavorite(anime.id)
    } catch (e) {
      setProgressEditorOpen(false)
      showAlert(formatUserListSaveError(e))
    }
  }

  const handleAiringReminder = async () => {
    if (!anime || reminderBusy) return
    setReminderBusy(true)
    try {
      const nowOn = toggleAiringReminder(anime.id)
      if (nowOn) {
        const prefsNeedUpdate =
          preferences?.notify_new_episode === false || preferences?.notify_telegram_dm === false
        if (prefsNeedUpdate) {
          await updatePreferences({
            notify_new_episode: true,
            notify_telegram_dm: true,
          })
        }
        showAlert('یادآوری پخش در تلگرام فعال شد')
      } else {
        showAlert('یادآوری پخش غیرفعال شد')
      }
    } catch (e) {
      showAlert(formatUserListSaveError(e))
    } finally {
      setReminderBusy(false)
    }
  }

  const handleSaveProgress = async (progress: {
    episodesWatched: number
    userRating: number | null
  }) => {
    if (!anime) return
    try {
      await saveProgress(anime.id, progress)
      setProgressEditorOpen(false)
      showAlert('پیشرفت و امتیاز ذخیره شد')
    } catch (e) {
      showAlert(formatUserListSaveError(e))
    }
  }

  const episodesForList = useMemo(() => {
    if (!anime) return []
    const kindFilter: EpisodeKindTab = useLaunchDownloadTabs
      ? 'softsub'
      : episodeKindTab
    return (anime.episodes || [])
      .filter((e) => (e.video_file_type ?? 'softsub') === kindFilter)
      .slice()
      .sort((a, b) => {
        const ea = typeof a.number === 'number' ? a.number : 0
        const eb = typeof b.number === 'number' ? b.number : 0
        if (ea !== eb) return ea - eb
        return String(a.id).localeCompare(String(b.id))
      })
  }, [anime, episodeKindTab])

  const usingMockFreeEpisodes =
    ENABLE_FREE_TOKEN_WALLET_UI &&
    import.meta.env.DEV &&
    episodeKindTab === 'free' &&
    episodesForList.length === 0

  const freeEpisodesForList = usingMockFreeEpisodes ? MOCK_FREE_EPISODES : episodesForList

  const tokenBalance = usingMockFreeEpisodes
    ? mockTokenBalance
    : (tokenBalanceData?.balance ?? null)
  const displayTokenBalance =
    typeof tokenBalance === 'number' ? tokenBalance : usingMockFreeEpisodes ? mockTokenBalance : 0
  const tokensExhausted =
    showDonatePrompt ||
    (usingMockFreeEpisodes
      ? mockTokenBalance < 1
      : typeof tokenBalance === 'number' && tokenBalance < 1)

  useEffect(() => {
    if (typeof tokenBalance === 'number' && tokenBalance > 0) {
      setShowDonatePrompt(false)
    }
  }, [tokenBalance])

  const allEpisodesCount = useMemo(() => anime?.episodes?.length ?? 0, [anime?.episodes])

  const episodePackLink = useMemo(
    () => anime?.episode_pack?.download_link?.trim() || null,
    [anime?.episode_pack?.download_link]
  )
  const episodePackAvailable = Boolean(
    episodePackLink || anime?.episode_pack
  )

  const hardsubLanguage = useMemo(
    () =>
      resolveHardsubLanguage({
        hardsub_language: anime?.hardsub_language,
        episodes: anime?.episodes,
        subtitle_packs: anime?.subtitle_packs,
        subtitles: anime?.subtitles,
      }),
    [anime?.hardsub_language, anime?.episodes, anime?.subtitle_packs, anime?.subtitles]
  )

  const videoFileType = useMemo(
    () => normalizeVideoFileType(anime?.video_file_type),
    [anime?.video_file_type]
  )
  const videoResolution = useMemo(
    () => normalizeVideoResolution(anime?.video_resolution),
    [anime?.video_resolution]
  )
  const videoEncode = useMemo(
    () => normalizeVideoEncode(anime?.video_encode),
    [anime?.video_encode]
  )

  if (loading) return <DetailSkeleton />

  if (error || !anime) {
    return (
      <div className="px-4 py-16 text-center space-y-3 pb-24">
        <p className="text-red-500 text-sm">{error || 'انیمه مورد نظر یافت نشد'}</p>
        <Button type="button" variant="secondary" onClick={() => refetch()}>
          تلاش مجدد
        </Button>
      </div>
    )
  }

  const coverImage = anime.featured_image || anime.image
  const description = anime.description?.trim() || 'توضیحاتی ثبت نشده.'
  const shouldTruncate = description.length > 180
  const truncatedDescription =
    shouldTruncate && !showFullDescription ? `${description.substring(0, 180)}…` : description

  const favoriteActive = isFavorite(anime.id)
  const reminderActive = reminderAnimeIds.some((id) => String(id) === String(anime.id))

  return (
    <div className="pb-24 bg-background text-foreground">
      {/* Hero — هم‌سبک TranslatorProfile */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-52 overflow-hidden">
          {heroPending ? (
            <PulseBlock className="w-full h-full rounded-none" />
          ) : coverImage ? (
            <img src={coverImage} alt="" className="w-full h-full object-cover opacity-45" />
          ) : (
            <div className="w-full h-full bg-muted" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/30 to-background" />
        </div>

        <div className="relative z-10 pt-24 px-4 pb-2 flex flex-col items-center">
          <div className="relative">
            <div className="w-32 aspect-[2/3] rounded-2xl overflow-hidden border-4 border-background bg-muted shadow-lg ring-2 ring-primary-400/25">
              {heroPending ? (
                <PulseBlock className="w-full h-full rounded-none" />
              ) : (
                <img src={anime.image} alt={anime.title} className="w-full h-full object-cover" />
              )}
            </div>
            {detailPending ? (
              <PulseBlock className="absolute top-2 right-2 h-5 w-14 rounded-md" />
            ) : statusKey ? (
              <span
                className={cn(
                  'absolute top-2 right-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-md backdrop-blur-sm',
                  posterStatusClass(statusKey)
                )}
              >
                {translateStatus(statusKey)}
              </span>
            ) : null}
          </div>

          {heroPending ? (
            <HeroTitleSkeleton />
          ) : (
            <div className="relative w-full mt-3 px-10">
              <BidiText as="h1" className="text-lg font-bold text-foreground text-center line-clamp-3 leading-7">
                {anime.title}
              </BidiText>
              {anime.title_romaji ? (
                <BidiText
                  as="p"
                  className="text-muted-foreground text-center text-sm leading-5 line-clamp-2"
                >
                  {anime.title_romaji}
                </BidiText>
              ) : null}
              <button
                type="button"
                onClick={handleShare}
                className="absolute left-0 top-0 p-2 rounded-xl border border-border bg-card/60 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                aria-label="اشتراک‌گذاری در تلگرام"
              >
                <Share08Icon className="w-4 h-4" />
              </button>
            </div>
          )}

          {!heroPending && (
            <div className="flex flex-wrap justify-center gap-1.5 mt-2">
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-muted/80 border border-border text-muted-foreground">
                {translateFormat(anime.format)}
              </span>
              {anime.genres.slice(0, 4).map((genre) => (
                <button
                  key={genre.slug}
                  type="button"
                  className="text-[10px] px-2 py-0.5 rounded-md bg-primary-500/15 border border-primary-400/25 text-primary-300 hover:bg-primary-500/25 transition-colors"
                  onClick={() =>
                    navigate(
                      `/search?genre=${encodeURIComponent(genre.slug)}&label=${encodeURIComponent(genreLabel(genre))}`
                    )
                  }
                >
                  {genreLabel(genre)}
                </button>
              ))}
            </div>
          )}

          {detailPending ? (
            <ScoreChipsSkeleton />
          ) : (
            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
              <ScoreChip
                logo={shioriLogo}
                logoAlt="شیوری"
                value={shioriScoreLabel}
                logoWrapClassName="bg-primary-500"
              />
              <ScoreChip
                logo={malLogo}
                logoAlt="MyAnimeList"
                value={malScoreLabel}
                loading={malChipLoading}
                href={anime.mal_id ? buildMalUrl(anime.mal_id) : undefined}
                onOpenLink={openLink}
              />
              <ScoreChip
                logo={alLogo}
                logoAlt="AniList"
                value={anilistScoreLabel}
                loading={anilistChipLoading}
                href={anime.anilist_id ? buildAnilistUrl(anime.anilist_id) : undefined}
                onOpenLink={openLink}
              />
            </div>
          )}
        </div>
      </div>

      {/* Quick stats */}
      {detailPending ? (
        <StatsRowSkeleton />
      ) : (
        <div className="mx-4 mt-5 flex items-stretch gap-2">
          <ReminderStatCard
            active={reminderActive}
            busy={reminderBusy || updatingPreferences}
            onClick={() => {
              void handleAiringReminder()
            }}
          />
          <FavoriteStatCard
            active={favoriteActive}
            favoriteCount={favoriteCount}
            favoriteCountLoading={favoriteCountPending && favoriteCount === undefined}
            onClick={handleFavorite}
          />
        </div>
      )}

      {detailPending ? (
        <SeriesSwitcherSkeleton />
      ) : (anime.series?.members?.length ?? 0) > 1 ? (
        <SeriesSeasonSwitcher
          series={anime.series!}
          currentAnimeId={anime.id}
          onSelect={(member) => navigate(animeDetailPath(member))}
        />
      ) : null}

      <FavoriteAnimeEditor
        open={progressEditorOpen}
        onOpenChange={setProgressEditorOpen}
        title={anime.title}
        image={anime.image}
        episodesCount={anime.episodes_count || episodesForList.length}
        progress={getProgress(anime.id)}
        saving={isSavingProgress}
        onSave={handleSaveProgress}
        onRemove={() => {
          void (async () => {
            try {
              await toggleFavorite(anime.id)
              setProgressEditorOpen(false)
              showAlert('از علاقه‌مندی‌ها حذف شد')
            } catch (e) {
              showAlert(formatUserListSaveError(e))
            }
          })()
        }}
      />

      {/* Synopsis */}
      {heroPending ? (
        <SynopsisSkeleton />
      ) : (
        <div className="mx-4 mt-4 rounded-xl border border-border bg-card/60 p-4">
          <h2 className="text-sm font-semibold text-foreground mb-2">خلاصه داستان</h2>
          <p className="text-sm text-muted-foreground leading-6 whitespace-pre-wrap">
            {truncatedDescription}
          </p>
          {shouldTruncate && (
            <button
              type="button"
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="mt-2 text-primary-400 text-xs font-medium"
            >
              {showFullDescription ? 'نمایش کمتر' : 'نمایش بیشتر'}
            </button>
          )}
        </div>
      )}

      {/* Main tabs — sticky زیر هدر، استایل مثل Home */}
      <div className="sticky top-14 z-30 px-4 pt-5 pb-2 bg-background/90 backdrop-blur-md border-b border-border/50">
        <SegmentedTabs tabs={MAIN_TABS} active={activeTab} onChange={handleMainTabChange} />
      </div>

      {/* Tab content */}
      <div className="px-4 pt-4">
        {activeTab === 'info' &&
          (detailPending ? (
            <InfoTabSkeleton />
          ) : (
          <div className="rounded-xl border border-border bg-card/60 divide-y divide-border overflow-hidden">
            <InfoRow
              icon={<Video01Icon className="w-4 h-4 text-primary-400 shrink-0" />}
              label="نوع"
            >
              {translateFormat(anime.format)}
            </InfoRow>
            <InfoRow
              icon={<LeftToRightListNumberIcon className="w-4 h-4 text-primary-400 shrink-0" />}
              label="تعداد قسمت‌ها"
            >
              {toPersianNumber(anime.episodes_count)} قسمت
            </InfoRow>
            <InfoRow
              icon={<Clock01Icon className="w-4 h-4 text-primary-400 shrink-0" />}
              label="وضعیت"
            >
              {translateStatus(anime.status)}
            </InfoRow>
            <InfoRow
              icon={<Building01Icon className="w-4 h-4 text-primary-400 shrink-0" />}
              label="استودیو"
            >
              {Array.isArray(anime.studio_links) && anime.studio_links.length > 0 ? (
                <div className="flex flex-wrap gap-x-1 justify-end">
                  {anime.studio_links.map((s, index) => (
                    <span key={s.slug || `${s.name}-${index}`}>
                      <button
                        type="button"
                        className="text-primary-300 font-medium hover:underline"
                        onClick={() => {
                          if (!s.slug) return
                          const studioName = s.name || s.slug
                          navigate(
                            `/studios/${encodeURIComponent(String(s.slug))}?name=${encodeURIComponent(studioName)}`
                          )
                        }}
                      >
                        {s.name || s.slug}
                      </button>
                      {index < anime.studio_links!.length - 1 ? '، ' : ''}
                    </span>
                  ))}
                </div>
              ) : Array.isArray(anime.studios) && anime.studios.length > 0 ? (
                anime.studios.join('، ')
              ) : (
                'نامشخص'
              )}
            </InfoRow>

            {!isDonghua && (
              <InfoRow
                icon={<Calendar01Icon className="w-4 h-4 text-primary-400 shrink-0" />}
                label="فصل پخش"
              >
                {anime.season && typeof anime.year === 'number' ? (
                  <button
                    type="button"
                    className="text-primary-300 font-medium hover:underline"
                    onClick={() => {
                      const seasonKey = String(anime.season).toUpperCase()
                      navigate(
                        `/search?year=${anime.year}&season=${encodeURIComponent(seasonKey)}`
                      )
                    }}
                  >
                    {translateSeason(String(anime.season).toUpperCase())}{' '}
                    {toPersianNumber(anime.year)}
                  </button>
                ) : (
                  anime.season || 'نامشخص'
                )}
              </InfoRow>
            )}

            <InfoRow
              icon={<Calendar02Icon className="w-4 h-4 text-primary-400 shrink-0" />}
              label={isMovie ? 'تاریخ اکران' : 'تاریخ شروع'}
            >
              {toJalaliDate(anime.startDate)}
            </InfoRow>

            {!isMovie && (
              <InfoRow
                icon={<Calendar02Icon className="w-4 h-4 text-primary-400 shrink-0" />}
                label="تاریخ پایان"
              >
                {toJalaliDate(anime.endDate)}
              </InfoRow>
            )}
          </div>
          ))}

        {activeTab === 'episodes' &&
          (detailPending ? (
            <EpisodesTabSkeleton />
          ) : allEpisodesCount === 0 && !episodePackAvailable && !hasSubtitlePacks ? (
            <EmptyBlock
              message={
                statusKey === 'RELEASING'
                  ? 'هنوز قسمتی برای دانلود ثبت نشده'
                  : 'فایل دانلودی برای این انیمه ثبت نشده'
              }
              hint={
                statusKey === 'RELEASING'
                  ? 'با انتشار قسمت‌های جدید، لینک‌ها اینجا قرار می‌گیرند.'
                  : undefined
              }
            />
          ) : (
            <div className="space-y-3">
              <SegmentedTabs
                tabs={
                  useLaunchDownloadTabs
                    ? LAUNCH_DOWNLOAD_TABS
                    : ENABLE_SUBSCRIPTION_DOWNLOAD_GATE && hasActiveSubscription
                      ? EPISODE_KIND_TABS_SUBSCRIBED
                      : EPISODE_KIND_TABS
                }
                active={useLaunchDownloadTabs ? launchDownloadTab : episodeKindTab}
                onChange={(tab) => {
                  if (useLaunchDownloadTabs) {
                    setLaunchDownloadTab(tab as LaunchDownloadTab)
                    return
                  }
                  setEpisodeKindTab(tab as EpisodeKindTab)
                }}
                className="text-[13px]"
              />

              {useLaunchDownloadTabs && launchDownloadTab === 'subtitles' ? (
                hasSubtitlePacks ? (
                  <div className="space-y-2">
                    {subtitlePacksList.map((p) => (
                      <div
                        key={String(p.id)}
                        className="rounded-xl border border-border bg-card/60 p-3 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground line-clamp-1">
                            {p.title || 'پک زیرنویس'}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                            زیرنویس کامل
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="shrink-0 gap-1"
                          onClick={() => {
                            if (!p.subtitle_link) {
                              showAlert('لینک پک زیرنویس موجود نیست')
                              return
                            }
                            window.open(String(p.subtitle_link), '_blank')
                          }}
                        >
                          <Download01Icon className="w-3.5 h-3.5" />
                          دانلود
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyBlock message="پک زیرنویس ثبت نشده" />
                )
              ) : (
                <>
              {ENABLE_SUBSCRIPTION_DOWNLOAD_GATE &&
              !hasActiveSubscription &&
              (episodeKindTab === 'softsub' || episodeKindTab === 'hardsub') ? (
                <div className="rounded-xl border border-primary-400/30 bg-primary-400/10 p-3 space-y-2">
                  <p className="text-sm font-semibold text-foreground">
                    دانلود این بخش با اشتراک ماهانه
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    سافت‌ساب و هاردساب برای مشترکین باز است. از تب رایگان می‌توانید با توکن محدود امتحان
                    کنید.
                  </p>
                  <Button asChild size="sm" className="w-full">
                    <Link to="/subscribe">خرید اشتراک</Link>
                  </Button>
                </div>
              ) : null}
              {episodePackAvailable &&
              anime.episode_pack &&
              (useLaunchDownloadTabs
                ? launchDownloadTab === 'episodes'
                : episodeKindTab !== 'free') &&
              (useLaunchDownloadTabs ||
                episodeKindTab === videoFileType ||
                (ENABLE_SUBSCRIPTION_DOWNLOAD_GATE && hasActiveSubscription)) ? (
                <EpisodePackDownloadCard
                  pack={anime.episode_pack}
                  hardsubLanguage={hardsubLanguage}
                  videoFileType={videoFileType}
                  locked={
                    ENABLE_SUBSCRIPTION_DOWNLOAD_GATE && !hasActiveSubscription
                  }
                  onDownload={() => {
                    if (
                      ENABLE_SUBSCRIPTION_DOWNLOAD_GATE &&
                      !hasActiveSubscription
                    ) {
                      showAlert('برای دانلود پک، اشتراک ماهانه لازم است')
                      return
                    }
                    if (!ENABLE_SUBSCRIPTION_DOWNLOAD_GATE) {
                      const link =
                        anime.episode_pack?.download_link?.trim() || null
                      if (!link) {
                        showAlert('لینک پک موجود نیست')
                        return
                      }
                      window.open(link, '_blank')
                      return
                    }
                    void (async () => {
                      const result = await claimEpisodePackMutation.mutateAsync(
                        String(anime.id)
                      )
                      if (result.ok) {
                        window.open(result.download_link, '_blank')
                        return
                      }
                      if (result.code === 'subscription_required') {
                        showAlert(result.message)
                        return
                      }
                      showAlert(result.message || 'خطا در دانلود پک')
                    })()
                  }}
                />
              ) : null}
              {episodesForList.length === 0 &&
              !(
                !useLaunchDownloadTabs &&
                episodeKindTab === 'free' &&
                usingMockFreeEpisodes
              ) ? (
                <p className="text-xs text-muted-foreground text-center py-6">
                  {allEpisodesCount === 0 &&
                  episodePackAvailable &&
                  (useLaunchDownloadTabs || episodeKindTab === videoFileType)
                    ? 'لینک تک‌تک قسمت‌ها هنوز ثبت نشده.'
                    : 'قسمتی در این دسته ثبت نشده'}
                </p>
              ) : !useLaunchDownloadTabs &&
                episodeKindTab === 'free' &&
                ENABLE_FREE_TOKEN_WALLET_UI ? (
                <div className="space-y-3">
                  <FreeTokenWalletCard
                    balance={displayTokenBalance}
                    pending={!usingMockFreeEpisodes && tokenBalancePending}
                    exhausted={tokensExhausted}
                    isMock={usingMockFreeEpisodes}
                  />
                  {usingMockFreeEpisodes ? (
                    <p className="text-[11px] text-muted-foreground text-center px-1">
                      دیتای نمونه برای پیش‌نمایش UI — روی دانلود، توکن موک کم می‌شود.
                    </p>
                  ) : null}
                  {!tokensExhausted || usingMockFreeEpisodes ? (
                    <div className="space-y-2">
                      {freeEpisodesForList.map((episode) => {
                        const episodeId = String(episode.id)
                        const claiming = claimingEpisodeId === episodeId
                        return (
                          <FreeEpisodeDownloadCard
                            key={episodeId}
                            episode={episode}
                            claiming={claiming}
                            disabled={
                              tokensExhausted || claimFreeDownloadMutation.isPending
                            }
                            onClaim={() => {
                              void (async () => {
                                setClaimingEpisodeId(episodeId)
                                try {
                                  if (
                                    usingMockFreeEpisodes ||
                                    episodeId.startsWith('mock-free-')
                                  ) {
                                    if (mockTokenBalance < 1) {
                                      setShowDonatePrompt(true)
                                      showAlert('توکن‌های رایگان شما تمام شده')
                                      return
                                    }
                                    setMockTokenBalance((n) => Math.max(0, n - 1))
                                    showAlert(
                                      `نمونه: ۱ توکن کم شد · باقی‌مانده ${Math.max(0, mockTokenBalance - 1)}`
                                    )
                                    return
                                  }
                                  const result =
                                    await claimFreeDownloadMutation.mutateAsync(
                                      episodeId
                                    )
                                  if (result.ok) {
                                    window.open(result.download_link, '_blank')
                                    return
                                  }
                                  if (result.code === 'insufficient_tokens') {
                                    setShowDonatePrompt(true)
                                    showAlert('توکن‌های رایگان شما تمام شده')
                                    return
                                  }
                                  showAlert(result.message || 'خطا در دانلود رایگان')
                                } catch (e) {
                                  showAlert(
                                    e instanceof Error
                                      ? e.message
                                      : 'خطا در دانلود رایگان'
                                  )
                                } finally {
                                  setClaimingEpisodeId(null)
                                }
                              })()
                            }}
                          />
                        )
                      })}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="space-y-2">
                  {(!useLaunchDownloadTabs && episodeKindTab === 'free'
                    ? freeEpisodesForList
                    : episodesForList
                  ).map((episode) => (
                    <EpisodeDownloadCard
                      key={episode.id}
                      episode={episode}
                      hardsubLanguage={hardsubLanguage}
                      videoFileType={
                        episode.video_file_type === 'hardsub' ? 'hardsub' : 'softsub'
                      }
                      videoResolution={videoResolution}
                      videoEncode={videoEncode}
                      subscriptionLocked={
                        ENABLE_SUBSCRIPTION_DOWNLOAD_GATE &&
                        !useLaunchDownloadTabs &&
                        episodeKindTab !== 'free' &&
                        !hasActiveSubscription
                      }
                      showSubtitleButton={
                        (useLaunchDownloadTabs || episodeKindTab === 'softsub') &&
                        videoFileType === 'softsub' &&
                        (!isFinished || isMovie) &&
                        (!ENABLE_SUBSCRIPTION_DOWNLOAD_GATE || hasActiveSubscription)
                      }
                      onDownloadAvailable={() => {
                        if (
                          ENABLE_SUBSCRIPTION_DOWNLOAD_GATE &&
                          !useLaunchDownloadTabs &&
                          episodeKindTab !== 'free' &&
                          !hasActiveSubscription
                        ) {
                          showAlert(
                            'برای دانلود سافت‌ساب و هاردساب اشتراک ماهانه لازم است'
                          )
                          return
                        }
                        if (
                          ENABLE_SUBSCRIPTION_DOWNLOAD_GATE &&
                          !useLaunchDownloadTabs &&
                          episodeKindTab !== 'free'
                        ) {
                          void (async () => {
                            const result =
                              await claimPaidEpisodeMutation.mutateAsync(
                                String(episode.id)
                              )
                            if (result.ok) {
                              window.open(result.download_link, '_blank')
                              return
                            }
                            showAlert(result.message || 'خطا در دانلود')
                          })()
                          return
                        }
                        const link =
                          episode.download_link ||
                          `https://t.me/ShioriUploadBot?start=get_${episode.id}`
                        window.open(String(link), '_blank')
                      }}
                      onSubtitle={() => {
                        if (!episode.subtitle_link) {
                          showAlert('زیرنویس برای این قسمت موجود نیست')
                          return
                        }
                        window.open(String(episode.subtitle_link), '_blank')
                      }}
                      onLockedQuality={(quality) => {
                        if (
                          ENABLE_SUBSCRIPTION_DOWNLOAD_GATE &&
                          !hasActiveSubscription
                        ) {
                          showAlert('برای دانلود، اشتراک ماهانه لازم است')
                          return
                        }
                        showAlert(`دانلود ${quality} هنوز فعال نشده`)
                      }}
                    />
                  ))}
                </div>
              )}
              {!useLaunchDownloadTabs &&
              episodeKindTab === 'softsub' &&
              showSubtitlePacks ? (
                <div className="space-y-2 pt-1">
                  <h3 className="text-sm font-semibold text-foreground px-0.5">پک زیرنویس</h3>
                  {anime.subtitle_packs!.map((p) => (
                    <div
                      key={String(p.id)}
                      className="rounded-xl border border-border bg-card/60 p-3 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground line-clamp-1">
                          {p.title || 'پک زیرنویس'}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                          زیرنویس کامل
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="shrink-0 gap-1"
                        onClick={() => {
                          if (!p.subtitle_link) {
                            showAlert('لینک پک زیرنویس موجود نیست')
                            return
                          }
                          window.open(String(p.subtitle_link), '_blank')
                        }}
                      >
                        <Download01Icon className="w-3.5 h-3.5" />
                        دانلود
                      </Button>
                    </div>
                  ))}
                </div>
              ) : null}
                </>
              )}
            </div>
          ))}

        {activeTab === 'similar' && (
          <div className="space-y-3 pb-2">
            <div className="flex items-baseline justify-between">
              <h2 className="text-base font-semibold text-foreground">آثار مشابه</h2>
              <span className="text-xs text-muted-foreground">
                {similarLoading
                  ? '…'
                  : similarAnime.length > 0
                    ? `${toPersianNumber(similarAnime.length)} عنوان`
                    : 'خالی'}
              </span>
            </div>

            {similarLoading ? (
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-[2/3] rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : similarAnime.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {similarAnime.map((item) => (
                  <SimilarPosterCard key={item.id} anime={item} />
                ))}
              </div>
            ) : (
              <EmptyBlock
                message={
                  anime.genres.length > 0
                    ? 'انیمه مشابهی در کاتالوگ شیوری پیدا نشد.'
                    : 'ژانری برای پیشنهاد آثار مشابه ثبت نشده.'
                }
              />
            )}
          </div>
        )}

        {activeTab === 'translators' &&
          (detailPending || translatorLinksPending ? (
            <TranslatorsTabSkeleton />
          ) : translatorLinks.length === 0 ? (
            <EmptyBlock message="مترجمی ثبت نشده" />
          ) : (
            <div className="space-y-2">
              {translatorLinks.map((l) => (
                <Link
                  key={String(l.id)}
                  to={`/translators/${encodeURIComponent(String(l.translator.slug))}`}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card/60 p-3 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-muted border border-border shrink-0">
                      {l.translator.avatar_url ? (
                        <img
                          src={String(l.translator.avatar_url)}
                          alt={l.translator.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground line-clamp-1">
                        {l.translator.name}
                      </p>
                      {l.role ? (
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {l.role}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          ))}
      </div>
    </div>
  )
}

export default AnimeDetail
