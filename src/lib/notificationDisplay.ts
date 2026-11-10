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

/** Single-line like copy (no «پسند»); also rewrites older inbox rows. */
export const formatLikeNotificationLine = (
  notification: UserNotificationRow
): string | null => {
  if (!notification.kind.includes('like')) return null

  const title = notification.title?.trim() ?? ''
  const message = formatNotificationMessage(notification)

  const fromComment =
    message.match(/^کاربر (.+) نظرت را پسندید$/) ||
    message.match(/^کاربر (.+) نظرت رو لایک کرد$/) ||
    title.match(/^کاربر (.+) نظرت رو لایک کرد$/)
  if (notification.kind === 'comment_like' && fromComment) {
    return `کاربر ${fromComment[1].trim()} نظرت رو لایک کرد`
  }

  const fromFeed =
    message.match(/^کاربر (.+) فعالیتت را پسندید$/) ||
    message.match(/^کاربر (.+) فعالیتت رو لایک کرد$/) ||
    title.match(/^کاربر (.+) فعالیتت رو لایک کرد$/)
  if (notification.kind === 'feed_activity_like' && fromFeed) {
    return `کاربر ${fromFeed[1].trim()} فعالیتت رو لایک کرد`
  }

  if (title === 'پسند روی نظرت' || title === 'پسند روی فعالیت' || title === 'پسند روی فعالیتت') {
    return message
      .replace('پسندید', 'لایک کرد')
      .replace('را پسند', 'رو لایک')
  }
  if (title === 'فعالیتت رو پسندیدن') {
    return message.replace('پسندید', 'لایک کرد').replace('را پسند', 'رو لایک')
  }

  // Prefer one non-empty line; drop duplicate title/message.
  if (message && title && message !== title) return message
  return message || title || null
}

export const resolveNotificationTarget = (notification: UserNotificationRow): string | null => {
  const href = notification.href?.trim()
  if (href) return href
  const animeId = notification.anime_id?.trim()
  if (animeId) return `/anime/${encodeURIComponent(animeId)}`
  return null
}

export const isSocialInboxKind = (kind: string): boolean => SOCIAL_INBOX_KINDS.has(kind)
