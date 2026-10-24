import type { SocialProfileMe } from '@/services/socialProfile'
import type { UserAnimeListStats } from '@/utils/userListStats'

const localWatchHoursEstimate = (episodesWatched: number) =>
  Math.round((episodesWatched * 24) / 60)

/** Own profile: never show zeros from API when the local list still has data. */
export const mergeOwnProfileHeaderStats = (
  social: SocialProfileMe | undefined,
  local: UserAnimeListStats,
  socialLoading: boolean
) => {
  const apiSummary = social?.enabled && social.summary ? social.summary : null

  const animeCount = Math.max(apiSummary?.anime_count ?? 0, local.animeCount)
  const episodesWatched = Math.max(
    apiSummary?.episodes_watched ?? 0,
    local.episodesWatched
  )
  const watchHours = Math.max(
    apiSummary?.estimated_watch_hours ?? 0,
    localWatchHoursEstimate(local.episodesWatched)
  )

  const averageRating =
    apiSummary?.average_rating != null
      ? apiSummary.average_rating
      : local.averageRating

  const followers =
    socialLoading || social === undefined
      ? null
      : (social.profile?.followers_count ?? 0)
  const following =
    socialLoading || social === undefined
      ? null
      : (social.profile?.following_count ?? 0)

  return {
    animeCount,
    episodesWatched,
    watchHours,
    averageRating,
    followers,
    following,
    byFormat: social?.by_format ?? [],
    topGenres: social?.top_genres ?? [],
    watchedItems: social?.watched?.items ?? [],
    ratingsCount: Math.max(apiSummary?.ratings_count ?? 0, 0),
    activeDays: Math.max(apiSummary?.active_days ?? 0, 0),
    socialEnabled: social?.enabled === true && Boolean(apiSummary),
  }
}
