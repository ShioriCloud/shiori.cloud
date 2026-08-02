import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import AnimePrefetchLink from '../components/AnimePrefetchLink'
import { BidiText } from '../components/BidiText'
import FavoriteAnimeEditor from '../components/FavoriteAnimeEditor'
import {
  Clock01Icon,
  Video01Icon,
  Building01Icon,
  Calendar01Icon,
  Calendar02Icon,
  CheckmarkCircle02Icon,
  LeftToRightListNumberIcon,
  UserIcon,
  Share08Icon,
  Download04Icon,
} from 'hugeicons-react'
import { ExternalLink } from 'lucide-react'
import { useUserAnimeList } from '../hooks/useUserAnimeList'
import { useNotifications } from '../hooks/useNotifications'
import { useTelegramApp } from '../hooks/useTelegramApp'
import { useAiringReminderStore } from '../store/airingReminderStore'
import {
  useAnilistNextAiringQuery,
  useAnimeDetailQuery,
  useSimilarAnimeQuery,
  useTranslatorLinksQuery,
} from '../hooks/queries/useAnimeQueries'
import { prefetchSimilarAnime } from '../hooks/queries/prefetch'
import { queryKeys } from '../hooks/queries/keys'
import { queryClient } from '../lib/queryClient'
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
import { exploreAllHref } from '@/lib/exploreParams'
import {
  formatAverageEpisodeSizeLabel,
  normalizeVideoEncode,
  normalizeVideoFileType,
  normalizeVideoResolution,
  resolveHardsubLanguage,
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
import { trackAnimeBrowse, trackEpisodeDownload } from '../lib/myListTracking'
import { hapticImpact, hapticNotification } from '../lib/telegramHaptics'
import { recordAnimeView } from '../services/shioriCatalog'
import { AddToShioriListButton } from '@/components/my-list/AddToShioriListButton'
import {
  formatSeriesMemberLabel,
  genreLabel,
  toJalaliDate,
  toPersianNumber,
  translateFormat,
  translateSeason,
  translateStatus,
} from '@/components/anime-detail/animeDetailLabels'
import {
  DetailSkeleton,
  TranslatorsTabSkeleton,
} from '@/components/anime-detail/AnimeDetailSkeletons'
import {
  FavoriteStatCard,
  NextAiringCard,
  ReminderStatCard,
  ScoreChip,
  posterStatusClass,
} from '@/components/anime-detail/AnimeDetailStatCards'
import {
  EpisodeDownloadCard,
  EpisodePackDownloadCard,
  EpisodeQualityNote,
  FreeEpisodeDownloadCard,
  FreeTokenWalletCard,
  MOCK_FREE_EPISODES,
  SubtitleDownloadCard,
  SubtitlePackDownloadCard,
  type Episode,
  type EpisodePack,
  type SubtitlePack,
} from '@/components/anime-detail/EpisodeDownloadCards'

import malLogo from '../assets/images/mal-logo.png'
import alLogo from '../assets/images/anilist-logo.svg'
import shioriLogo from '../assets/images/shiori.svg'

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
  next_airing?: { episode: number; airing_at: number } | null
  average_episode_size_bytes?: number | null
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
  { id: 'translators', label: 'مترجم' },
  { id: 'similar', label: 'مشابه' },
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
      <Download04Icon className="w-10 h-10 mx-auto text-muted-foreground/35" aria-hidden />
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
    isError,
    refetch,
    isPlaceholderData,
    isFetching: detailFetching,
  } = useAnimeDetailQuery(id)

  const anime = (animeData ?? null) as Anime | null
  const isPartialDetail =
    Boolean(animeData) && (isAnimeDetailShell(animeData) || isPlaceholderData)

  useEffect(() => {
    if (!anime || !id || isPartialDetail) return
    const canonical = animePublicSegment(anime)
    const current = decodeURIComponent(String(id))
    if (current === canonical) return
    // Seed the slug/uuid alias in RQ so URL rewrite does not trigger a second getById.
    queryClient.setQueryData(queryKeys.animeDetail(canonical), anime)
    queryClient.setQueryData(queryKeys.animeDetail(String(anime.id)), anime)
    navigate(`${animeDetailPath(anime)}${window.location.search}`, { replace: true })
  }, [anime, id, isPartialDetail, navigate])

  useEffect(() => {
    if (!anime?.id || isPartialDetail) return
    trackAnimeBrowse(anime.id)
  }, [anime?.id, isPartialDetail])

  useEffect(() => {
    if (!anime?.id || isPartialDetail) return
    const key = `shiori:anime-view:${String(anime.id)}`
    try {
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    } catch {
      // sessionStorage may be unavailable in some WebViews
    }
    void recordAnimeView(anime.id).catch(() => {
      // Non-blocking; popularity still works without a perfect count
    })
  }, [anime?.id, isPartialDetail])

  const airingStatusKey = String(anime?.airing_status ?? anime?.status ?? 'RELEASING')
    .trim()
    .toUpperCase()
  // Upcoming titles (first episode scheduled) use NOT_YET_RELEASED but still have AniList countdown.
  const canHaveNextAiring =
    airingStatusKey === 'RELEASING' || airingStatusKey === 'NOT_YET_RELEASED'
  // Non-blocking: fill countdown in background; never gate the detail skeleton.
  const needsClientNextAiring =
    Boolean(anime) &&
    !isPartialDetail &&
    !anime?.next_airing &&
    Boolean(anime?.anilist_id && anime.anilist_id > 0) &&
    canHaveNextAiring

  const { data: clientNextAiring } = useAnilistNextAiringQuery(
    anime?.anilist_id,
    needsClientNextAiring
  )

  const nextAiring = anime?.next_airing ?? clientNextAiring ?? null

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

  // Paint immediately from Home card shell / disk cache; hydrate episodes after.
  const catalogReady =
    Boolean(anime) && Boolean(id) && animeCardMatchesRouteParam(anime!, String(id))
  const detailReady = catalogReady
  const detailHydrated = catalogReady && !isPartialDetail
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

  const episodeSubtitlesList = useMemo(() => {
    const rows = Array.isArray(anime?.episodes) ? anime.episodes : []
    return rows
      .filter((ep) => Boolean(String(ep.subtitle_link ?? '').trim()))
      .slice()
      .sort((a, b) => Number(a.number) - Number(b.number))
  }, [anime?.episodes])
  const hasEpisodeSubtitles = episodeSubtitlesList.length > 0
  const hasAnySubtitles = hasSubtitlePacks || hasEpisodeSubtitles

  const isDonghua =
    String(anime?.format ?? '')
      .trim()
      .toUpperCase() === 'ONA (CHINESE)'
  const isMovie =
    String(anime?.format ?? '')
      .trim()
      .toUpperCase() === 'MOVIE'

  const anilistScoreLabel =
    typeof anime?.averageScore === 'number' && Number.isFinite(anime.averageScore)
      ? formatAnilistPercent(anime.averageScore, toPersianNumber)
      : '—'

  const resolvedMalScore =
    typeof anime?.malScore === 'number' && Number.isFinite(anime.malScore)
      ? anime.malScore
      : null

  const malScoreLabel =
    resolvedMalScore !== null ? toPersianNumber(resolvedMalScore.toFixed(1)) : '—'

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
      hapticImpact('medium')
      // Open first — Telegram showAlert can dismiss the sheet if shown before it.
      setProgressEditorOpen(true)
      await toggleFavorite(anime.id)
      hapticNotification('success')
    } catch (e) {
      setProgressEditorOpen(false)
      hapticNotification('error')
      showAlert(formatUserListSaveError(e))
    }
  }

  const handleAiringReminder = async () => {
    if (!anime || reminderBusy) return
    setReminderBusy(true)
    try {
      hapticImpact('light')
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
        hapticNotification('success')
        showAlert(
          'یادآوری قسمت جدید فعال شد. اعلان‌ها از طریق اینباکس مینی‌اپ و (در صورت فعال بودن) پیام تلگرام ارسال می‌شوند — تنظیمات را از پروفایل می‌توانید تغییر دهید.'
        )
      } else {
        showAlert('یادآوری قسمت جدید برای این انیمه غیرفعال شد.')
      }
    } catch (e) {
      hapticNotification('error')
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
    // Launch UX: only free episodes in mini-app; softsub/hardsub stay admin-only until gates reopen.
    const kindFilter: EpisodeKindTab = useLaunchDownloadTabs
      ? 'free'
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
  const averageEpisodeSizeLabel = useMemo(
    () => formatAverageEpisodeSizeLabel(anime?.average_episode_size_bytes),
    [anime?.average_episode_size_bytes]
  )

  if (!detailReady) {
    if (error && !catalogReady) {
      return (
        <div className="px-4 py-16 text-center space-y-3 pb-24">
          <p className="text-red-500 text-sm">{error}</p>
          <Button type="button" variant="secondary" onClick={() => refetch()}>
            تلاش مجدد
          </Button>
        </div>
      )
    }
    return <DetailSkeleton />
  }

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

  const recordEpisodeDownload = (episode: Episode) => {
    trackEpisodeDownload({
      animeId: String(anime.id),
      animeTitle: anime.title,
      animeImage: anime.image,
      episodeNumber: episode.number,
      episodeTitle: episode.title,
      quality: videoResolution,
    })
  }

  return (
    <div className="pb-24 bg-background text-foreground">
      {/* Hero — هم‌سبک TranslatorProfile */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-52 overflow-hidden">
          {coverImage ? (
            <img src={coverImage} alt="" className="w-full h-full object-cover opacity-45" />
          ) : (
            <div className="w-full h-full bg-muted" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/30 to-background" />
        </div>

        <div className="relative z-10 pt-24 px-4 pb-2 flex flex-col items-center">
          <div className="relative">
            <div className="w-32 aspect-[2/3] rounded-2xl overflow-hidden border-4 border-background bg-muted shadow-lg ring-2 ring-primary-400/25">
              <img src={anime.image} alt={anime.title} className="w-full h-full object-cover" />
            </div>
            {statusKey ? (
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
                  navigate(exploreAllHref({ genreSlugs: [genre.slug] }))
                }
              >
                {genreLabel(genre)}
              </button>
            ))}
          </div>

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
              href={anime.mal_id ? buildMalUrl(anime.mal_id) : undefined}
              onOpenLink={openLink}
            />
            <ScoreChip
              logo={alLogo}
              logoAlt="AniList"
              value={anilistScoreLabel}
              href={anime.anilist_id ? buildAnilistUrl(anime.anilist_id) : undefined}
              onOpenLink={openLink}
            />
          </div>
          {hardsubLanguage ? (
            <div
              className={cn(
                'mt-3 flex w-full items-center gap-3 rounded-2xl border px-3.5 py-2.5',
                hardsubLanguage === 'en'
                  ? 'border-amber-500/25 bg-gradient-to-l from-amber-500/[0.12] to-card/60'
                  : 'border-emerald-500/20 bg-gradient-to-l from-emerald-500/[0.08] to-card/60'
              )}
            >
              <CheckmarkCircle02Icon
                className={cn(
                  'h-5 w-5 shrink-0',
                  hardsubLanguage === 'en' ? 'text-amber-400' : 'text-emerald-400'
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-foreground">
                  {hardsubLanguage === 'en' ? 'زیرنویس انگلیسی' : 'زیرنویس چسبیده فارسی'}
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {hardsubLanguage === 'en'
                    ? 'تمام قسمت‌ها با زیرنویس انگلیسی چسبیده هستند'
                    : 'تمام قسمت‌ها دارای نسخه‌ی سافت‌ساب و هاردساب فارسی هستند.'}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {nextAiring ? (
        <NextAiringCard
          episode={nextAiring.episode}
          airingAt={nextAiring.airing_at}
        />
      ) : null}

      {/* Quick stats */}
      <div className="mx-4 mt-2 flex items-stretch gap-2">
        <ReminderStatCard
          active={reminderActive}
          busy={reminderBusy || updatingPreferences}
          onClick={() => {
            void handleAiringReminder()
          }}
        />
        <FavoriteStatCard
          active={favoriteActive}
          onClick={handleFavorite}
        />
      </div>

      <div className="mx-4 mt-2">
        <AddToShioriListButton animeId={anime.id} triggerClassName="w-full" />
      </div>

      {(anime.series?.members?.length ?? 0) > 1 ? (
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

      {/* Main tabs — sticky زیر هدر، استایل مثل Home */}
      <div className="sticky top-[var(--app-header-offset)] z-30 px-4 pt-5 pb-2 bg-background/90 backdrop-blur-md border-b border-border/50">
        <SegmentedTabs tabs={MAIN_TABS} active={activeTab} onChange={handleMainTabChange} />
      </div>

      {/* Tab content */}
      <div className="px-4 pt-4">
        {activeTab === 'info' && (
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
                        exploreAllHref({
                          listYear: anime.year,
                          listSeason: seasonKey as
                            | 'WINTER'
                            | 'SPRING'
                            | 'SUMMER'
                            | 'FALL',
                        })
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
        )}

        {activeTab === 'episodes' &&
          (isPartialDetail || (detailFetching && !detailHydrated) ? (
            <div className="space-y-2 py-2" aria-busy="true" aria-label="در حال بارگذاری قسمت‌ها">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-2xl bg-muted/60"
                />
              ))}
            </div>
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
                hasAnySubtitles ? (
                  <div className="space-y-4">
                    {hasSubtitlePacks ? (
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-foreground px-0.5">
                          پک زیرنویس
                        </h3>
                        {subtitlePacksList.map((p) => (
                          <SubtitlePackDownloadCard
                            key={String(p.id)}
                            pack={p}
                            onDownload={() => {
                              if (!p.subtitle_link) {
                                showAlert('لینک پک زیرنویس موجود نیست')
                                return
                              }
                              window.open(String(p.subtitle_link), '_blank')
                            }}
                          />
                        ))}
                      </div>
                    ) : null}

                    {hasEpisodeSubtitles ? (
                      <div className="space-y-2">
                        {hasSubtitlePacks ? (
                          <h3 className="text-sm font-semibold text-foreground px-0.5">
                            زیرنویس قسمت‌ها
                          </h3>
                        ) : null}
                        {episodeSubtitlesList.map((episode) => (
                          <SubtitleDownloadCard
                            key={`sub-${String(episode.id)}`}
                            episodeNumber={episode.number}
                            onDownload={() => {
                              if (!episode.subtitle_link) {
                                showAlert('زیرنویس برای این قسمت موجود نیست')
                                return
                              }
                              window.open(String(episode.subtitle_link), '_blank')
                            }}
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <EmptyBlock message="زیرنویسی ثبت نشده" />
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
              <EpisodeQualityNote
                resolution={videoResolution}
                encode={videoEncode}
                averageSizeLabel={averageEpisodeSizeLabel}
              />
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
                  {useLaunchDownloadTabs
                    ? 'قسمت رایگانی برای دانلود ثبت نشده'
                    : allEpisodesCount === 0 &&
                        episodePackAvailable &&
                        episodeKindTab === videoFileType
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
                                    recordEpisodeDownload(episode)
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
                      subscriptionLocked={
                        ENABLE_SUBSCRIPTION_DOWNLOAD_GATE &&
                        !useLaunchDownloadTabs &&
                        episodeKindTab !== 'free' &&
                        !hasActiveSubscription
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
                              recordEpisodeDownload(episode)
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
                        recordEpisodeDownload(episode)
                        window.open(String(link), '_blank')
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
                    <SubtitlePackDownloadCard
                      key={String(p.id)}
                      pack={p}
                      onDownload={() => {
                        if (!p.subtitle_link) {
                          showAlert('لینک پک زیرنویس موجود نیست')
                          return
                        }
                        window.open(String(p.subtitle_link), '_blank')
                      }}
                    />
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
          (translatorLinksPending ? (
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
