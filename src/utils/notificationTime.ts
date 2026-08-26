import { toPersianDigits } from '@/lib/persianDigits'

export const formatNotificationTime = (iso: string): string => {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diffMin = Math.floor((now - then) / 60_000)
  if (diffMin < 1) return 'همین الان'
  if (diffMin < 60) return toPersianDigits(`${diffMin} دقیقه پیش`)
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return toPersianDigits(`${diffHr} ساعت پیش`)
  const diffDay = Math.floor(diffHr / 24)
  return toPersianDigits(`${diffDay} روز پیش`)
}
