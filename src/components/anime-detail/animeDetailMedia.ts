import { formatAnilistPercent } from '../../services/externalScores'
import {
  formatAverageEpisodeSizeLabel,
  normalizeVideoEncode,
  normalizeVideoFileType,
  normalizeVideoResolution,
  resolveHardsubLanguage,
} from '../../utils/animeMediaTags'
import { toPersianNumber } from './animeDetailLabels'
import type { Anime } from './types'

export const getAnimeMediaTags = (anime: Anime | null) => ({
  hardsubLanguage: resolveHardsubLanguage({
    hardsub_language: anime?.hardsub_language,
    episodes: anime?.episodes,
    subtitle_packs: anime?.subtitle_packs,
    subtitles: anime?.subtitles,
  }),
  videoFileType: normalizeVideoFileType(anime?.video_file_type),
  videoResolution: normalizeVideoResolution(anime?.video_resolution),
  videoEncode: normalizeVideoEncode(anime?.video_encode),
  averageEpisodeSizeLabel: formatAverageEpisodeSizeLabel(anime?.average_episode_size_bytes),
})

export const getAnimeScoreLabels = (anime: Anime) => {
  const anilistScoreLabel =
    typeof anime.averageScore === 'number' && Number.isFinite(anime.averageScore)
      ? formatAnilistPercent(anime.averageScore, toPersianNumber)
      : '—'

  const resolvedMalScore =
    typeof anime.malScore === 'number' && Number.isFinite(anime.malScore)
      ? anime.malScore
      : null

  const malScoreLabel =
    resolvedMalScore !== null ? toPersianNumber(resolvedMalScore.toFixed(1)) : '—'

  /** امتیاز شیوری — میانگین امتیاز کاربران */
  const raw = anime.shioriScore as number | string | null | undefined
  const shioriScoreValue = (() => {
    if (typeof raw === 'number' && Number.isFinite(raw)) return raw
    if (raw == null || raw === '') return null
    const n = Number(raw)
    return Number.isFinite(n) ? n : null
  })()
  const shioriScoreLabel =
    shioriScoreValue != null ? toPersianNumber(shioriScoreValue.toFixed(1)) : '—'

  return { anilistScoreLabel, malScoreLabel, shioriScoreLabel }
}

export type AnimeMediaTags = ReturnType<typeof getAnimeMediaTags>
export type AnimeScoreLabels = ReturnType<typeof getAnimeScoreLabels>
