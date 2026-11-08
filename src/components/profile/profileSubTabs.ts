export type ProfileActivitiesSubTabId = 'watch' | 'playlists' | 'comments'
export type ProfileStatsSubTabId = 'viewing' | 'favorites'

export const PROFILE_ACTIVITIES_SUB_WATCH = {
  id: 'watch' as const,
  label: 'تماشا',
}
export const PROFILE_ACTIVITIES_SUB_PLAYLISTS = {
  id: 'playlists' as const,
  label: 'پلی‌لیست‌ها',
}
export const PROFILE_ACTIVITIES_SUB_COMMENTS = {
  id: 'comments' as const,
  label: 'نظرات',
}

export const PROFILE_STATS_SUB_VIEWING = { id: 'viewing' as const, label: 'بازدید' }
export const PROFILE_STATS_SUB_FAVORITES = { id: 'favorites' as const, label: 'علاقه‌مندی‌ها' }

export type ProfileSubTabConfig<T extends string> = { id: T; label: string }

export const buildActivitiesSubTabs = (): ProfileSubTabConfig<ProfileActivitiesSubTabId>[] => [
  PROFILE_ACTIVITIES_SUB_WATCH,
  PROFILE_ACTIVITIES_SUB_PLAYLISTS,
  PROFILE_ACTIVITIES_SUB_COMMENTS,
]

export const buildStatsSubTabs = (): ProfileSubTabConfig<ProfileStatsSubTabId>[] => [
  PROFILE_STATS_SUB_VIEWING,
  PROFILE_STATS_SUB_FAVORITES,
]

export const parseActivitiesSubTab = (raw: string | null): ProfileActivitiesSubTabId => {
  if (raw === 'playlists' || raw === 'comments' || raw === 'watch') return raw
  return 'watch'
}

export const parseStatsSubTab = (raw: string | null): ProfileStatsSubTabId => {
  if (raw === 'favorites' || raw === 'viewing') return raw
  return 'viewing'
}

export const defaultActivitiesSubTab = (): ProfileActivitiesSubTabId => 'watch'
export const defaultStatsSubTab = (): ProfileStatsSubTabId => 'viewing'
