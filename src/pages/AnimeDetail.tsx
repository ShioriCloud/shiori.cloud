import FavoriteAnimeEditor from '../components/FavoriteAnimeEditor'
import { ExploreEmptyState, ExploreTabBar } from '@/components/explore/ExploreUi'
import { formatUserListSaveError } from '../services/userListErrors'
import { animeDetailPath } from '../lib/animePaths'
import { DetailSkeleton } from '@/components/anime-detail/AnimeDetailSkeletons'
import {
  NextAiringCard,
  NextAiringCardSkeleton,
  ReminderStatCard,
} from '@/components/anime-detail/AnimeDetailStatCards'
import { AnimeDetailDownloadTab } from '@/components/anime-detail/AnimeDetailDownloadTab'
import { AnimeDetailHero } from '@/components/anime-detail/AnimeDetailHero'
import { AnimeDetailInfoTab } from '@/components/anime-detail/AnimeDetailInfoTab'
import { AnimeDetailSimilarTab } from '@/components/anime-detail/AnimeDetailSimilarTab'
import { AnimeDetailSynopsis } from '@/components/anime-detail/AnimeDetailSynopsis'
import { AnimeDetailTranslatorsTab } from '@/components/anime-detail/AnimeDetailTranslatorsTab'
import { SeriesSeasonSwitcher } from '@/components/anime-detail/SeriesSeasonSwitcher'
import { useAnimeDetailPage } from '@/components/anime-detail/useAnimeDetailPage'
import { MAIN_TABS } from '@/components/anime-detail/types'

const AnimeDetail = () => {
  const page = useAnimeDetailPage()
  const {
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
    showNextAiringSkeleton,
    canHaveNextAiring,
    isDonghua,
    isMovie,
    scores,
    mediaTags,
    statusKey,
    favoriteActive,
    reminderActive,
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
  } = page

  if (!detailReady) {
    if (error && !catalogReady) {
      return (
        <div className="pb-24">
          <ExploreEmptyState
            title="خطا در بارگذاری"
            subtitle={error}
            actionLabel="تلاش مجدد"
            onAction={() => refetch()}
          />
        </div>
      )
    }
    return <DetailSkeleton />
  }

  if (error || !anime || !scores) {
    return (
      <div className="pb-24">
        <ExploreEmptyState
          title="انیمه پیدا نشد"
          subtitle={error || 'انیمه مورد نظر یافت نشد'}
          actionLabel="تلاش مجدد"
          onAction={() => refetch()}
        />
      </div>
    )
  }

  const description = anime.description?.trim() || 'توضیحاتی ثبت نشده.'

  return (
    <div className="pb-24 bg-background text-foreground">
      <AnimeDetailHero
        anime={anime}
        scores={scores}
        hardsubLanguage={mediaTags.hardsubLanguage}
        statusKey={statusKey}
        favoriteActive={favoriteActive}
        onFavorite={() => {
          void handleFavorite()
        }}
        onShare={handleShare}
        openLink={openLink}
        navigate={navigate}
      />

      {nextAiring ? (
        <NextAiringCard
          episode={nextAiring.episode}
          airingAt={nextAiring.airing_at}
        />
      ) : showNextAiringSkeleton ? (
        <NextAiringCardSkeleton />
      ) : null}

      {/* Reminder for airing / upcoming titles. */}
      {canHaveNextAiring ? (
        <div className="mx-4 mt-2 flex items-stretch gap-2">
          <ReminderStatCard
            active={reminderActive}
            busy={reminderBusy || reminderToggling || updatingPreferences}
            onClick={() => {
              void handleAiringReminder()
            }}
          />
        </div>
      ) : null}

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
        episodesCount={anime.episodes_count || downloads.episodesForList.length}
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

      <AnimeDetailSynopsis
        description={description}
        showFull={showFullDescription}
        onToggle={() => setShowFullDescription(!showFullDescription)}
      />

      <div className="sticky top-[var(--app-header-offset)] z-30 px-4 pt-5 pb-2 bg-background/90 backdrop-blur-md border-b border-border/50">
        <ExploreTabBar tabs={MAIN_TABS} active={activeTab} onChange={handleMainTabChange} />
      </div>

      <div className="px-4 pt-4">
        {activeTab === 'info' && (
          <AnimeDetailInfoTab
            anime={anime}
            isDonghua={isDonghua}
            isMovie={isMovie}
            navigate={navigate}
          />
        )}

        {activeTab === 'episodes' && (
          <AnimeDetailDownloadTab
            anime={anime}
            downloads={downloads}
            mediaTags={mediaTags}
            statusKey={statusKey}
            showAlert={showAlert}
            openTelegramLink={openTelegramLink}
          />
        )}

        {activeTab === 'similar' && (
          <AnimeDetailSimilarTab
            similarAnime={similarAnime}
            similarLoading={similarLoading}
            hasGenres={anime.genres.length > 0}
          />
        )}

        {activeTab === 'translators' && (
          <AnimeDetailTranslatorsTab
            links={translatorLinks}
            pending={translatorLinksPending}
          />
        )}
      </div>
    </div>
  )
}

export default AnimeDetail
