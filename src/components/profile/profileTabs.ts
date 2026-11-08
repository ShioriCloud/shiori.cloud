import {
  defaultActivitiesSubTab,
  parseActivitiesSubTab,
  parseStatsSubTab,
  type ProfileActivitiesSubTabId,
  type ProfileStatsSubTabId,
} from '@/components/profile/profileSubTabs'

/** v3 primary tabs — layout ref: Figma MiniApp Profile Redesign (v3 only). */
export type ProfilePrimaryTabId = 'activities' | 'stats' | 'translations'

export const PROFILE_TAB_ACTIVITIES = {
  id: 'activities' as const,
  label: 'آخرین فعالیت‌ها',
}
export const PROFILE_TAB_STATS = { id: 'stats' as const, label: 'آمار' }
export const PROFILE_TAB_TRANSLATIONS = { id: 'translations' as const, label: 'ترجمه‌ها' }

export type ProfileTabConfig = { id: ProfilePrimaryTabId; label: string }

export type ProfileTabQuery = {
  primary: ProfilePrimaryTabId
  activitiesSub: ProfileActivitiesSubTabId
  statsSub: ProfileStatsSubTabId
}

/** @deprecated — use ProfilePrimaryTabId */
export type ProfileTabId = ProfilePrimaryTabId

export const buildOwnProfileTabs = (hasTranslator: boolean): ProfileTabConfig[] => {
  const tabs: ProfileTabConfig[] = [PROFILE_TAB_STATS, PROFILE_TAB_ACTIVITIES]
  if (hasTranslator) tabs.push(PROFILE_TAB_TRANSLATIONS)
  return tabs
}

export const buildPublicProfileTabs = (hasTranslator: boolean): ProfileTabConfig[] => {
  const tabs: ProfileTabConfig[] = [PROFILE_TAB_STATS, PROFILE_TAB_ACTIVITIES]
  if (hasTranslator) tabs.push(PROFILE_TAB_TRANSLATIONS)
  return tabs
}

const LEGACY_TAB_MAP: Record<string, ProfilePrimaryTabId> = {
  feed: 'activities',
  watch: 'activities',
  playlists: 'activities',
  personal: 'activities',
  stats: 'stats',
  translations: 'translations',
}

export const parseProfileTabQuery = (
  tabRaw: string | null,
  subRaw: string | null
): ProfileTabQuery => {
  let primary: ProfilePrimaryTabId = 'stats'
  let activitiesSub = parseActivitiesSubTab(subRaw)
  let statsSub = parseStatsSubTab(subRaw)

  if (tabRaw) {
    const mapped = LEGACY_TAB_MAP[tabRaw] ?? (tabRaw as ProfilePrimaryTabId)
    if (mapped === 'activities' || mapped === 'stats' || mapped === 'translations') {
      primary = mapped
    }
    if (tabRaw === 'feed' || tabRaw === 'watch' || tabRaw === 'personal') activitiesSub = 'watch'
    if (tabRaw === 'playlists') activitiesSub = 'playlists'
  }

  if (primary === 'activities' && subRaw && (subRaw === 'viewing' || subRaw === 'favorites')) {
    activitiesSub = defaultActivitiesSubTab()
  }
  if (primary === 'stats') {
    statsSub = parseStatsSubTab(subRaw)
  }

  return { primary, activitiesSub, statsSub }
}

/** @deprecated use parseProfileTabQuery */
export const parseProfileTab = (raw: string | null): ProfilePrimaryTabId =>
  parseProfileTabQuery(raw, null).primary

export const isDefaultProfileTab = (tab: ProfilePrimaryTabId): boolean => tab === 'stats'

export const serializeProfileTabQuery = (
  query: ProfileTabQuery,
  opts: { hasTranslator: boolean }
): { tab?: string; sub?: string } => {
  const { primary, activitiesSub, statsSub } = query
  if (primary === 'stats' && statsSub === 'favorites') {
    return {}
  }
  if (primary === 'activities' && activitiesSub === 'watch') {
    return { tab: 'activities' }
  }
  if (primary === 'translations') {
    return opts.hasTranslator ? { tab: 'translations' } : {}
  }
  if (primary === 'activities') {
    return { tab: 'activities', sub: activitiesSub }
  }
  return { tab: 'stats', sub: statsSub }
}
