import { EmptyBlock } from './AnimeDetailChrome'
import { GatedDownloadPanel } from './download/GatedDownloadPanel'
import { LaunchDownloadPanel } from './download/LaunchDownloadPanel'
import { useLaunchDownloadTabs, type Anime } from './types'
import type { AnimeDetailDownloads } from './useAnimeDetailDownloads'
import type { AnimeMediaTags } from './animeDetailMedia'

export const AnimeDetailDownloadTab = ({
  anime,
  downloads,
  mediaTags,
  statusKey,
  showAlert,
  openTelegramLink,
}: {
  anime: Anime
  downloads: AnimeDetailDownloads
  mediaTags: AnimeMediaTags
  statusKey: string
  showAlert: (message: string) => void
  openTelegramLink: (url: string) => void
}) => {
  const { allEpisodesCount, episodePackAvailable, hasSubtitlePacks } = downloads

  if (allEpisodesCount === 0 && !episodePackAvailable && !hasSubtitlePacks) {
    return (
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
    )
  }

  return (
    <div className="space-y-3">
      {useLaunchDownloadTabs ? (
        <LaunchDownloadPanel
          anime={anime}
          downloads={downloads}
          mediaTags={mediaTags}
          showAlert={showAlert}
          openTelegramLink={openTelegramLink}
        />
      ) : (
        <GatedDownloadPanel
          anime={anime}
          downloads={downloads}
          mediaTags={mediaTags}
          showAlert={showAlert}
          openTelegramLink={openTelegramLink}
        />
      )}
    </div>
  )
}
