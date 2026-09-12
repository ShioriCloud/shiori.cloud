import { useEffect, useMemo, useState } from 'react'
import {
  ENABLE_FREE_TOKEN_WALLET_UI,
  ENABLE_SUBSCRIPTION_DOWNLOAD_GATE,
} from '../../config/monetizationFlags'
import { useClaimFreeDownload, useDownloadTokenBalance } from '../../hooks/useDownloadTokens'
import {
  useClaimEpisodePackDownload,
  useClaimPaidEpisodeDownload,
  useSubscriptionMe,
} from '../../hooks/useSubscription'
import { MOCK_FREE_EPISODES } from './EpisodeDownloadCards'
import { useLaunchDownloadTabs, type Anime, type EpisodeKindTab, type LaunchDownloadTab, type TabType } from './types'

export function useAnimeDetailDownloads({
  anime,
  activeTab,
  routeId,
}: {
  anime: Anime | null
  activeTab: TabType
  routeId: string | undefined
}) {
  const [episodeKindTab, setEpisodeKindTab] = useState<EpisodeKindTab>('softsub')
  const [launchDownloadTab, setLaunchDownloadTab] = useState<LaunchDownloadTab>('episodes')
  const [claimingEpisodeId, setClaimingEpisodeId] = useState<string | null>(null)
  const [showDonatePrompt, setShowDonatePrompt] = useState(false)
  const [mockTokenBalance, setMockTokenBalance] = useState(10)

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

  useEffect(() => {
    if (
      ENABLE_SUBSCRIPTION_DOWNLOAD_GATE &&
      hasActiveSubscription &&
      episodeKindTab === 'free'
    ) {
      setEpisodeKindTab('softsub')
    }
  }, [hasActiveSubscription, episodeKindTab])

  useEffect(() => {
    setEpisodeKindTab('softsub')
    setLaunchDownloadTab('episodes')
  }, [routeId])

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
  const episodePackAvailable = Boolean(episodePackLink || anime?.episode_pack)

  return {
    episodeKindTab,
    setEpisodeKindTab,
    launchDownloadTab,
    setLaunchDownloadTab,
    hasActiveSubscription,
    tokenBalancePending,
    claimingEpisodeId,
    setClaimingEpisodeId,
    showDonatePrompt,
    setShowDonatePrompt,
    mockTokenBalance,
    setMockTokenBalance,
    usingMockFreeEpisodes,
    freeEpisodesForList,
    episodesForList,
    displayTokenBalance,
    tokensExhausted,
    claimFreeDownloadMutation,
    claimPaidEpisodeMutation,
    claimEpisodePackMutation,
    allEpisodesCount,
    episodePackAvailable,
    showSubtitlePacks,
    subtitlePacksList,
    hasSubtitlePacks,
    episodeSubtitlesList,
    hasEpisodeSubtitles,
    hasAnySubtitles,
  }
}

export type AnimeDetailDownloads = ReturnType<typeof useAnimeDetailDownloads>
