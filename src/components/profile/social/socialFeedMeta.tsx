import type { LucideIcon } from 'lucide-react'
import { LayoutList, ListPlus, MessageCircle, Play, Star } from 'lucide-react'
import type { SocialProfileFeedItem } from '@/services/socialProfile'

export type SocialFeedType = SocialProfileFeedItem['type']

type FeedMeta = {
  label: string
  Icon: LucideIcon
  pillClass: string
}

export const socialFeedMeta: Record<SocialFeedType, FeedMeta> = {
  watch_progress: {
    label: 'پیشرفت تماشا',
    Icon: Play,
    pillClass:
      'border-sky-400/30 bg-sky-400/10 text-sky-600 dark:text-sky-300',
  },
  rating: {
    label: 'نمره داد',
    Icon: Star,
    pillClass:
      'border-amber-400/35 bg-amber-400/10 text-amber-700 dark:text-amber-200',
  },
  list_add: {
    label: 'به لیست اضافه کرد',
    Icon: ListPlus,
    pillClass:
      'border-violet-400/30 bg-violet-400/10 text-violet-700 dark:text-violet-300',
  },
  anime_comment: {
    label: 'نظر گذاشت',
    Icon: MessageCircle,
    pillClass:
      'border-emerald-400/30 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300',
  },
  public_list_add: {
    label: 'لیست عمومی',
    Icon: ListPlus,
    pillClass:
      'border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-700 dark:text-fuchsia-300',
  },
  playlist_created: {
    label: 'پلی‌لیست عمومی',
    Icon: LayoutList,
    pillClass:
      'border-rose-400/30 bg-rose-400/10 text-rose-700 dark:text-rose-300',
  },
}
