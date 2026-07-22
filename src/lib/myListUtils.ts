import type { FavoriteProgress } from '@/store/animeStore'
import { translateAiringStatus } from '@/lib/searchFilters'

export type WatchStatus = 'planning' | 'watching' | 'completed'

export const WATCH_STATUS_LABELS: Record<WatchStatus, string> = {
  planning: 'در انتظار',
  watching: 'در حال تماشا',
  completed: 'تمام‌شده',
}

export const deriveWatchStatus = (
  progress: FavoriteProgress,
  episodesCount: number
): WatchStatus => {
  const max = Math.max(episodesCount, 1)
  if (progress.episodesWatched >= max) return 'completed'
  if (progress.episodesWatched > 0) return 'watching'
  return 'planning'
}

export const airingStatusLabel = (status?: string | null): string => {
  if (!status?.trim()) return '—'
  return translateAiringStatus(status.trim().toUpperCase())
}

const toPersianNumber = (num: number | string): string => {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return String(num).replace(/[0-9]/g, (w) => persianDigits[+w])
}

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

export { toPersianNumber }

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
