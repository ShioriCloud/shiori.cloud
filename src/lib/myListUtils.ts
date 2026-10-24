import type { FavoriteProgress } from '@/store/animeStore'
import { toPersianDigits } from '@/lib/persianDigits'
import { translateAiringStatus } from '@/lib/searchFilters'

export type WatchStatus =
  | 'planning'
  | 'watching'
  | 'completed'
  | 'rewatching'
  | 'paused'
  | 'dropped'

export const WATCH_STATUS_LABELS: Record<WatchStatus, string> = {
  watching: 'دارم می‌بینم',
  planning: 'می‌خوام ببینم',
  completed: 'کامل دیدم',
  rewatching: 'دوباره می‌بینم',
  paused: 'فعلاً نمی‌بینم',
  dropped: 'دراپ کردم',
}

export const PROFILE_WATCH_STATUSES: WatchStatus[] = [
  'watching',
  'planning',
  'completed',
  'rewatching',
  'paused',
  'dropped',
]

const RATING_STEP = 0.5

export const clampUserRating = (value: number): number =>
  Math.min(10, Math.max(1, Math.round(value / RATING_STEP) * RATING_STEP))

export const formatUserRatingFa = (value: number): string => {
  const clamped = clampUserRating(value)
  const text = clamped % 1 === 0 ? String(clamped) : clamped.toFixed(1)
  return toPersianDigits(text)
}

export const deriveWatchStatus = (
  progress: FavoriteProgress,
  episodesCount: number
): WatchStatus => {
  if (progress.listStatus) return progress.listStatus
  const max = Math.max(episodesCount, 1)
  if (progress.episodesWatched >= max) return 'completed'
  if (progress.episodesWatched > 0) return 'watching'
  return 'planning'
}

/** Map AniList-style status to episode progress for API sync. */
export const progressForWatchStatus = (
  status: WatchStatus,
  current: FavoriteProgress,
  episodesCount: number
): FavoriteProgress => {
  const max = Math.max(episodesCount, 1)
  if (status === 'completed') {
    return { ...current, listStatus: status, episodesWatched: max }
  }
  if (status === 'planning') {
    return { ...current, listStatus: status, episodesWatched: 0 }
  }
  if (status === 'watching' || status === 'rewatching') {
    const ep =
      current.episodesWatched > 0 && current.episodesWatched < max
        ? current.episodesWatched
        : Math.min(1, max)
    return { ...current, listStatus: status, episodesWatched: ep }
  }
  return {
    ...current,
    listStatus: status,
    episodesWatched: Math.min(current.episodesWatched, max),
  }
}

export const airingStatusLabel = (status?: string | null): string => {
  if (!status?.trim()) return '—'
  return translateAiringStatus(status.trim().toUpperCase())
}

export const toPersianNumber = toPersianDigits

export const formatRelativeTimeFa = (iso: string): string => {
  const then = new Date(iso).getTime()
  if (!Number.isFinite(then)) return '—'
  const diffMs = Date.now() - then
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return 'امروز'
  if (diffDays === 1) return 'دیروز'
  if (diffDays < 7) return `${toPersianNumber(diffDays)} روز قبل`
  if (diffDays < 30) return `${toPersianNumber(Math.floor(diffDays / 7))} هفته قبل`
  return `${toPersianNumber(Math.floor(diffDays / 30))} ماه قبل`
}

export const formatDateTimeFa = (iso: string): string => {
  const date = new Date(iso)
  if (!Number.isFinite(date.getTime())) return '—'
  return new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

export const displayScore = (
  userRating: number | null | undefined,
  malScore?: number | null,
  shioriScore?: number | null
): string | null => {
  if (typeof userRating === 'number' && Number.isFinite(userRating)) {
    return formatUserRatingFa(userRating)
  }
  if (typeof shioriScore === 'number' && Number.isFinite(shioriScore)) {
    return toPersianNumber(shioriScore)
  }
  if (typeof malScore === 'number' && Number.isFinite(malScore)) {
    return toPersianNumber(malScore)
  }
  return null
}
