import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ExploreTabBar } from '@/components/explore/ExploreUi'
import {
  ENABLE_FREE_TOKEN_WALLET_UI,
  ENABLE_SUBSCRIPTION_DOWNLOAD_GATE,
} from '../../../config/monetizationFlags'
import { buildTelegramFileDownloadLink } from '../../../utils/externalLinks'
import { trackEpisodeDownload } from '../../../lib/myListTracking'
import {
  EpisodeDownloadCard,
  EpisodePackDownloadCard,
  EpisodeQualityNote,
  FreeEpisodeDownloadCard,
  FreeTokenWalletCard,
  SubtitlePackDownloadCard,
  type Episode,
} from '../EpisodeDownloadCards'
import {
  EPISODE_KIND_TABS,
  EPISODE_KIND_TABS_SUBSCRIBED,
  type Anime,
  type EpisodeKindTab,
} from '../types'
import type { AnimeDetailDownloads } from '../useAnimeDetailDownloads'
import type { AnimeMediaTags } from '../animeDetailMedia'

/**
 * Softsub / hardsub / free-token UI. Dormant while monetizationFlags stay false.
 * Flip those flags to restore this funnel without touching the launch panel.
 */
export const GatedDownloadPanel = ({
  anime,
  downloads,
  mediaTags,
  showAlert,
  openTelegramLink,
}: {
  anime: Anime
  downloads: AnimeDetailDownloads
  mediaTags: AnimeMediaTags
  showAlert: (message: string) => void
  openTelegramLink: (url: string) => void
}) => {
  const {
    episodeKindTab,
    setEpisodeKindTab,
    hasActiveSubscription,
    tokenBalancePending,
    claimingEpisodeId,
    setClaimingEpisodeId,
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
  } = downloads
  const { videoFileType, videoResolution, videoEncode, averageEpisodeSizeLabel } = mediaTags

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
    <>
      <ExploreTabBar
        tabs={
          ENABLE_SUBSCRIPTION_DOWNLOAD_GATE && hasActiveSubscription
            ? EPISODE_KIND_TABS_SUBSCRIBED
            : EPISODE_KIND_TABS
        }
        active={episodeKindTab}
        onChange={(tab) => setEpisodeKindTab(tab as EpisodeKindTab)}
        className="text-[13px]"
      />

      {ENABLE_SUBSCRIPTION_DOWNLOAD_GATE &&
      !hasActiveSubscription &&
      (episodeKindTab === 'softsub' || episodeKindTab === 'hardsub') ? (
        <div className="surface-skeuo rounded-xl p-3 space-y-2">
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
      episodeKindTab !== 'free' &&
      (episodeKindTab === videoFileType ||
        (ENABLE_SUBSCRIPTION_DOWNLOAD_GATE && hasActiveSubscription)) ? (
        <EpisodePackDownloadCard
          pack={anime.episode_pack}
          locked={ENABLE_SUBSCRIPTION_DOWNLOAD_GATE && !hasActiveSubscription}
          onDownload={() => {
            if (ENABLE_SUBSCRIPTION_DOWNLOAD_GATE && !hasActiveSubscription) {
              showAlert('برای دانلود پک، اشتراک ماهانه لازم است')
              return
            }
            if (!ENABLE_SUBSCRIPTION_DOWNLOAD_GATE) {
              const link = anime.episode_pack?.download_link?.trim() || null
              if (!link) {
                showAlert('لینک پک موجود نیست')
                return
              }
              openTelegramLink(link)
              return
            }
            void (async () => {
              const result = await claimEpisodePackMutation.mutateAsync(String(anime.id))
              if (result.ok) {
                openTelegramLink(result.download_link)
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
      !(episodeKindTab === 'free' && usingMockFreeEpisodes) ? (
        <p className="text-xs text-muted-foreground text-center py-6">
          {allEpisodesCount === 0 &&
          episodePackAvailable &&
          episodeKindTab === videoFileType
            ? 'لینک تک‌تک قسمت‌ها هنوز ثبت نشده.'
            : 'قسمتی در این دسته ثبت نشده'}
        </p>
      ) : episodeKindTab === 'free' && ENABLE_FREE_TOKEN_WALLET_UI ? (
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
                    disabled={tokensExhausted || claimFreeDownloadMutation.isPending}
                    onClaim={() => {
                      void (async () => {
                        setClaimingEpisodeId(episodeId)
                        try {
                          if (usingMockFreeEpisodes || episodeId.startsWith('mock-free-')) {
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
                          const result = await claimFreeDownloadMutation.mutateAsync(episodeId)
                          if (result.ok) {
                            recordEpisodeDownload(episode)
                            openTelegramLink(result.download_link)
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
                            e instanceof Error ? e.message : 'خطا در دانلود رایگان'
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
          {(episodeKindTab === 'free' ? freeEpisodesForList : episodesForList).map(
            (episode) => (
              <EpisodeDownloadCard
                key={episode.id}
                episode={episode}
                subscriptionLocked={
                  ENABLE_SUBSCRIPTION_DOWNLOAD_GATE &&
                  episodeKindTab !== 'free' &&
                  !hasActiveSubscription
                }
                onDownloadAvailable={() => {
                  if (
                    ENABLE_SUBSCRIPTION_DOWNLOAD_GATE &&
                    episodeKindTab !== 'free' &&
                    !hasActiveSubscription
                  ) {
                    showAlert('برای دانلود سافت‌ساب و هاردساب اشتراک ماهانه لازم است')
                    return
                  }
                  if (ENABLE_SUBSCRIPTION_DOWNLOAD_GATE && episodeKindTab !== 'free') {
                    void (async () => {
                      const result = await claimPaidEpisodeMutation.mutateAsync(
                        String(episode.id)
                      )
                      if (result.ok) {
                        recordEpisodeDownload(episode)
                        openTelegramLink(result.download_link)
                        return
                      }
                      showAlert(result.message || 'خطا در دانلود')
                    })()
                    return
                  }
                  const link =
                    episode.download_link ||
                    buildTelegramFileDownloadLink(String(episode.id))
                  if (!link) {
                    showAlert('لینک دانلود موجود نیست')
                    return
                  }
                  recordEpisodeDownload(episode)
                  openTelegramLink(link)
                }}
                onLockedQuality={(quality) => {
                  if (ENABLE_SUBSCRIPTION_DOWNLOAD_GATE && !hasActiveSubscription) {
                    showAlert('برای دانلود، اشتراک ماهانه لازم است')
                    return
                  }
                  showAlert(`دانلود ${quality} هنوز فعال نشده`)
                }}
              />
            )
          )}
        </div>
      )}
      {episodeKindTab === 'softsub' && showSubtitlePacks ? (
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
                openTelegramLink(String(p.subtitle_link))
              }}
            />
          ))}
        </div>
      ) : null}
    </>
  )
}
