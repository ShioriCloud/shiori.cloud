import type { FavoriteProgress } from '@/store/animeStore'
import { toPersianDigits } from '@/lib/persianDigits'
import { translateAiringStatus } from '@/lib/searchFilters'

export type WatchStatus = 'planning' | 'watching' | 'completed' | 'paused' | 'dropped'

export const WATCH_STATUS_LABELS: Record<WatchStatus, string> = {
  planning: 'در انتظار',
  watching: 'در حال تماشا',
  completed: 'تمام‌شده',
  paused: 'متوقف',
  dropped: 'رها‌شده',
}

export const PROFILE_WATCH_STATUSES: WatchStatus[] = [
  'watching',
  'planning',
  'completed',
  'paused',
  'dropped',
]

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
  if (status === 'watching') {
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
    return toPersianNumber(userRating)
  }
  if (typeof shioriScore === 'number' && Number.isFinite(shioriScore)) {
    return toPersianNumber(shioriScore)
  }
  if (typeof malScore === 'number' && Number.isFinite(malScore)) {
    return toPersianNumber(malScore)
  }
  return null
}
