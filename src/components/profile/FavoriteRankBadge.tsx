import { Crown } from 'lucide-react'
import { toPersianDigits } from '@/lib/persianDigits'
import { cn } from '@/lib/utils'

const RANK_STYLES: Record<
  1 | 2 | 3,
  { ring: string; bg: string; text: string; glow: string; label: string }
> = {
  1: {
    ring: 'ring-amber-300/80',
    bg: 'bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600',
    text: 'text-amber-950',
    glow: 'shadow-[0_0_12px_rgba(251,191,36,0.55)]',
    label: 'طلایی',
  },
  2: {
    ring: 'ring-slate-200/90',
    bg: 'bg-gradient-to-br from-slate-100 via-slate-300 to-slate-500',
    text: 'text-slate-900',
    glow: 'shadow-[0_0_10px_rgba(148,163,184,0.45)]',
    label: 'نقره‌ای',
  },
  3: {
    ring: 'ring-orange-300/70',
    bg: 'bg-gradient-to-br from-orange-200 via-orange-400 to-orange-700',
    text: 'text-orange-950',
    glow: 'shadow-[0_0_10px_rgba(251,146,60,0.4)]',
    label: 'برنزی',
  },
}

type FavoriteRankBadgeProps = {
  rank: number
  size?: 'sm' | 'md'
  className?: string
}

export const FavoriteRankBadge = ({ rank, size = 'sm', className }: FavoriteRankBadgeProps) => {
  if (rank < 1) return null

  const isPodium = rank <= 3
  const podium = isPodium ? RANK_STYLES[rank as 1 | 2 | 3] : null
  const dim = size === 'md' ? 'h-8 w-8 text-sm' : 'h-6 min-w-6 px-1 text-[11px]'

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-bold tabular-nums ring-2',
        dim,
        isPodium && podium
          ? cn(podium.bg, podium.text, podium.ring, podium.glow)
          : 'bg-muted/90 text-foreground ring-border/60',
        className
      )}
      title={isPodium ? podium!.label : undefined}
    >
      {rank === 1 ? (
        <span className="flex items-center gap-0.5">
          <Crown className={size === 'md' ? 'h-3.5 w-3.5' : 'h-3 w-3'} aria-hidden />
          {toPersianDigits(1)}
        </span>
      ) : (
        toPersianDigits(rank)
      )}
    </span>
  )
}
