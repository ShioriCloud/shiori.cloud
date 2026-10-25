import type { SocialBadgeCatalogItem } from '@/services/socialProfile'
import { cn } from '@/lib/utils'
import { toPersianDigits } from '@/lib/persianDigits'

export const BADGE_RARITY_LABEL: Record<string, string> = {
  common: 'معمولی',
  rare: 'کمیاب',
  epic: 'حماسی',
  legendary: 'افسانه‌ای',
}

export const BADGE_RARITY_RING: Record<string, string> = {
  common: 'ring-muted-foreground/35',
  rare: 'ring-sky-400/50',
  epic: 'ring-violet-400/55',
  legendary: 'ring-amber-400/60',
}

export const formatBadgeProgress = (current: number, target: number): string => {
  if (target <= 0) return ''
  return `${toPersianDigits(current)} از ${toPersianDigits(target)}`
}

export const badgeProgressPercent = (current: number, target: number): number => {
  if (target <= 0) return 0
  return Math.min(100, Math.round((current / target) * 100))
}

type BadgeVisualProps = {
  earned: boolean
  hidden?: boolean
  imageUrl?: string | null
  title?: string
  rarity?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClass = {
  sm: 'h-14 w-14 text-lg',
  md: 'h-[4.5rem] w-[4.5rem] text-2xl',
  lg: 'h-28 w-28 text-4xl',
}

export const BadgeVisual = ({
  earned,
  hidden,
  imageUrl,
  title,
  rarity = 'common',
  size = 'md',
  className,
}: BadgeVisualProps) => {
  const showHidden = hidden && !earned
  const hasArt = Boolean(imageUrl?.trim()) && !showHidden
  const ring = BADGE_RARITY_RING[rarity] ?? BADGE_RARITY_RING.common

  return (
    <div
      className={cn(
        'relative mx-auto flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 ring-2',
        earned
          ? 'border-primary-400/40 bg-gradient-to-br from-primary-500/25 via-card to-card'
          : 'border-border/50 bg-muted/30',
        earned ? ring : 'ring-transparent',
        sizeClass[size],
        className
      )}
      aria-hidden={!earned}
    >
      {hasArt ? (
        <img
          src={imageUrl!}
          alt=""
          className={cn(
            'h-[78%] w-[78%] object-contain',
            !earned && 'opacity-40 grayscale-[35%]'
          )}
        />
      ) : earned ? (
        <span className="font-bold text-primary-200/90">
          {(title ?? '?').trim().charAt(0) || '★'}
        </span>
      ) : showHidden ? (
        <span className="font-bold text-muted-foreground">؟</span>
      ) : (
        <span className="font-bold text-muted-foreground/80">
          {(title ?? '?').trim().charAt(0) || '·'}
        </span>
      )}
    </div>
  )
}

export const BadgeProgressBar = ({
  current,
  target,
  earned,
  className,
}: {
  current: number
  target: number
  earned?: boolean
  className?: string
}) => {
  const pct = earned ? 100 : badgeProgressPercent(current, target)
  return (
    <div
      className={cn('h-1 w-full overflow-hidden rounded-full bg-muted/60', className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          'h-full rounded-full transition-all',
          earned ? 'bg-primary-400' : 'bg-foreground/70'
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export type BadgeCardModel = Pick<
  SocialBadgeCatalogItem,
  | 'id'
  | 'display_title'
  | 'title'
  | 'earned'
  | 'hidden'
  | 'hint'
  | 'progress'
  | 'image_url'
  | 'is_new'
  | 'rarity'
>
