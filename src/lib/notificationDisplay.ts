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

const extractActorName = (text: string): string | null => {
  const patterns = [
    /^کاربر (.+) نظرت را پسندید$/,
    /^کاربر (.+) نظرت رو لایک کرد$/,
    /^کاربر (.+) فعالیتت را پسندید$/,
    /^کاربر (.+) فعالیتت رو لایک کرد$/,
    /^کاربر (.+) نظرت را لایک کرد$/,
    /^کاربر (.+) فعالیتت را لایک کرد$/,
  ]
  for (const re of patterns) {
    const m = text.match(re)
    if (m?.[1]) return m[1].trim()
  }
  return null
}

const rewritePasand = (text: string): string =>
  text
    .replace(/پسندید/g, 'لایک کرد')
    .replace(/را پسند/g, 'رو لایک')
    .replace(/رو پسند/g, 'رو لایک')
    .replace(/پسندیدن/g, 'لایک کردن')

/** Single-line like copy (no «پسند»); also rewrites older inbox rows. */
export const formatLikeNotificationLine = (
  notification: UserNotificationRow
): string | null => {
  if (!notification.kind.includes('like')) return null

  const title = notification.title?.trim() ?? ''
  const message = formatNotificationMessage(notification)

  const nameFromMessage = extractActorName(message)
  const nameFromTitle = extractActorName(title)
  const name = nameFromMessage || nameFromTitle

  if (notification.kind === 'comment_like') {
    if (name) return `کاربر ${name} نظرت رو لایک کرد`
    if (
      title === 'پسند روی نظرت' ||
      title.includes('پسند') ||
      message.includes('پسند')
    ) {
      const rewritten = rewritePasand(message || title)
      if (rewritten.startsWith('کاربر ')) return rewritten
      return message ? rewritePasand(message) : 'نظرت رو لایک کردند'
    }
  }

  if (notification.kind === 'feed_activity_like') {
    if (name) return `کاربر ${name} فعالیتت رو لایک کرد`
    if (
      title === 'پسند روی فعالیت' ||
      title === 'پسند روی فعالیتت' ||
      title === 'فعالیتت رو پسندیدن' ||
      title.includes('پسند') ||
      message.includes('پسند')
    ) {
      const rewritten = rewritePasand(message || title)
      if (rewritten.startsWith('کاربر ')) return rewritten
      return message ? rewritePasand(message) : 'فعالیتت رو لایک کردند'
    }
  }

  // Prefer one non-empty line; drop duplicate title/message.
  if (message && title && message !== title) return rewritePasand(message)
  return rewritePasand(message || title) || null
}

export const resolveNotificationTarget = (notification: UserNotificationRow): string | null => {
  const href = notification.href?.trim()
  if (href) return href
  const animeId = notification.anime_id?.trim()
  if (animeId) return `/anime/${encodeURIComponent(animeId)}`
  return null
}

export const isSocialInboxKind = (kind: string): boolean => SOCIAL_INBOX_KINDS.has(kind)
