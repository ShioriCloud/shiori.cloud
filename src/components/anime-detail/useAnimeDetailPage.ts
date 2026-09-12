import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useUserAnimeList } from '../../hooks/useUserAnimeList'
import { useNotifications } from '../../hooks/useNotifications'
import { useAiringReminders } from '../../hooks/useAiringReminders'
import { useTelegramApp } from '../../hooks/useTelegramApp'
import {
  useAnimeDetailQuery,
  useSimilarAnimeQuery,
  useTranslatorLinksQuery,
} from '../../hooks/queries/useAnimeQueries'
import { prefetchSimilarAnime } from '../../hooks/queries/prefetch'
import { queryKeys } from '../../hooks/queries/keys'
import { queryClient } from '../../lib/queryClient'
import { formatUserListSaveError } from '../../services/userListErrors'
import { isAnimeDetailShell } from '../../utils/api'
import { animeCardMatchesRouteParam, animeDetailPath, animePublicSegment } from '../../lib/animePaths'
import { parseAnimeDetailTab, buildAnimeMiniAppLink } from '../../utils/externalLinks'
import { trackAnimeBrowse } from '../../lib/myListTracking'
import { hapticImpact, hapticNotification } from '../../lib/telegramHaptics'
import { recordAnimeView } from '../../services/shioriCatalog'
import { getAnimeMediaTags, getAnimeScoreLabels } from './animeDetailMedia'
import { useAnimeDetailDownloads } from './useAnimeDetailDownloads'
import type { Anime, TabType } from './types'

export function useAnimeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { toggleFavorite, isFavorite, getProgress, saveProgress, isSaving: isSavingProgress } =
    useUserAnimeList({ syncRemoteList: false })
  const { preferences, updatePreferences, updatingPreferences } = useNotifications()
  const {
    isReminderOn,
    toggleReminder: toggleAiringReminder,
    isToggling: reminderToggling,
  } = useAiringReminders()
  const { showAlert, openLink, openTelegramLink, shareUrl } = useTelegramApp()
  const [reminderBusy, setReminderBusy] = useState(false)

  const {
    data: animeData,
    isError,
    refetch,
    isPlaceholderData,
  } = useAnimeDetailQuery(id)

  const anime = (animeData ?? null) as Anime | null

  useEffect(() => {
    if (!anime || !id || isPlaceholderData) return
    const canonical = animePublicSegment(anime)
    const current = decodeURIComponent(String(id))
    if (current === canonical) return
    // Seed the slug/uuid alias in RQ so URL rewrite does not trigger a second getById.
    queryClient.setQueryData(queryKeys.animeDetail(canonical), anime)
    queryClient.setQueryData(queryKeys.animeDetail(String(anime.id)), anime)
    navigate(`${animeDetailPath(anime)}${window.location.search}`, { replace: true })
  }, [anime, id, isPlaceholderData, navigate])

  useEffect(() => {
    if (!anime?.id || isPlaceholderData) return
    trackAnimeBrowse(anime.id)
  }, [anime?.id, isPlaceholderData])

  useEffect(() => {
    if (!anime?.id || isPlaceholderData) return
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
  }, [anime?.id, isPlaceholderData])

  const airingStatusKey = String(anime?.airing_status ?? anime?.status ?? 'RELEASING')
    .trim()
    .toUpperCase()
  // Upcoming titles (first episode scheduled) use NOT_YET_RELEASED.
  const canHaveNextAiring =
    airingStatusKey === 'RELEASING' || airingStatusKey === 'NOT_YET_RELEASED'
  const nextAiring = anime?.next_airing ?? null

  const [activeTab, setActiveTab] = useState<TabType>(() =>
    parseAnimeDetailTab(searchParams.get('tab'))
  )
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [progressEditorOpen, setProgressEditorOpen] = useState(false)

  const {
    data: translatorLinks = [],
    isPending: translatorLinksPending,
  } = useTranslatorLinksQuery(anime?.id, activeTab === 'translators')

  const downloads = useAnimeDetailDownloads({
    anime,
    activeTab,
    routeId: id,
  })

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

  // Wait for full catalog payload (shell/placeholder does not count as ready).
  // Scores come from DB columns only — no live AniList/MAL gate.
  const catalogReady =
    Boolean(anime) &&
    !isPlaceholderData &&
    !isAnimeDetailShell(animeData) &&
    Boolean(id) &&
    animeCardMatchesRouteParam(anime!, String(id))
  const detailReady = catalogReady
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
    setShowFullDescription(false)
  }, [id])

  useEffect(() => {
    if (activeTab === 'similar' && anime?.id && genreSlugs.length > 0) {
      prefetchSimilarAnime(anime.id, genreSlugs)
    }
  }, [activeTab, anime?.id, genreSlugs])

  const isDonghua =
    String(anime?.format ?? '')
      .trim()
      .toUpperCase() === 'ONA (CHINESE)'
  const isMovie =
    String(anime?.format ?? '')
      .trim()
      .toUpperCase() === 'MOVIE'

  const scores = anime ? getAnimeScoreLabels(anime) : null
  const mediaTags = useMemo(() => getAnimeMediaTags(anime), [anime])

  const statusKey = String(anime?.airing_status ?? anime?.status ?? '')
    .trim()
    .toUpperCase()

  const handleShare = () => {
    if (!anime) return
    const link = buildAnimeMiniAppLink(animePublicSegment(anime), activeTab)
    shareUrl(link, `${anime.title} — شیوری`)
  }

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
    if (!anime || reminderBusy || reminderToggling) return
    setReminderBusy(true)
    try {
      hapticImpact('light')
      const nowOn = await toggleAiringReminder(anime.id)
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

  return {
    navigate,
    anime,
    error,
    refetch,
    detailReady,
    catalogReady,
    activeTab,
    handleMainTabChange,
    showFullDescription,
    setShowFullDescription,
    progressEditorOpen,
    setProgressEditorOpen,
    translatorLinks,
    translatorLinksPending,
    similarAnime,
    similarLoading,
    nextAiring,
    canHaveNextAiring,
    isDonghua,
    isMovie,
    scores,
    mediaTags,
    statusKey,
    favoriteActive: anime ? isFavorite(anime.id) : false,
    reminderActive: anime ? isReminderOn(anime.id) : false,
    reminderBusy,
    reminderToggling,
    updatingPreferences,
    isSavingProgress,
    handleShare,
    handleFavorite,
    handleAiringReminder,
    handleSaveProgress,
    toggleFavorite,
    getProgress,
    showAlert,
    openLink,
    openTelegramLink,
    downloads,
  }
}
