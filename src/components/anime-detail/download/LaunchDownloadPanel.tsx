import { useState } from 'react'
import { ExploreTabBar } from '@/components/explore/ExploreUi'
import { TokenRechargeSheet } from '@/components/download-tokens/TokenRechargeSheet'
import { buildTelegramFileDownloadLink } from '../../../utils/externalLinks'
import { trackEpisodeDownload } from '../../../lib/myListTracking'
import { useAppAuth } from '../../../hooks/useAppAuth'
import { useRefreshDownloadTokenWallet } from '../../../hooks/useDownloadTokens'
import { EmptyBlock } from '../AnimeDetailChrome'
import {
  EpisodeDownloadCard,
  EpisodePackDownloadCard,
  EpisodeQualityNote,
  FreeEpisodeDownloadCard,
  FreeTokenWalletCard,
  SubtitleDownloadCard,
  SubtitlePackDownloadCard,
  type Episode,
} from '../EpisodeDownloadCards'
import { LAUNCH_DOWNLOAD_TABS, type Anime, type LaunchDownloadTab } from '../types'
import type { AnimeDetailDownloads } from '../useAnimeDetailDownloads'
import type { AnimeMediaTags } from '../animeDetailMedia'

export const LaunchDownloadPanel = ({
  anime,
  downloads,
  mediaTags,
  showAlert,
  openTelegramLink,
  openLink,
}: {
  anime: Anime
  downloads: AnimeDetailDownloads
  mediaTags: AnimeMediaTags
  showAlert: (message: string) => void
  openTelegramLink: (url: string) => void
  openLink: (url: string) => void
}) => {
  const { user } = useAppAuth()
  const refreshMutation = useRefreshDownloadTokenWallet()
  const [rechargeOpen, setRechargeOpen] = useState(false)
  const {
    launchDownloadTab,
    setLaunchDownloadTab,
    hasAnySubtitles,
    hasSubtitlePacks,
    hasEpisodeSubtitles,
    subtitlePacksList,
    episodeSubtitlesList,
    episodePackAvailable,
    episodesForList,
    tokenWalletEnabled,
    tokenBalancePending,
    claimingEpisodeId,
    setClaimingEpisodeId,
    setShowDonatePrompt,
    displayTokenBalance,
    tokensExhausted,
    rechargeTiers,
    claimFreeDownloadMutation,
  } = downloads
  const { videoResolution, videoEncode, averageEpisodeSizeLabel } = mediaTags

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

  const claimEpisode = (episode: Episode) => {
    const episodeId = String(episode.id)
    void (async () => {
      setClaimingEpisodeId(episodeId)
      try {
        const result = await claimFreeDownloadMutation.mutateAsync(episodeId)
        if (result.ok) {
          recordEpisodeDownload(episode)
          openTelegramLink(result.download_link)
          return
        }
        if (result.code === 'insufficient_tokens') {
          setShowDonatePrompt(true)
          setRechargeOpen(true)
          showAlert('توکن‌های دانلود شما تمام شده')
          return
        }
        showAlert(result.message || 'خطا در دانلود')
      } catch (e) {
        showAlert(e instanceof Error ? e.message : 'خطا در دانلود')
      } finally {
        setClaimingEpisodeId(null)
      }
    })()
  }

  return (
    <>
      <ExploreTabBar
        tabs={LAUNCH_DOWNLOAD_TABS}
        active={launchDownloadTab}
        onChange={(tab) => setLaunchDownloadTab(tab as LaunchDownloadTab)}
        className="text-[13px]"
      />

      {launchDownloadTab === 'subtitles' ? (
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
                      openTelegramLink(String(p.subtitle_link))
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
                      openTelegramLink(String(episode.subtitle_link))
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
          <EpisodeQualityNote
            resolution={videoResolution}
            encode={videoEncode}
            averageSizeLabel={averageEpisodeSizeLabel}
          />

          {tokenWalletEnabled ? (
            <FreeTokenWalletCard
              balance={displayTokenBalance}
              pending={tokenBalancePending}
              exhausted={tokensExhausted}
              onOpenRecharge={() => setRechargeOpen(true)}
            />
          ) : null}

          {episodePackAvailable && anime.episode_pack && !tokenWalletEnabled ? (
            <EpisodePackDownloadCard
              pack={anime.episode_pack}
              locked={false}
              onDownload={() => {
                const link = anime.episode_pack?.download_link?.trim() || null
                if (!link) {
                  showAlert('لینک پک موجود نیست')
                  return
                }
                openTelegramLink(link)
              }}
            />
          ) : null}

          {episodesForList.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">
              قسمت رایگانی برای دانلود ثبت نشده
            </p>
          ) : tokenWalletEnabled ? (
            !tokensExhausted ? (
              <div className="space-y-2">
                {episodesForList.map((episode) => {
                  const episodeId = String(episode.id)
                  return (
                    <FreeEpisodeDownloadCard
                      key={episodeId}
                      episode={episode}
                      claiming={claimingEpisodeId === episodeId}
                      disabled={tokensExhausted || claimFreeDownloadMutation.isPending}
                      onClaim={() => claimEpisode(episode)}
                    />
                  )
                })}
              </div>
            ) : null
          ) : (
            <div className="space-y-2">
              {episodesForList.map((episode) => (
                <EpisodeDownloadCard
                  key={episode.id}
                  episode={episode}
                  subscriptionLocked={false}
                  onDownloadAvailable={() => {
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
                    showAlert(`دانلود ${quality} هنوز فعال نشده`)
                  }}
                />
              ))}
            </div>
          )}
        </>
      )}

      {tokenWalletEnabled ? (
        <TokenRechargeSheet
          open={rechargeOpen}
          onOpenChange={setRechargeOpen}
          balance={displayTokenBalance}
          telegramUserId={user?.id}
          tiers={rechargeTiers}
          onConfirm={(tier) => {
            if (!tier.recharge_url) {
              showAlert('لینک پرداخت در دسترس نیست')
              return
            }
            setRechargeOpen(false)
            openLink(tier.recharge_url)
          }}
          checkingPayment={refreshMutation.isPending}
          onCheckPayment={async () => {
            try {
              const result = await refreshMutation.mutateAsync()
              if (result.credited > 0) {
                showAlert(`شارژ انجام شد · موجودی ${result.wallet.balance} توکن`)
                setRechargeOpen(false)
                return
              }
              showAlert(
                'پرداخت جدیدی پیدا نشد. اگر همین الان پرداخت کردید، چند لحظه صبر کنید و دوباره بزنید.'
              )
            } catch (e) {
              showAlert(e instanceof Error ? e.message : 'خطا در بررسی پرداخت')
            }
          }}
        />
      ) : null}
    </>
  )
}
