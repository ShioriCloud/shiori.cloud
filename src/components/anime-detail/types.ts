import type { GenreItem } from '../../types/catalog'
import type { AnimeDetailTab } from '../../utils/telegramStartParam'
import {
  ENABLE_SUBSCRIPTION_DOWNLOAD_GATE,
  SHOW_HARD_AND_FREE_DOWNLOAD_TABS,
} from '../../config/monetizationFlags'
import type { Episode, EpisodePack, SubtitlePack } from './EpisodeDownloadCards'

export type TabType = AnimeDetailTab
export type EpisodeKindTab = 'hardsub' | 'softsub' | 'free'
/** Launch download sub-tabs (when hard/free kind tabs are hidden). */
export type LaunchDownloadTab = 'episodes' | 'subtitles'

export interface Anime {
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

export const MAIN_TABS: { id: TabType; label: string }[] = [
  { id: 'info', label: 'اطلاعات' },
  { id: 'episodes', label: 'دانلود' },
  { id: 'translators', label: 'مترجم' },
  { id: 'similar', label: 'مشابه' },
]

/** Softsub / hardsub / free — restored when SHOW_HARD_AND_FREE_DOWNLOAD_TABS is true */
export const EPISODE_KIND_TABS: { id: EpisodeKindTab; label: string }[] = [
  { id: 'hardsub', label: 'هاردساب' },
  { id: 'softsub', label: 'سافت‌ساب' },
  { id: 'free', label: 'رایگان' },
]

export const EPISODE_KIND_TABS_SUBSCRIBED: { id: EpisodeKindTab; label: string }[] = [
  { id: 'hardsub', label: 'هاردساب' },
  { id: 'softsub', label: 'سافت‌ساب' },
]

export const LAUNCH_DOWNLOAD_TABS: { id: LaunchDownloadTab; label: string }[] = [
  { id: 'episodes', label: 'قسمت‌ها' },
  { id: 'subtitles', label: 'زیرنویس' },
]

export const useLaunchDownloadTabs =
  !SHOW_HARD_AND_FREE_DOWNLOAD_TABS && !ENABLE_SUBSCRIPTION_DOWNLOAD_GATE
