import type { UserNotificationRow } from '@/types/notifications'

const SOCIAL_INBOX_KINDS = new Set([
  'social_follow',
  'comment_reply',
  'comment_like',
  'following_comment',
  'feed_activity_like',
  'feed_activity_note',
])

/** Leading Latin display name before Persian tail (e.g. "Kimia دنبالت کرد"). */
const LATIN_LEADING_NAME_RE = /^([A-Za-z0-9@._\-\s]+?)(\s+[\u0600-\u06FF].+)$/

export const formatNotificationMessage = (notification: UserNotificationRow): string => {
  const raw = notification.message?.trim() ?? ''
  if (!raw) return raw
  if (!SOCIAL_INBOX_KINDS.has(notification.kind)) return raw
  if (raw.startsWith('کاربر ') || raw.startsWith('یک کاربر')) return raw

  const match = raw.match(LATIN_LEADING_NAME_RE)
  if (match) {
    return `کاربر ${match[1].trim()}${match[2]}`
  }
  return raw
}

export const resolveNotificationTarget = (notification: UserNotificationRow): string | null => {
  const href = notification.href?.trim()
  if (href) return href
  const animeId = notification.anime_id?.trim()
  if (animeId) return `/anime/${encodeURIComponent(animeId)}`
  return null
}

export const isSocialInboxKind = (kind: string): boolean => SOCIAL_INBOX_KINDS.has(kind)
