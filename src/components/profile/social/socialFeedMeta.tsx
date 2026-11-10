import type { LucideIcon } from 'lucide-react'
import {
  CheckCircle2,
  LayoutList,
  ListPlus,
  MessageCircle,
  Play,
  Star,
} from 'lucide-react'
import type { SocialProfileFeedItem } from '@/services/socialProfile'

export type SocialFeedType = SocialProfileFeedItem['type']

type FeedMeta = {
  label: string
  Icon: LucideIcon
  /** Quiet 2px edge strip — only accent on the card. */
  edgeClass: string
  /** Tiny type dot next to the activity label. */
  dotClass: string
  /** Soft icon tile for playlist / non-poster media. */
  tileClass: string
}

export const socialFeedMeta: Record<SocialFeedType, FeedMeta> = {
  watch_progress: {
    label: 'پیشرفت تماشا',
    Icon: Play,
    edgeClass: 'bg-sky-500/70',
    dotClass: 'bg-sky-500',
    tileClass: 'border-sky-400/20 bg-sky-400/10 text-sky-700 dark:text-sky-300',
  },
  watch_status: {
    label: 'وضعیت تماشا',
    Icon: CheckCircle2,
    edgeClass: 'bg-indigo-500/65',
    dotClass: 'bg-indigo-500',
    tileClass: 'border-indigo-400/20 bg-indigo-400/10 text-indigo-700 dark:text-indigo-300',
  },
  rating: {
    label: 'نمره داد',
    Icon: Star,
    edgeClass: 'bg-amber-500/70',
    dotClass: 'bg-amber-500',
    tileClass: 'border-amber-400/20 bg-amber-400/10 text-amber-800 dark:text-amber-200',
  },
  list_add: {
    label: 'به لیست اضافه کرد',
    Icon: ListPlus,
    edgeClass: 'bg-violet-500/65',
    dotClass: 'bg-violet-500',
    tileClass: 'border-violet-400/20 bg-violet-400/10 text-violet-700 dark:text-violet-300',
  },
  anime_comment: {
    label: 'نظر گذاشت',
    Icon: MessageCircle,
    edgeClass: 'bg-emerald-500/70',
    dotClass: 'bg-emerald-500',
    tileClass: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-700 dark:text-emerald-300',
  },
  public_list_add: {
    label: 'لیست عمومی',
    Icon: ListPlus,
    edgeClass: 'bg-fuchsia-500/65',
    dotClass: 'bg-fuchsia-500',
    tileClass: 'border-fuchsia-400/20 bg-fuchsia-400/10 text-fuchsia-700 dark:text-fuchsia-300',
  },
  playlist_created: {
    label: 'پلی‌لیست عمومی',
    Icon: LayoutList,
    edgeClass: 'bg-rose-500/65',
    dotClass: 'bg-rose-500',
    tileClass: 'border-rose-400/20 bg-rose-400/10 text-rose-700 dark:text-rose-300',
  },
}

/** Neutral feed card shell — color comes only from the edge strip / dot. */
export const FEED_CARD_SURFACE_CLASS =
  'relative overflow-hidden rounded-2xl border border-border/55 bg-card shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]'
